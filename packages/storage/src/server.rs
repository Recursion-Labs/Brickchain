
use anyhow::{Context, Result};
use axum::{
    extract::{Path, Query, State, Multipart},
    http::{StatusCode, header, Method},
    response::{IntoResponse, Response, Json},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::{sync::Arc, path::PathBuf, net::SocketAddr};
use store::DocStore;
use tower_http::cors::{CorsLayer, Any};

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
    block_hash: Option<String>,
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
/// Note: IPFS pinning and blockchain publishing are now MANDATORY for full decentralization
#[derive(Deserialize)]
struct StoreQuery {
    // Removed optional flags - always pin to IPFS and publish to blockchain
}

/// Health check endpoint
async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "service": "PDF Storage API",
        "version": env!("CARGO_PKG_VERSION")
    }))
}

/// Store a PDF document with MANDATORY IPFS pinning and blockchain publishing
/// POST /api/store (always pins to IPFS and publishes to blockchain)
pub async fn store_pdf(
    State(state): State<AppState>,
    Query(_params): Query<StoreQuery>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    // Extract the file from multipart form data
    let mut temp_path: Option<PathBuf> = None;
    
    while let Ok(Some(field)) = multipart.next_field().await {
        let name = field.name().unwrap_or("");
        if name == "file" {
            let filename = field.file_name()
                .unwrap_or("upload.pdf")
                .to_string();
            
            // Save to temp file
            let data = match field.bytes().await {
                Ok(d) => d,
                Err(e) => {
                    return (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to read file data: {}", e)).into_response();
                }
            };
            
            let temp_dir = std::env::temp_dir();
            let temp_file = temp_dir.join(filename);
            
            if let Err(e) = std::fs::write(&temp_file, data) {
                return (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to write temp file: {}", e)).into_response();
            }
            
            temp_path = Some(temp_file);
            break;
        }
    }
    
    let temp_path = match temp_path {
        Some(p) => p,
        None => {
            return (StatusCode::BAD_REQUEST, "No file provided").into_response();
        }
    };
    
    // ALWAYS store with IPFS pinning (mandatory for decentralization)
    let meta = match state.db.store_pdf_with_ipfs(&temp_path, state.ipfs_url.as_deref()).await {
        Ok(m) => m,
        Err(e) => {
            let _ = std::fs::remove_file(&temp_path);
            return (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to store PDF: {}", e)).into_response();
        }
    };
    
    // ALWAYS publish to blockchain (mandatory for tamper-proof registry)
    use store::chain::publish_remark;
    let block_hash = match publish_remark(&state.node_url, &state.seed, &meta).await {
        Ok(b) => b,
        Err(e) => {
            let _ = std::fs::remove_file(&temp_path);
            return (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to publish to blockchain: {}", e)).into_response();
        }
    };
    
    // Clean up temp file
    let _ = std::fs::remove_file(temp_path);
    
    Json(StoreResponse {
        success: true,
        id: meta.id_hex.clone(),
        sha256: meta.id_hex.clone(),
        cid: meta.cid.clone(),
        size_bytes: meta.size_bytes,
        block_hash: Some(block_hash),
        message: "PDF stored successfully on IPFS and on-chain".to_string(),
    }).into_response()
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
    
    let pdf_path = state.db.root().join("pdfs").join(format!("{id}.pdf"));
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
                "query_params": "None - IPFS pinning and on-chain publishing",
                "body": "multipart/form-data with 'file' field",
                "description": "Store a PDF document (automatically pins to IPFS and publishes to blockchain)"
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
struct AppError(anyhow::Error);

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

impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

/// Build the application router
fn app(state: AppState) -> Router {
    // Configure CORS to handle ngrok and local development
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers(Any)
        .expose_headers([
            header::CONTENT_TYPE,
            header::CONTENT_LENGTH,
            header::CONTENT_DISPOSITION,
        ]);

    Router::new()
        .route("/health", get(health_check))
        .route("/", get(api_docs))
        .route("/api/store", post(store_pdf))
        .route("/api/docs", get(list_docs))
        .route("/api/docs/:id", get(get_metadata).delete(delete_doc))
        .route("/api/docs/:id/download", get(download_pdf))
        .route("/api/docs/:id/export", get(export_onchain))
        .layer(cors)
        .with_state(state)
}

#[tokio::main]
async fn main() -> Result<()> {
    // Parse CLI arguments
    let args: Vec<String> = std::env::args().collect();
    let db_path = args.get(1)
        .map(|s| s.as_str())
        .unwrap_or("./.pdfdb");
    let port: u16 = args.get(2)
        .and_then(|s| s.parse().ok())
        .unwrap_or(3020);
    
    println!("Decentralized PDF Storage API");
    println!("Database: {db_path}");
    
    // Initialize database
    let db = DocStore::open(db_path)
        .context("Failed to open database")?;
    println!("Database initialized");
    
    let state = AppState {
        db: Arc::new(db),
        ipfs_url: std::env::var("IPFS_URL").ok(),
        node_url: std::env::var("NODE_URL").unwrap_or_else(|_| "ws://localhost:9944".to_string()),
        seed: std::env::var("SEED").unwrap_or_else(|_| "//Alice".to_string()),
    };
    
    // Build application
    let app = app(state);
    
    // Start server
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("Server listening on http://0.0.0.0:{port}");
    println!("API Documentation: http://localhost:{port}/");
    println!("Health Check: http://localhost:{port}/health");
    println!();
    
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    
    Ok(())
}
