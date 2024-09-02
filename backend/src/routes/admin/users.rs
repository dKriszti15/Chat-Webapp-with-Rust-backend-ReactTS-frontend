use actix_web::{
    get, http, post, delete,
    web::{Data, Json},
    HttpRequest, HttpResponse, Scope,
};
use chrono::{offset, DateTime, Days, NaiveDateTime, Utc};
use jsonwebtoken::{DecodingKey, TokenData, Validation};
use secrecy::{ExposeSecret, Secret};
use uuid::Uuid;

use crate::{
    db::user::{activate, deactivate, demote, find_all, promote, remove_user},
    models::User,
    routes::errors::{AdminError, NotFoundError},
    AppState,
};

pub fn get_user_jwt_from_token(
    auth_header: Option<&http::header::HeaderValue>,
    jwt_secret: &Secret<String>,
) -> Result<TokenData<User>, AdminError> {
    if auth_header.is_none() {
        return Err(AdminError::Unauthenticated("Header missing"));
    }

    let binding = auth_header.unwrap().to_str().unwrap();
    let jwt_token = binding.strip_prefix("Bearer ");

    if jwt_token.is_none() {
        return Err(AdminError::Unauthenticated("Not Bearer"));
    }

    let user = jsonwebtoken::decode::<User>(
        jwt_token.unwrap(),
        &DecodingKey::from_secret(jwt_secret.expose_secret().as_bytes()),
        &Validation::new(jsonwebtoken::Algorithm::HS256),
    );

    if user.is_err() {
        return Err(AdminError::Unauthenticated("Malformed jwt"));
    }

    Ok(user.unwrap())
}

pub fn is_authorized(
    auth_header: Option<&http::header::HeaderValue>,
    jwt_secret: &Secret<String>,
) -> Result<(), AdminError> {
    let user = get_user_jwt_from_token(auth_header, jwt_secret)?;

    if !user.claims.admin || !user.claims.active {
        return Err(AdminError::Unauthorized("Not admin / not active"));
    }

    let timestamp_time = DateTime::<Utc>::from_utc(
        NaiveDateTime::from_timestamp_opt(user.claims.exp.unwrap(), 0).unwrap(),
        Utc,
    );

    if offset::Utc::now() > timestamp_time.checked_sub_days(Days::new(2)).unwrap() {
        return Err(AdminError::RenewalRequired());
    }

    Ok(())
}

#[tracing::instrument(name = "Listing users", skip(state, req))]
#[get("")]
async fn user_service(state: Data<AppState>, req: HttpRequest) -> Result<HttpResponse, AdminError> {
    is_authorized(req.headers().get("Authorization"), &state.jwt_secret)?;

    let users = find_all(&state.db).await?;

    Ok(HttpResponse::Ok().json(users))
}

#[tracing::instrument(name = "Promotion attempt", skip(state, req))]
#[post("/promote")]
async fn promote_service(
    state: Data<AppState>,
    data: Json<Uuid>,
    req: HttpRequest,
) -> Result<HttpResponse, AdminError> {
    is_authorized(req.headers().get("Authorization"), &state.jwt_secret)?;

    let id = data.into_inner();

    let was_change = promote(&id, &state.db).await?;

    if !was_change {
        return Err(AdminError::NotFoundError(NotFoundError {
            resource_id: id.to_string(),
        }));
    }

    Ok(HttpResponse::Ok().finish())
}

#[tracing::instrument(name = "Demotion attempt", skip(state, req))]
#[post("/demote")]
async fn demote_service(
    state: Data<AppState>,
    data: Json<Uuid>,
    req: HttpRequest,
) -> Result<HttpResponse, AdminError> {
    is_authorized(req.headers().get("Authorization"), &state.jwt_secret)?;

    let id = data.into_inner();

    let was_change = demote(&id, &state.db).await?;

    if !was_change {
        return Err(AdminError::NotFoundError(NotFoundError {
            resource_id: id.to_string(),
        }));
    }

    Ok(HttpResponse::Ok().finish())
}

#[tracing::instrument(name = "Activation attempt", skip(state, req))]
#[post("/activate")]
async fn activate_service(
    state: Data<AppState>,
    data: Json<Vec<Uuid>>,
    req: HttpRequest,
) -> Result<HttpResponse, AdminError> {
    is_authorized(req.headers().get("Authorization"), &state.jwt_secret)?;

    let id = data.into_inner();

    let success = activate(&id, &state.db).await?;

    if !success {
        return Err(AdminError::NotFoundError(NotFoundError {
            resource_id: format!("{:?}", id),
        }));
    }

    Ok(HttpResponse::Ok().finish())
}

#[tracing::instrument(name = "Deactivation attempt", skip(state, req))]
#[post("/deactivate")]
async fn deactivate_service(
    state: Data<AppState>,
    data: Json<Vec<Uuid>>,
    req: HttpRequest,
) -> Result<HttpResponse, AdminError> {
    is_authorized(req.headers().get("Authorization"), &state.jwt_secret)?;

    let id = data.into_inner();

    let success = deactivate(&id, &state.db).await?;

    if !success {
        return Err(AdminError::NotFoundError(NotFoundError {
            resource_id: format!("{:?}", id),
        }));
    }

    Ok(HttpResponse::Ok().finish())
}

#[tracing::instrument(name = "Removing 1 user based on username", skip(state, req))]
#[delete("/remove")]
async fn user_deleting_service(
    state: Data<AppState>,
    data: Json<String>,
    req: HttpRequest,
) -> Result<HttpResponse, AdminError> {
    let username = data.into_inner();

    is_authorized(req.headers().get("Authorization"), &state.jwt_secret)?;

    match remove_user(&username, &state.db).await {
        Ok(_) => Ok(HttpResponse::Ok().finish()),
        Err(sqlx::Error::RowNotFound) => {
            Err(AdminError::NotFoundError(NotFoundError {
                resource_id: format!("{:?}", username),
            }))
        }
        Err(e) => {
            Err(AdminError::DbError(e.into()))
        }
    }
}


pub fn admin_users_router() -> Scope {
    actix_web::web::scope("users")
        .service(promote_service)
        .service(demote_service)
        .service(user_service)
        .service(activate_service)
        .service(deactivate_service)
        .service(user_deleting_service)
}
