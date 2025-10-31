use actix_web::{web, App, HttpServer, HttpResponse, Result as ActixResult};

use crate::services::RealEstateService;
use crate::database::Database;

#[derive(Clone)]
pub struct AppState {
    pub service: RealEstateService,
}

pub async fn start_api_server(db: Database) -> std::io::Result<()> {
    let service = RealEstateService::new(db);
    let app_state = AppState { service };

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(app_state.clone()))
            .route("/health", web::get().to(health_check))
            .service(
                web::scope("/api/v1")
                    .service(
                        web::scope("/properties")
                            .route("", web::post().to(crate::api::handlers::create_property))
                            .route("/{id}", web::get().to(crate::api::handlers::get_property))
                            .route("/{id}/status", web::put().to(crate::api::handlers::update_property_status))
                    )
                    .service(
                        web::scope("/holders")
                            .route("", web::post().to(crate::api::handlers::create_holder))
                    )
                    .service(
                        web::scope("/tokens")
                            .route("/mint", web::post().to(crate::api::handlers::mint_tokens))
                            .route("/transfer", web::post().to(crate::api::handlers::transfer_tokens))
                            .route("/balance/{holder_id}/{property_id}", web::get().to(crate::api::handlers::get_balance))
                    )
                    .service(
                        web::scope("/auth")
                            .route("/verify", web::post().to(crate::api::auth::verify_signature))
                    )
            )
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}

async fn health_check() -> ActixResult<HttpResponse> {
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "polkadot-real-estate-api"
    })))
}