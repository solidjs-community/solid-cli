use serde::{Deserialize, Serialize};
pub trait Testing {
    fn test() -> Self;
}
#[derive(Serialize, Deserialize)]
#[derive(Default)]
pub struct Config {
    pub additional_plugins: Vec<(String, String)>,
}


impl Testing for Config {
    fn test() -> Self {
        Self {
            additional_plugins: vec![("UnoCSS".to_string(), "unocss/vite".to_string())],
        }
    }
}
