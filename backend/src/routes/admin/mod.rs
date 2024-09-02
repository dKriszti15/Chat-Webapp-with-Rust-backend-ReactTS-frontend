use self::users::admin_users_router;


pub mod users;

pub fn admin_router() -> actix_web::Scope {
    actix_web::web::scope("/admin")
        .service(admin_users_router())
}
