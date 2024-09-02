use secrecy::Secret;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct LoginCredentials {
    pub username: String,
    pub password: Secret<String>,
}
