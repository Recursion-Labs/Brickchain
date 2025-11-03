
use anyhow::{Context, Result};
use axum::{
    extract::{Path, Query, State, Multipart},
    http::{StatusCode, header},
    response::{IntoResponse, Response, Json},
    routing::{get, post, delete},
    Router,
};
use serde::{Deserialize, Serialize};
use std::{sync::Arc, path::PathBuf, net::SocketAddr};
use store::DocStore;
use tower_http::cors::CorsLayer;

/// Application state shared across handlers
#[derive(Clone)]
struct AppState {
    db: Arc<DocStore>,
    ipfs_url: Option<String>,
    node_url: String,
    seed: String,
}

/// Response for successful document storage
#[derive(Serialize)]
struct StoreResponse {
    success: bool,
    id: String,
    sha256: String,
    cid: Option<String>,
    size_bytes: u64,
    message: String,
}

/// Response for document retrieval
#[derive(Serialize)]
struct GetResponse {
    success: bool,
    metadata: Option<store::DocMeta>,
    message: String,
}

/// Response for list operation
#[derive(Serialize)]
struct ListResponse {
    success: bool,
    documents: Vec<store::DocMeta>,
    count: usize,
}

/// Response for delete operation
#[derive(Serialize)]
struct DeleteResponse {
    success: bool,
    message: String,
}

/// Generic error response
#[derive(Serialize)]
struct ErrorResponse {
    success: bool,
    error: String,
}

/// Query parameters for store endpoint
#[derive(Deserialize)]
struct StoreQuery {
    #[serde(default)]
    pin_ipfs: bool,
    #[serde(default)]
    publish: bool,
}

/// Health check endpoint
async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "service": "BrickCHAIN PDF Storage API",
        "version": env!("CARGO_PKG_VERSION")
    }))
}

/// Store a PDF document
/// POST /api/store?pin_ipfs=true&publish=true
async fn store_pdf(
    State(state): State<AppState>,
    Query(params): Query<StoreQuery>,
    mut multipart: Multipart,
) -> Result<Json<StoreResponse>, AppError> {
    // Extract the file from multipart form data
    let mut temp_path: Option<PathBuf> = None;
    
    while let Some(field) = multipart.next_field().await? {
        let name = field.name().unwrap_or("");
        if name == "file" {
            let filename = field.file_name()
                .unwrap_or("upload.pdf")
                .to_string();
            
            // Save to temp file
            let data = field.bytes().await?;
            let temp_dir = std::env::temp_dir();
            let temp_file = temp_dir.join(filename);
            std::fs::write(&temp_file, data)?;
            temp_path = Some(temp_file);
            break;
        }
    }
    
    let temp_path = temp_path.ok_or_else(|| anyhow::anyhow!("No file provided"))?;
    
    // Store the PDF
    #[cfg(feature = "ipfs")]
    let meta = if params.pin_ipfs {
        state.db.store_pdf_with_ipfs(&temp_path, state.ipfs_url.as_deref())?
    } else {
        state.db.store_pdf(&temp_path, None)?
    };
    
    #[cfg(not(feature = "ipfs"))]
    let meta = state.db.store_pdf(&temp_path, None)?;
    
    // Publish to blockchain if requested
    #[cfg(feature = "chain")]
    if params.publish {
        use tokio::runtime::Runtime;
        use store::chain::publish_remark;
        let rt = Runtime::new()?;
        rt.block_on(publish_remark(&state.node_url, &state.seed, &meta))?;
    }
    
    // Clean up temp file
    let _ = std::fs::remove_file(temp_path);
    
    Ok(Json(StoreResponse {
        success: true,
        id: meta.id_hex.clone(),
        sha256: meta.id_hex.clone(),
        cid: meta.cid.clone(),
        size_bytes: meta.size_bytes,
        message: "PDF stored successfully".to_string(),
    }))
}

