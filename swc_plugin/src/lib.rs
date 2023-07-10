#![feature(let_chains)]
use std::collections::HashMap;
pub mod config;
use config::Config;
use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::{
    ArrayLit, Callee, ExprOrSpread, ImportDecl, ImportDefaultSpecifier, ImportNamedSpecifier,
    ImportSpecifier, KeyValueProp, Module, ModuleDecl, ModuleItem, ObjectLit, Prop, PropName,
    PropOrSpread, Str,
};
use swc_core::ecma::utils::{prepend_stmt, swc_common, ExprExt};

use swc_core::ecma::{
    ast::{CallExpr, Expr, Ident, Program},
    visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};

pub struct TransformVisitor {
    imports: HashMap<String, (Ident, bool)>,
    config: Config,
}
impl TransformVisitor {
    pub fn new(config: Config) -> Self {
        Self {
            imports: Default::default(),
            config,
        }
    }
}
impl TransformVisitor {
    // Taken almost verbatim from https://github.com/modderme123/swc-plugin-jsx-dom-expressions
    pub fn insert_imports(&mut self, module: &mut Module) {
        let mut entries = self.imports.drain().collect::<Vec<_>>();
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
fn add_new_plugins(visitor: &mut TransformVisitor, arr_lit: &ArrayLit) -> PropOrSpread {
    let mut elems: Vec<Option<ExprOrSpread>> = arr_lit.elems.clone();
    for (name, import_path, is_default_import) in visitor.config.additional_plugins.clone() {
        elems.push(Some(ExprOrSpread {
            spread: None,
            expr: Box::new(Expr::Call(CallExpr {
                span: Default::default(),
                callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                    name.clone().into(),
                    swc_common::DUMMY_SP,
                )))),
                args: vec![],
                type_args: None,
            })),
        }));
        // Add to imports
        visitor.imports.insert(
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
        for n in 0..new_props.len() {
            let prop_spread = &new_props[n];
            if let PropOrSpread::Prop(prop) = &prop_spread {
                if let Prop::KeyValue(key_value_prop) = &**prop && let Some(i) = key_value_prop.key.as_ident() {
                    if i.sym.to_string() == "plugins" && let Expr::Array(arr_lit) = &*key_value_prop.value {
                        new_props[n] = add_new_plugins(visitor, arr_lit);
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

    fn visit_mut_expr(&mut self, e: &mut Expr) {
        e.visit_mut_children_with(self);
        if let Expr::Call(call_expr) = e {
            if let Expr::Ident(i) = &**call_expr.callee.as_expr().unwrap() {
                if i.sym.to_string() == "defineConfig" {
                    let args = &mut call_expr.args;
                    for arg in args {
                        update_argument(self, arg);
                    }
                }
            }
        }
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
