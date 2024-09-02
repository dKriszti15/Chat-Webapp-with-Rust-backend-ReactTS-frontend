use std::fmt::Display;

use actix_web::http::StatusCode;
use actix_web::ResponseError;

#[derive(Debug, Default)]
pub struct NotFoundError {
    pub resource_id: String,
}

impl Display for NotFoundError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "The requested resource {} was not found!",
            self.resource_id
        )
    }
}

impl ResponseError for NotFoundError {
    fn status_code(&self) -> StatusCode {
        StatusCode::NOT_FOUND
    }
}
