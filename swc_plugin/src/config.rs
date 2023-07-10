use serde::{Deserialize, Serialize};
pub trait Testing {
    fn test() -> Self;
}
#[derive(Serialize, Deserialize, Default)]
pub struct Config {
    pub additional_plugins: Vec<(String, String, bool)>,
}

impl Testing for Config {
    fn test() -> Self {
        Self {
            additional_plugins: vec![("UnoCss".to_string(), "unocss/vite".to_string(), true)],
        }
    }
}
