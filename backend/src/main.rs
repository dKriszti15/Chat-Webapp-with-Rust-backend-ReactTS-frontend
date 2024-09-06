use dotenv::dotenv;
use secrecy::Secret;
use sqlx::mysql::MySqlPoolOptions;
use std::{env, net::TcpListener};
use uuid::Uuid;
use backend::{
    run,
    telemetry::{create_subscriber, init_subscriber},
};

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    dotenv().ok();

    let subsciber = create_subscriber("daczk".into(), "info".into());
    init_subscriber(subsciber);

    let db_url = std::env::var("DATABASE_URL").expect("No DATABASE_URL set");
    let pool = MySqlPoolOptions::new()
        .max_connections(150)
        .connect(&db_url)
        .await
        .expect("Error creating a pool");

    run(
        TcpListener::bind("127.0.0.1:8080")?,
        pool,
        Secret::new(env::var("JWT_SECRET").unwrap_or(Uuid::new_v4().to_string())),
    )?
    .await
}
