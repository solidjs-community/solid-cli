use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub enum Action {
    PrependStmt,
}
#[derive(Debug, Deserialize)]
pub struct Config {
    actions: Vec<Action>,
}
pub trait Test {
    fn test() -> Self;
}
impl Test for Config {
    fn test() -> Config {
        Config {
            actions: vec![Action::PrependStmt],
        }
    }
}
