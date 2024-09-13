use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub message_id: Uuid,
    pub from_user: String,
    pub to_user: String,
    pub msg: String,
    pub date_time: String,
}