/// Get document metadata by ID
/// GET /api/docs/:id
async fn get_metadata(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<GetResponse>, AppError> {
    let meta = state.db.get_by_hex(&id)?;
    
    Ok(Json(GetResponse {
        success: meta.is_some(),
        metadata: meta.clone(),
        message: if meta.is_some() {
            "Document found".to_string()
        } else {
            "Document not found".to_string()
        },
    }))
}

/// Download PDF file by ID
/// GET /api/docs/:id/download
async fn download_pdf(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Response, AppError> {
    let meta = state.db.get_by_hex(&id)?
        .ok_or_else(|| anyhow::anyhow!("Document not found"))?;
    
    let pdf_path = state.db.root().join("pdfs").join(format!("{}.pdf", id));
    let data = std::fs::read(&pdf_path)?;
    
    Ok((
        StatusCode::OK,
        [
            (header::CONTENT_TYPE, "application/pdf"),
            (header::CONTENT_DISPOSITION, &format!("attachment; filename=\"{}\"", meta.filename)),
        ],
        data,
    ).into_response())
}

/// List all documents
/// GET /api/docs
async fn list_docs(
    State(state): State<AppState>,
) -> Result<Json<ListResponse>, AppError> {
    let docs = state.db.list()?;
    let count = docs.len();
    
    Ok(Json(ListResponse {
        success: true,
        documents: docs,
        count,
    }))
}

/// Delete a document by ID
/// DELETE /api/docs/:id
async fn delete_doc(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<DeleteResponse>, AppError> {
    let deleted = state.db.delete_by_hex(&id)?;
    
    Ok(Json(DeleteResponse {
        success: deleted,
        message: if deleted {
            "Document deleted successfully".to_string()
        } else {
            "Document not found".to_string()
        },
    }))
}

/// Export on-chain JSON for a document
/// GET /api/docs/:id/export
async fn export_onchain(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let meta = state.db.get_by_hex(&id)?
        .ok_or_else(|| anyhow::anyhow!("Document not found"))?;
    
    Ok(Json(serde_json::json!({
        "sha256": hex::encode(meta.sha256),
        "cid": meta.cid,
        "size_bytes": meta.size_bytes,
        "filename": meta.filename,
        "created_at": meta.created_at_unix_ms,
    })))
}

/// API documentation endpoint
async fn api_docs() -> impl IntoResponse {
    Json(serde_json::json!({
        "service": "Decentralized PDF Storage API",
        "version": env!("CARGO_PKG_VERSION"),
        "endpoints": {
            "health": {
                "method": "GET",
                "path": "/health",
                "description": "Health check endpoint"
            },
            "store": {
                "method": "POST",
                "path": "/api/store",
                "query_params": {
                    "pin_ipfs": "Pin to IPFS",
                    "publish": "Publish to chain"
                },
                "body": "multipart/form-data with 'file' field",
                "description": "Store a PDF document"
            },
            "get_metadata": {
                "method": "GET",
                "path": "/api/docs/:id",
                "description": "Get document metadata by SHA-256 ID"
            },
            "download": {
                "method": "GET",
                "path": "/api/docs/:id/download",
                "description": "Download PDF file"
            },
            "list": {
                "method": "GET",
                "path": "/api/docs",
                "description": "List all stored documents"
            },
            "delete": {
                "method": "DELETE",
                "path": "/api/docs/:id",
                "description": "Delete a document by ID"
            },
            "export": {
                "method": "GET",
                "path": "/api/docs/:id/export",
                "description": "Export on-chain JSON metadata"
            }
        }
    }))
}

// Error handling
struct AppError (anyhow::Error);
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(ErrorResponse {
            success: false,
            error: self.0.to_string(),
        }),
    ).into_response()
    }
}

/// Build the app router
fn app(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/api/store", post(store_pdf))
        .route("/api/docs/:id", get(get_metadata))
        .route("/api/docs/:id/download", get(download_pdf))
        .route("/api/docs", get(list_docs))
        .route("/api/docs/:id", delete(delete_doc))
        .route("/api/docs/:id/export", get(export_onchain))
        .route("/api/docs/docs", get(api_docs))
        .with_state(state)
        .layer(CorsLayer::permissive())
        .layer(cors)
}