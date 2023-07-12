use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
pub trait Testing {
    fn test() -> Self;
}
#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Config {
    pub additional_plugins: Vec<(String, String, bool, Value)>,
    pub force_transform: bool,
}

impl Testing for Config {
    fn test() -> Self {
        Self {
            additional_plugins: vec![(
                "UnoCss".to_string(),
                "unocss/vite".to_string(),
                true,
                json!({}),
            )],
            force_transform: true,
        }
    }
}
