use std::net::TcpListener;

use actix_cors::Cors;
use actix_web::{
    dev::Server, get, http, middleware, web::Data, App, HttpResponse, HttpServer, Responder,
};
use routes::{admin_router, auth_router, message_router};
use secrecy::Secret;
use sqlx::{MySql, Pool};
use tracing_actix_web::TracingLogger;

pub mod db;
pub mod models;
mod routes;
pub mod telemetry;
pub mod traits;

#[get("/health_check")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok()
}
pub struct AppState {
    db: Pool<MySql>,
    jwt_secret: Secret<String>,
}

pub fn run(
    listener: TcpListener,
    pool: Pool<MySql>,
    jwt_secret: Secret<String>,
) -> Result<Server, std::io::Error> {
    let server = HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_origin_fn(|origin, _req_head| origin.as_bytes().ends_with(b".localhost"))
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600);

        App::new()
            .app_data(Data::new(AppState {
                db: pool.clone(),
                jwt_secret: jwt_secret.clone(),
            }))
            .wrap(cors)
            .wrap(middleware::NormalizePath::trim())
            .wrap(TracingLogger::default())
            .service(health_check)
            .service(
                actix_web::web::scope("/api")
                    .service(auth_router())
                    .service(admin_router())
                    .service(message_router())

            )
    })
    .listen(listener)?
    .run();

    Ok(server)
}
