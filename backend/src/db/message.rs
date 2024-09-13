use sqlx::{MySql, Pool, Row};
use uuid::Uuid;

use crate::{
    models::dto::indto::message::MessageInDTO,
    routes::errors::AuthError,
    traits::ToSqlParam,
};

pub async fn save_message(
    message: MessageInDTO,
    pool: &Pool<MySql>,
) -> Result<Uuid, AuthError> {
    
    let uuid = sqlx::query!(
        r#"INSERT INTO messages (message_id, from_user, to_user, msg, date_time) VALUES (UUID(), ?, ?, ?, ?) RETURNING message_id"#,
        message.from_user.to_param(),
        message.to_user.to_param(),
        message.msg.to_param(),
        message.date_time.to_param()
    )
    .fetch_one(pool)
    .await
    .map(|x| Uuid::parse_str(x.get::<&str, usize>(0)).unwrap())?;

    Ok(uuid)
}