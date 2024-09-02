// AuthError

use std::fmt::Display;

use actix_web::http::StatusCode;
use actix_web::ResponseError;
use tokio::task::JoinError;
use validator::ValidationError;

use crate::db::error::DbError;

#[derive(Debug)]
pub enum AuthError {
    DbError(DbError),
    ArgonError(argon2::password_hash::Error),
    UnexpectedFailure(&'static str),
    ValidationError(ValidationError),
}

// TODO: decouple DB part from controller part

impl Display for AuthError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AuthError::DbError(DbError::UserError(_))
            | AuthError::ArgonError(argon2::password_hash::Error::Password) => {
                write!(f, "The username or password does not match any known user.")
            }
            AuthError::DbError(err) => write!(f, "{err}"),
            AuthError::ArgonError(_) | AuthError::UnexpectedFailure(_) => {
                write!(f, "There was an error on the server side")
            }
            AuthError::ValidationError(err) => write!(f, "{}", err.code),
        }
    }
}

impl ResponseError for AuthError {
    fn status_code(&self) -> StatusCode {
        match self {
            AuthError::DbError(DbError::UserError(_)) => StatusCode::UNAUTHORIZED,
            AuthError::DbError(_err) => StatusCode::INTERNAL_SERVER_ERROR,
            AuthError::ArgonError(argon2::password_hash::Error::Password) => {
                StatusCode::UNAUTHORIZED
            }
            AuthError::ArgonError(_) | AuthError::UnexpectedFailure(_) => {
                StatusCode::INTERNAL_SERVER_ERROR
            }
            AuthError::ValidationError(_) => StatusCode::BAD_REQUEST,
        }
    }
}

impl From<sqlx::Error> for AuthError {
    fn from(value: sqlx::Error) -> Self {
        Self::DbError(DbError::from(value))
    }
}

impl From<DbError> for AuthError {
    fn from(value: DbError) -> Self {
        Self::DbError(value)
    }
}

impl From<argon2::password_hash::Error> for AuthError {
    fn from(value: argon2::password_hash::Error) -> Self {
        Self::ArgonError(value)
    }
}

impl From<JoinError> for AuthError {
    fn from(_value: JoinError) -> AuthError {
        Self::UnexpectedFailure("Join error")
    }
}

impl From<jsonwebtoken::errors::Error> for AuthError {
    fn from(_value: jsonwebtoken::errors::Error) -> AuthError {
        Self::UnexpectedFailure("JWT error")
    }
}

impl From<ValidationError> for AuthError {
    fn from(value: ValidationError) -> Self {
        Self::ValidationError(value)
    }
}
