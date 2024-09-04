use argon2::{password_hash::SaltString, Algorithm, Argon2, Params, PasswordHasher, Version};
use secrecy::{ExposeSecret, Secret};
use sqlx::{MySql, Pool, Row};
use uuid::Uuid;

use crate::{
    models::{
        dto::indto::{user::PasswordChecked, UserInDTO},
        parts::{DisplayName, Username},
        User,
    },
    routes::errors::AuthError,
    traits::ToSqlParam,
};

use super::error::DbError;

macro_rules! user_from_record {
    ($row: expr) => {
        User {
            user_id: $row.user_id,
            username: Username::new($row.username).expect("Username from database is not valid!"),
            password: Some(Secret::new($row.password)),
            admin: $row.admin > 0,
            exp: None,
            display_name: DisplayName::new($row.display_name)
                .expect("Display name from database is not valid!"),
        }
    };
}

fn map_row_to_user(row: sqlx::mysql::MySqlRow) -> User {
    User {
        // Cannot get by name because of the recast
        user_id: row.get(0),
        username: Username::new(row.get::<String, &str>("username"))
            .expect("Username from database is not valid!"),
        password: Some(Secret::new(row.get("password"))),
        admin: row.get::<i32, &str>("admin") > 0,
        exp: None,
        display_name: DisplayName::new(row.get::<String, &str>("display_name"))
            .expect("Display name from database is not valid!"),
    }
}

pub async fn register(
    user: UserInDTO<PasswordChecked>,
    pool: &Pool<MySql>,
) -> Result<Uuid, AuthError> {
    let salt = SaltString::generate(&mut rand::thread_rng());
    let hash = Argon2::new(
        Algorithm::Argon2id,
        Version::V0x13,
        Params::new(15000, 2, 1, None).unwrap(),
    )
    .hash_password(user.password.expose_secret().as_bytes(), &salt)?;

    let uuid = sqlx::query!(
        r#"INSERT INTO users (user_id, display_name, username, password, admin) VALUES (UUID(), ?, ?, ?, 0) RETURNING user_id"#,
        user.display_name.to_param(),
        user.username.to_param(),
        hash.to_string(),
    )
    .fetch_one(pool)
    .await
    .map(|x| Uuid::parse_str(x.get::<&str, usize>(0)).unwrap())?;

    Ok(uuid)
}

pub async fn promote(user_id: &Uuid, pool: &Pool<MySql>) -> Result<bool, DbError> {
    let result = sqlx::query!(r#"UPDATE users SET admin = 1 WHERE user_id = ?"#, user_id)
        .execute(pool)
        .await?;

    Ok(result.rows_affected() > 0)
}

pub async fn demote(user_id: &Uuid, pool: &Pool<MySql>) -> Result<bool, DbError> {
    let result = sqlx::query!(r#"UPDATE users SET admin = 0 WHERE user_id = ?"#, user_id)
        .execute(pool)
        .await?;

    Ok(result.rows_affected() > 0)
}

pub async fn get_user_by_name(username: &str, pool: &Pool<MySql>) -> Result<User, sqlx::Error> {
    sqlx::query!(
    r#"SELECT UNHEX(REPLACE(user_id, '-', '')) AS "user_id!:Uuid", display_name, username, password, admin FROM users WHERE username = ?"#,
    username,
    ).fetch_one(pool)
    .await
    .map(|row| {
        user_from_record!(row)
    })
}

pub async fn remove_user(username: &str, pool: &Pool<MySql>) -> Result<(), sqlx::Error> {
    sqlx::query!(r#"DELETE FROM users WHERE username = ? "#, username)
        .execute(pool)
        .await
        .map(|_| ())
}

pub async fn find_all(pool: &Pool<MySql>) -> Result<Vec<User>, sqlx::Error> {
    sqlx::query(
        r#"SELECT UNHEX(REPLACE(user_id, '-', '')) AS "user_id!:Uuid", display_name, username, password, admin FROM users"#,
        )
        .map(map_row_to_user)
        .fetch_all(pool)
        .await
}
