use actix_web::{web, HttpResponse, Result as ActixResult};
use serde::{Deserialize, Serialize};
use sp_core::sr25519;
use sp_runtime::traits::Verify;

#[derive(Deserialize)]
pub struct VerifySignatureRequest {
    pub message: String,
    pub signature: String,
    pub public_key: String,
}

#[derive(Serialize)]
pub struct VerifySignatureResponse {
    pub valid: bool,
    pub address: Option<String>,
}

pub async fn verify_signature(
    req: web::Json<VerifySignatureRequest>,
) -> ActixResult<HttpResponse> {
    // Decode the signature from hex
    let signature_bytes = match hex::decode(&req.signature) {
        Ok(bytes) => bytes,
        Err(_) => return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid signature format"
        }))),
    };

    // Decode the public key from hex
    let public_key_bytes = match hex::decode(&req.public_key) {
        Ok(bytes) => bytes,
        Err(_) => return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid public key format"
        }))),
    };

    // Create signature and public key objects
    let signature = if signature_bytes.len() == 64 {
        sr25519::Signature::from_raw(signature_bytes.try_into().unwrap())
    } else {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid signature length"
        })));
    };

    let public_key = if public_key_bytes.len() == 32 {
        sr25519::Public::from_raw(public_key_bytes.try_into().unwrap())
    } else {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid public key length"
        })));
    };

    // Verify the signature
    let message_bytes = req.message.as_bytes();
    let valid = signature.verify(message_bytes, &public_key);

    // Convert public key to SS58 address
    let address = sp_core::crypto::Ss58Codec::to_ss58check(&public_key);

    let response = VerifySignatureResponse {
        valid,
        address: Some(address),
    };

    Ok(HttpResponse::Ok().json(response))
}