use std::fmt::Display;

use sqlx::error::DatabaseError;

#[derive(Debug)]
pub enum DbError {
    ServerError(sqlx::Error),
    UserError(Box<dyn DatabaseError>),
}

impl From<sqlx::Error> for DbError {
    fn from(value: sqlx::Error) -> Self {
        if let sqlx::Error::Database(a) = value {
            return DbError::UserError(a);
        }

        DbError::ServerError(value)
    }
}

impl Display for DbError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DbError::ServerError(_a) => write!(f, "There was an error on the server side."),
            DbError::UserError(_a) => write!(f, "The given inputs produced an error!"),
        }
    }
}
