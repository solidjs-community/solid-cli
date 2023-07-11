#![feature(let_chains)]
use std::collections::HashMap;
pub mod config;
use config::Config;
use serde_json::Value;
use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::{
    ArrayLit, Bool, Callee, ExprOrSpread, Import, ImportDecl, ImportDefaultSpecifier,
    ImportNamedSpecifier, ImportSpecifier, KeyValueProp, Lit, Module, ModuleDecl, ModuleItem, Null,
    ObjectLit, Prop, PropName, PropOrSpread, Str,
};
use swc_core::ecma::transforms::testing::parse_options;
use swc_core::ecma::utils::{prepend_stmt, swc_common, ExprExt};

use swc_core::ecma::{
    ast::{CallExpr, Expr, Ident, Program},
    visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
};
use swc_core::plugin::errors::HANDLER;
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};

pub struct TransformVisitor {
    original_imports: Vec<ImportSpecifier>,
    new_imports: HashMap<String, (Ident, bool)>,
    config: Config,
}
impl TransformVisitor {
    pub fn new(config: Config) -> Self {
        Self {
            original_imports: Default::default(),
            new_imports: Default::default(),
            config,
        }
    }
}
/**
 * Converts from serde_json's `Value` format to an swc `Expr`, which can then just be passed
 */
