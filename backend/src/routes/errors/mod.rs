mod admin;
mod auth;
mod notfound;

pub use admin::AdminError;
pub use auth::AuthError;
pub use notfound::NotFoundError;

use crate::db::error::DbError;

use actix_web::http::StatusCode;
use actix_web::ResponseError;

// Ugly hack, really should be it's own type
impl ResponseError for DbError {
    fn status_code(&self) -> StatusCode {
        match self {
            Self::UserError(_) => StatusCode::BAD_REQUEST,
            Self::ServerError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}
