use actix_web::{
    post,
    web::{Data, Json},
    HttpRequest, HttpResponse, Responder,
};
use argon2::{Argon2, PasswordHash, PasswordVerifier};
use chrono::Days;
use jsonwebtoken::EncodingKey;
use secrecy::{ExposeSecret, Secret};

use sqlx::{MySql, Pool};
use uuid::Uuid;
use validator::ValidationError;

use crate::{
    db::user::{get_user_by_name, register},
    models::{
        dto::indto::{user::PasswordUnchecked, UserInDTO},
        parts::{DisplayName, Username},
        LoginCredentials, User,
    },
    routes::{
        admin::users::get_user_jwt_from_token,
        errors::{AdminError, AuthError},
    },
    AppState,
};

const DAYS_OF_JWTTOKEN: u64 = 3;

#[tracing::instrument(name = "Login attempt", skip(state))]
#[post("/login")]
async fn login_service(
    state: Data<AppState>,
    data: Json<LoginCredentials>,
) -> Result<HttpResponse, AuthError> {
    let user = validate_password(&state.db, data.into_inner()).await?;

    let token = jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &user,
        &EncodingKey::from_secret(state.jwt_secret.expose_secret().as_bytes()),
    )?;

    Ok(HttpResponse::Ok().body(token))
}

#[tracing::instrument(name = "Registration attempt", skip(state))]
#[post("/register")]
async fn register_service(
    state: Data<AppState>,
    data: Json<UserInDTO<PasswordUnchecked>>,
) -> impl Responder {
    let check = data.into_inner().check_passwords();
    if let Err(err) = check {
        return Err(err.into());
    }

    let user = check.unwrap();
    // Check if user exists
    let db_user = get_user_by_name(user.username.as_ref(), &state.db).await;

    if db_user.is_ok() {
        return Err(AuthError::ValidationError(ValidationError::new(
            "Username already taken.",
        )));
    }

    register(user, &state.db).await.map(|_| HttpResponse::Ok())
}

#[tracing::instrument(name = "Keepalive ping", skip(state))]
#[post("/keepalive")]
async fn keepalive_service(
    state: Data<AppState>,
    req: HttpRequest,
) -> Result<HttpResponse, AdminError> {
    let auth_header = req.headers().get("Authorization");

    let user_info = get_user_jwt_from_token(auth_header, &state.jwt_secret)?;

    let mut user =
        get_user_by_name(&user_info.claims.username.clone().into_inner(), &state.db).await?;

    user.exp.replace(
        chrono::offset::Utc::now()
            .checked_add_days(Days::new(DAYS_OF_JWTTOKEN))
            .unwrap()
            .timestamp(),
    );

    jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &user,
        &EncodingKey::from_secret(state.jwt_secret.expose_secret().as_bytes()),
    )
    .map_err(|_e| AdminError::UnexpectedFailure("JWT encode error"))
    .map(|token| HttpResponse::Ok().body(token))
}

pub fn auth_router() -> actix_web::Scope {
    actix_web::web::scope("/auth")
        .service(login_service)
        .service(register_service)
        .service(keepalive_service)
}

fn get_false_user() -> User {
    User {
        user_id: Uuid::new_v4(),
        username: Username::new(Uuid::new_v4().to_string()).expect("Fake user failed username"),
        password: Some(Secret::new(
            "$argon2d$v=19$m=16,t=2,p=1$c2FyZXPDs3NhbHQ$P4znDREjD/ChBjAmqedrmA".to_string(),
        )),
        admin: false,
        exp: None,
        display_name: DisplayName::new("FAKEY Fakey").expect("Fake user failed display name"),
    }
}

async fn validate_password(
    pool: &Pool<MySql>,
    credentials: LoginCredentials,
) -> Result<User, AuthError> {
    let mut user = get_user_by_name(&credentials.username, pool)
        .await
        .unwrap_or(get_false_user());

    if user.password.is_none() {
        return Err(AuthError::UnexpectedFailure(
            "There was no password somehow. This shouldn't happen!",
        ));
    }

    let u_clone = user.clone();
    let current_span = tracing::Span::current();

    tokio::task::spawn_blocking(move || {
        current_span.in_scope(|| {
            let password = u_clone.password;
            let hash = PasswordHash::new(password.as_ref().unwrap().expose_secret())?;

            Argon2::default()
                .verify_password(credentials.password.expose_secret().as_bytes(), &hash)
        })
    })
    .await??;

    user.exp.replace(
        chrono::offset::Utc::now()
            .checked_add_days(Days::new(DAYS_OF_JWTTOKEN))
            .unwrap()
            .timestamp(),
    );
    Ok(user)
}
