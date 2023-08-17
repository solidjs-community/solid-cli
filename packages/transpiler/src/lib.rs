use std::sync::Arc;

use napi_derive::napi;
use swc_core::{
  common::{
    errors::{ColorConfig, Handler},
    FileName, Mark, SourceMap, GLOBALS,
  },
  ecma::{
    ast::EsVersion,
    parser::{Syntax, TsConfig},
    visit::FoldWith,
  },
};
use swc_ecma_transforms_typescript::strip;
#[napi]
pub fn transpile(code: String, id: String) -> String {
  let cm: Arc<SourceMap> = Arc::<SourceMap>::default();
  let handler: Handler =
    Handler::with_tty_emitter(ColorConfig::Auto, true, false, Some(cm.clone()));
  let compiler: swc::Compiler = swc::Compiler::new(cm.clone());

  let fm: Arc<swc_core::common::SourceFile> = cm.new_source_file(FileName::Custom(id), code);
  GLOBALS.set(&Default::default(), || {
    let result = compiler.parse_js(
      fm,
      &handler,
      EsVersion::EsNext,
      // Syntax::Es(EsConfig {
      //   jsx: true,
      //   ..Default::default()
      // }),
      Syntax::Typescript(TsConfig {
        tsx: true,
        decorators: false,
        dts: false,
        no_early_errors: false,
        disallow_ambiguous_jsx_like: true,
      }),
      swc::config::IsModule::Bool(true),
      None,
    );
    let top_level_mark = Mark::new();
    let result = result.unwrap().fold_with(&mut strip(top_level_mark));
    let out = compiler.print(
      &result,
      None,
      None,
      false,
      EsVersion::Es2015,
      swc::config::SourceMapsConfig::Bool(false),
      &Default::default(),
      None,
      false,
      None,
      false,
      false,
      "",
    );
    out.unwrap().code
  })
}
