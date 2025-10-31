#![allow(unused_variables)]

use actix_web::{web, HttpResponse, Result as ActixResult};
use serde::{Deserialize};
use uuid::Uuid;

use crate::api::AppState;
use crate::models::{PropertyStatus};

#[derive(Deserialize)]
pub struct CreatePropertyRequest {
    pub address: String,
    pub description: String,
    pub value_usd: i64,
}

#[derive(Deserialize)]
pub struct CreateHolderRequest {
    pub polkadot_address: String,
    pub name: String,
}

#[derive(Deserialize)]
pub struct MintTokensRequest {
    pub to_holder_id: Uuid,
    pub property_id: Uuid,
    pub amount: i64,
}

#[derive(Deserialize)]
pub struct TransferTokensRequest {
    pub from_holder_id: Uuid,
    pub to_holder_id: Uuid,
    pub property_id: Uuid,
    pub amount: i64,
}

#[derive(Deserialize)]
pub struct UpdatePropertyStatusRequest {
    pub status: PropertyStatus,
}

pub async fn create_property(
    app_state: web::Data<AppState>,
    req: web::Json<CreatePropertyRequest>,
) -> ActixResult<HttpResponse> {
    match app_state.service.create_property(
        req.address.clone(),
        req.description.clone(),
        req.value_usd,
    ).await {
        Ok(property_id) => Ok(HttpResponse::Created().json(serde_json::json!({
            "property_id": property_id
        }))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": e.to_string()
        }))),
    }
}

pub async fn get_property(
    app_state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> ActixResult<HttpResponse> {
    let property_id = path.into_inner();

    // Note: We removed get_property from services, so this would need to be re-added
    // For now, return not implemented
    Ok(HttpResponse::NotImplemented().json(serde_json::json!({
        "error": "Get property not implemented"
    })))
}

pub async fn update_property_status(
    app_state: web::Data<AppState>,
    path: web::Path<Uuid>,
    req: web::Json<UpdatePropertyStatusRequest>,
) -> ActixResult<HttpResponse> {
    let property_id = path.into_inner();

    match app_state.service.update_property_status(property_id, req.status).await {
        Ok(_) => Ok(HttpResponse::Ok().json(serde_json::json!({
            "message": "Property status updated"
        }))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": e.to_string()
        }))),
    }
}

pub async fn create_holder(
    app_state: web::Data<AppState>,
    req: web::Json<CreateHolderRequest>,
) -> ActixResult<HttpResponse> {
    match app_state.service.create_token_holder(
        req.polkadot_address.clone(),
        req.name.clone(),
    ).await {
        Ok(holder_id) => Ok(HttpResponse::Created().json(serde_json::json!({
            "holder_id": holder_id
        }))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": e.to_string()
        }))),
    }
}

pub async fn mint_tokens(
    app_state: web::Data<AppState>,
    req: web::Json<MintTokensRequest>,
) -> ActixResult<HttpResponse> {
    match app_state.service.mint_tokens(
        req.to_holder_id,
        req.property_id,
        req.amount,
    ).await {
        Ok(_) => Ok(HttpResponse::Ok().json(serde_json::json!({
            "message": "Tokens minted successfully"
        }))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": e.to_string()
        }))),
    }
}

pub async fn transfer_tokens(
    app_state: web::Data<AppState>,
    req: web::Json<TransferTokensRequest>,
) -> ActixResult<HttpResponse> {
    match app_state.service.transfer_tokens(
        req.from_holder_id,
        req.to_holder_id,
        req.property_id,
        req.amount,
    ).await {
        Ok(_) => Ok(HttpResponse::Ok().json(serde_json::json!({
            "message": "Tokens transferred successfully"
        }))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": e.to_string()
        }))),
    }
}

pub async fn get_balance(
    app_state: web::Data<AppState>,
    path: web::Path<(Uuid, Uuid)>,
) -> ActixResult<HttpResponse> {
    let (holder_id, property_id) = path.into_inner();

    match app_state.service.get_token_balance(holder_id, property_id).await {
        Ok(balance) => Ok(HttpResponse::Ok().json(serde_json::json!({
            "balance": balance
        }))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": e.to_string()
        }))),
    }
}