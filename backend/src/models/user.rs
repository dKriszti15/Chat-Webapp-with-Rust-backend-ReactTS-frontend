use secrecy::Secret;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::parts::{DisplayName, Username};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub user_id: Uuid,
    pub display_name: DisplayName,
    pub username: Username,
    #[serde(skip_serializing, skip_deserializing)]
    pub password: Option<Secret<String>>,
    pub admin: bool,
    pub exp: Option<i64>,
}
