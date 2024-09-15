use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Message {
    pub message_id: Uuid,
    pub from_user: String,
    pub to_user: String,
    pub msg: String,
    pub date_time: String,
}
