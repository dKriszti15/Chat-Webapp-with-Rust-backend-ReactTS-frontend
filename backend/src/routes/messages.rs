use crate::routes::errors::AdminError;
use crate::{db::message::{save_message, find_all}, AppState};
use actix_web::{
    post, get,
    web::{Data, Json},
    HttpRequest, HttpResponse, Responder,
};

use crate::models::dto::indto::MessageInDTO;

#[tracing::instrument(name = "Message saving attempt", skip(state))]
#[post("/save")]
async fn save_message_service(
    state: Data<AppState>,
    data: Json<MessageInDTO>,
) -> impl Responder {

    let message = data.into_inner();

    save_message(message, &state.db).await.map(|_| HttpResponse::Ok())
}

#[tracing::instrument(name = "Message loading attempt", skip(state))]
#[get("/load-all")]
async fn load_messages_service(state: Data<AppState>, req: HttpRequest) -> Result<HttpResponse, AdminError> {

    let messages = find_all(&state.db).await?;

    Ok(HttpResponse::Ok().json(messages))
}

pub fn message_router() -> actix_web::Scope{
    actix_web::web::scope("/messages")
        .service(save_message_service)
        .service(load_messages_service)
}