use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct MessageInDTO {
    pub from_user: String,
    pub to_user: String,
    pub msg: String,
    pub date_time: String,
}
