use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
pub trait Testing {
    fn test() -> Self;
}
#[derive(Serialize, Deserialize, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PluginConfig {
    pub import_name: String,
    pub import_source: String,
    pub is_default: bool,
    pub options: Value,
}

impl PluginConfig {
    fn test() -> Self {
        Self {
            import_name: "UnoCss".to_string(),
            import_source: "unocss/vite".to_string(),
            is_default: true,
            options: json!({}),
        }
    }
}

#[derive(Serialize, Deserialize, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub additional_plugins: Vec<PluginConfig>,
    pub force_transform: bool,
    pub merge_configs: bool,
}
impl Testing for Config {
    fn test() -> Self {
        Self {
            additional_plugins: vec![PluginConfig::test()],
            force_transform: true,
            merge_configs: false,
        }
    }
}
