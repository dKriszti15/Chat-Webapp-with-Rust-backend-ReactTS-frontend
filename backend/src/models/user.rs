use secrecy::Secret;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::parts::{DisplayName, Username};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub user_id: Uuid,
    pub username: Username,
    pub display_name: DisplayName,
    pub email: String,
    #[serde(skip_serializing, skip_deserializing)]
    pub password: Option<Secret<String>>,
    pub admin: bool,
    pub active: bool,
    pub exp: Option<i64>,
}
