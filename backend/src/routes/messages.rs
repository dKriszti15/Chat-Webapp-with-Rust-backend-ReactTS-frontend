use crate::{db::message::save_message, AppState};
use actix_web::{
    post,
    web::{Data, Json},
    HttpResponse, Responder,
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


pub fn message_router() -> actix_web::Scope{
    actix_web::web::scope("/messages")
        .service(save_message_service)
}