fn to_expr(val: Value) -> Expr {
    match val {
        Value::Null => Expr::Lit(Lit::Null(Null { span: DUMMY_SP })),
        Value::Number(n) => Expr::Lit(Lit::Num(n.as_f64().unwrap().into())),
        Value::Bool(b) => Expr::Lit(Lit::Bool(Bool {
            span: DUMMY_SP,
            value: b,
        })),
        Value::String(s) => Expr::Lit(Lit::Str(Str {
            span: DUMMY_SP,
            value: s.into(),
            raw: None,
        })),
        Value::Array(arr) => Expr::Array(ArrayLit {
            span: DUMMY_SP,
            elems: arr
                .into_iter()
                .map(|v| {
                    Some(ExprOrSpread {
                        spread: None,
                        expr: Box::new(to_expr(v)),
                    })
                })
                .collect(),
        }),
        Value::Object(obj) => Expr::Object(ObjectLit {
            span: DUMMY_SP,
            props: obj
                .into_iter()
                .map(|(k, v)| {
                    PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(Ident::new(k.into(), DUMMY_SP)),
                        value: Box::new(to_expr(v)),
                    })))
                })
                .collect(),
        }),
    }
}
impl TransformVisitor {
    // Taken almost verbatim from https://github.com/modderme123/swc-plugin-jsx-dom-expressions
    pub fn insert_imports(&mut self, module: &mut Module) {
        let mut entries = self.new_imports.drain().collect::<Vec<_>>();
        entries.sort_by(|(a, _), (b, _)| a.cmp(b));
        for (name, val) in entries {
            let specifier = if val.1 {
                ImportSpecifier::Default(ImportDefaultSpecifier {
                    local: val.0,
                    span: DUMMY_SP,
                })
            } else {
                ImportSpecifier::Named(ImportNamedSpecifier {
                    local: val.0,
                    imported: None,
                    span: DUMMY_SP,
                    is_type_only: false,
                })
            };
            prepend_stmt(
                &mut module.body,
                ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
                    specifiers: vec![specifier],
                    src: Box::new(Str {
                        span: DUMMY_SP,
                        value: name.into(),
                        raw: None,
                    }),
                    span: DUMMY_SP,
                    type_only: false,
                    asserts: None,
                })),
            );
        }
    }
}
fn is_plugin_already_added(elems: &Vec<Option<ExprOrSpread>>, plugin_name: &str) -> i32{
    for n in 0..elems.iter().len() {
        let elem = &elems[n];
        // Assuming that plugins are always call expressions, and always imported as such
        // Can be fixed in the future by just visiting with self, and collecting all the identifiers that we find
        if let Some(elem) = elem && let Expr::Call(call_expr) = elem.expr.as_expr() {
            if let Expr::Ident(i) = &**call_expr.callee.as_expr().unwrap(){
                // Function name is the same (should be fine for now, should really check if the imports are coming from the same place)
                if plugin_name == i.sym.as_ref() {
                    // Plugin already exists, so we don't need to add it
                    return n.try_into().unwrap();
                }
            }
            
        }
    };
    -1
} 
fn add_new_plugins(visitor: &mut TransformVisitor, arr_lit: &ArrayLit) -> PropOrSpread {
    let mut elems: Vec<Option<ExprOrSpread>> = arr_lit.elems.clone();
    for (name, import_path, is_default_import, extra_config) in
        visitor.config.additional_plugins.clone()
    {
        // Checking if plugin already exists
        let ind = is_plugin_already_added(&elems, &name);
        if ind != -1 && !visitor.config.force_transform{
            HANDLER.with(|handler| {
                handler.struct_span_err(
                    DUMMY_SP,
                    "Plugin already exists, and force_transform is not enabled",
                )
                .emit()
            });
        }
        let plugin_expr = Some(ExprOrSpread {
            spread: None,
            expr: Box::new(Expr::Call(CallExpr {
                span: Default::default(),
                callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                    name.clone().into(),
                    swc_common::DUMMY_SP,
                )))),
                args: vec![ExprOrSpread {
                    spread: None,
                    expr: Box::new(to_expr(extra_config)),
                }],
                type_args: None,
            })),
        });
        // The plugin must already exist, so we can just mutate what's already there
        if ind != -1 {
            elems[ind as usize] = plugin_expr;
            continue;
        }
        elems.push(plugin_expr);
        // Add to imports
        visitor.new_imports.insert(
            import_path,
            (
                Ident::new(name.into(), swc_common::DUMMY_SP),
                is_default_import,
            ),
        );
    }
    // Building new prop
    PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
        key: PropName::Ident(Ident::new("plugins".into(), swc_common::DUMMY_SP)),
        value: Box::new(Expr::Array(ArrayLit {
            span: Default::default(),
            elems,
        })),
    })))
}
fn update_argument(visitor: &mut TransformVisitor, arg: &mut ExprOrSpread) {
    if let Expr::Object(obj) = arg.expr.as_expr() {
        let mut new_props: Vec<PropOrSpread> = obj.props.clone();
        let mut mutated_existing = false;

        for prop_spread in new_props.iter_mut() {
            if let PropOrSpread::Prop(prop) = prop_spread {
                if let Prop::KeyValue(key_value_prop) = &**prop && let Some(i) = key_value_prop.key.as_ident() {
                    if i.sym.to_string() == "plugins" && let Expr::Array(arr_lit) = &*key_value_prop.value {
                        // Check if the desired plugin exists.

                        *prop_spread = add_new_plugins(visitor, arr_lit);
                        mutated_existing = true;
                    }
                }
            }
        }
        if !mutated_existing {
            // `plugins` prop doesn't exist. So we need to create it
            new_props.push(add_new_plugins(
                visitor,
                &ArrayLit {
                    span: Default::default(),
                    elems: vec![],
                },
            ));
        }
        // Can add new props to the obj here
        arg.expr = Box::new(Expr::Object(ObjectLit {
            span: Default::default(),
            props: new_props,
        }))
    }
}
impl VisitMut for TransformVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html

    fn visit_mut_call_expr(&mut self, call_expr: &mut CallExpr) {
        if let Expr::Ident(i) = &**call_expr.callee.as_expr().unwrap() {
            if i.sym.to_string() == "defineConfig" {
                let config_arg = &mut call_expr.args[0];
                update_argument(self, config_arg);
            }
        }
    }
    fn visit_mut_import_specifier(&mut self, n: &mut ImportSpecifier) {
        self.original_imports.push(n.clone());
    }
    fn visit_mut_module(&mut self, module: &mut Module) {
        module.visit_mut_children_with(self);
        self.insert_imports(module);
    }
}

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let plugin_config = metadata.get_transform_plugin_config();
    let config: config::Config = plugin_config
        .and_then(|json| serde_json::from_str(&json).ok())
        .unwrap();
    program.fold_with(&mut as_folder(TransformVisitor::new(config)))
}
