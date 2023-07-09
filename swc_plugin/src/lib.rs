#![feature(let_chains)]
use std::collections::HashMap;
pub mod config;
use config::Config;
use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::{
    ArrayLit, Callee, ExprOrSpread, ImportDecl, ImportNamedSpecifier,
    ImportSpecifier, KeyValueProp, Module, ModuleDecl, ModuleItem,
    ObjectLit, Prop, PropName, PropOrSpread, Str,
};
use swc_core::ecma::utils::{prepend_stmt, swc_common, ExprExt};

use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use swc_core::{
    ecma::{
        ast::{CallExpr, Expr, Ident, Program},
        visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
    },
};

pub struct TransformVisitor {
    imports: HashMap<String, Ident>,
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
    pub fn insert_imports(&mut self, module: &mut Module) {
        let mut entries = self.imports.drain().collect::<Vec<_>>();
        entries.sort_by(|(a, _), (b, _)| a.cmp(b));
        for (name, val) in entries {
            prepend_stmt(
                &mut module.body,
                ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
                    specifiers: vec![ImportSpecifier::Named(ImportNamedSpecifier {
                        local: val,
                        imported: None,
                        span: DUMMY_SP,
                        is_type_only: false,
                    })],
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
                    let first_arg = &mut args[0];
                    if let Expr::Object(obj) = first_arg.expr.as_expr() {
                        let mut new_props: Vec<PropOrSpread> = vec![];
                        for prop_spread in obj.props.clone() {
                            if let PropOrSpread::Prop(prop) = &prop_spread {
                                if let Prop::KeyValue(key_value_prop) = &**prop && let Some(i) = key_value_prop.key.as_ident() {
                                    if i.sym.to_string() == "plugins" && let Expr::Array(arr_lit) = &*key_value_prop.value{
                                        let mut elems: Vec<Option<ExprOrSpread>> = arr_lit.elems.clone();
                                        for (name, import_path) in self.config.additional_plugins.clone(){
                                            elems.push(Some(ExprOrSpread {
                                                spread: None,
                                                expr: Box::new(Expr::Call(CallExpr{
                                                    span: Default::default(),
                                                    callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(name.clone().into(), swc_common::DUMMY_SP)))),
                                                    args: vec![],
                                                    type_args: None,
                                                })),
                                            }));
                                            // Add to imports
                                            self.imports.insert(import_path, Ident::new(name.into(), swc_common::DUMMY_SP));
                                        }
                                        // Building new prop
                                        let new_prop = PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                                            key: PropName::Ident(Ident::new("plugins".into(), swc_common::DUMMY_SP)),
                                            value: Box::new(Expr::Array(ArrayLit {
                                                span: Default::default(),
                                                elems,
                                            })),
                                        })));
                                        new_props.push(new_prop);
                                    }
                                    else{
                                        new_props.push(prop_spread);
                                    }
                                }
                                else{
                                    new_props.push(prop_spread);
                                }
                            } else {
                                new_props.push(prop_spread);
                            }
                        }
                        // Can add new props to the obj here
                        first_arg.expr = Box::new(Expr::Object(ObjectLit {
                            span: Default::default(),
                            props: new_props,
                        }))
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
