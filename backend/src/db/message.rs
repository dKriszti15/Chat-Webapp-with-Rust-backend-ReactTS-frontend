
use sqlx::{MySql, Pool, Row};
use uuid::Uuid;

use crate::{
    models::{dto::indto::message::MessageInDTO, Message},
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

fn map_row_to_message(row: sqlx::mysql::MySqlRow) -> Message {
    Message {
        message_id: row.get(0),
        from_user: row.get::<String, &str>("from_user"),
        to_user: row.get::<String, &str>("to_user"),
        msg: row.get::<String, &str>("msg"),
        date_time: row.get::<String, &str>("date_time"),
        
    }
}

pub async fn find_all(pool: &Pool<MySql>) -> Result<Vec<Message>, sqlx::Error> {
    sqlx::query(
        r#"SELECT UNHEX(REPLACE(message_id, '-', '')) AS "message_id!:Uuid", from_user, to_user, msg, date_time FROM messages ORDER BY date_time ASC"#,
        )
        .map(map_row_to_message)
        .fetch_all(pool)
        .await
}