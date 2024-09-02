use std::fmt::Display;

use actix_web::http::StatusCode;
use actix_web::ResponseError;
use validator::ValidationError;

use crate::db::error::DbError;

use super::NotFoundError;

#[derive(Debug)]
pub enum AdminError {
    DbError(DbError),
    NotFoundError(NotFoundError),
    Unauthenticated(&'static str),
    Unauthorized(&'static str),
    ValidationError(ValidationError),
    UnexpectedFailure(&'static str),
    RenewalRequired(),
}

impl Display for AdminError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AdminError::DbError(err) => write!(f, "{err}"),
            AdminError::NotFoundError(err) => write!(f, "{err}"),
            AdminError::Unauthenticated(_) => write!(f, "You are not authenticated!"),
            AdminError::Unauthorized(_) => write!(f, "You are not authorized to do this action!"),
            AdminError::ValidationError(err) => write!(f, "{}", err.code),
            AdminError::UnexpectedFailure(_) => write!(f, "Internal server error"),
            AdminError::RenewalRequired() => write!(f, "Renewal required!"),
        }
    }
}

impl ResponseError for AdminError {
    fn status_code(&self) -> StatusCode {
        match self {
            AdminError::DbError(err) => err.status_code(),
            AdminError::NotFoundError(err) => err.status_code(),
            AdminError::Unauthenticated(_) => StatusCode::UNAUTHORIZED,
            AdminError::Unauthorized(_) => StatusCode::FORBIDDEN,
            AdminError::ValidationError(_) => StatusCode::BAD_REQUEST,
            AdminError::UnexpectedFailure(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AdminError::RenewalRequired() => StatusCode::FORBIDDEN,
        }
    }
}

impl From<sqlx::Error> for AdminError {
    fn from(value: sqlx::Error) -> Self {
        Self::DbError(DbError::from(value))
    }
}
impl From<DbError> for AdminError {
    fn from(value: DbError) -> Self {
        Self::DbError(value)
    }
}
