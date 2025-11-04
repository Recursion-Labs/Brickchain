# BrickCHAIN Storage Architecture

## ⚠️ FULLY DECENTRALIZED ARCHITECTURE - NO OPTIONAL COMPONENTS

**This system enforces 100% decentralization. IPFS and blockchain are MANDATORY for every upload.**

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [Storage Layer](#storage-layer)
6. [Decentralization Strategy](#decentralization-strategy)
7. [API Design](#api-design)
8. [Security Architecture](#security-architecture)
9. [Performance Considerations](#performance-considerations)
10. [Deployment Architecture](#deployment-architecture)

---

## System Overview

BrickCHAIN Storage is a **fully decentralized storage system** that MANDATORILY combines:
- **Local content-addressed storage** for fast access and reliability (Layer 1)
- **IPFS pinning** for decentralized redundancy (Layer 2 - MANDATORY)
- **Blockchain indexing** for tamper-proof metadata registry (Layer 3 - MANDATORY)

**⚠️ Every single document MUST be stored on all three layers. No exceptions.**

### Design Philosophy

1. **Content Addressing**: Files are identified by their SHA-256 hash, ensuring integrity and deduplication
2. **Triple-Layer Storage**: Local + IPFS + Blockchain (ALL MANDATORY)
3. **Blockchain as Index**: Only metadata stored on-chain, keeping costs low
4. **Streaming Processing**: Memory-efficient handling of large files
5. **No Optional Flags**: IPFS and blockchain enabled by default, cannot be disabled
6. **True Decentralization**: Cryptographic proof at every layer

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  (React/Next.js Application with Web3 Integration)              │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTP/REST API
                        │ (multipart/form-data)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BrickCHAIN Storage API                      │
│                         (Axum Server)                            │
├─────────────────────────────────────────────────────────────────├
│  Routes (ALL uploads ALWAYS go to IPFS + Blockchain):           │
│  • POST /api/store  (MANDATORY: IPFS + Blockchain)              │
│  • GET /api/docs/:id                                            │
│  • GET /api/docs/:id/download                                   │
│  • DELETE /api/docs/:id                                         │
└───────────┬─────────────┬───────────────┬─────────────┬─────────┘
            │             │               │             │
            │ DocStore    │ IPFS Client   │ Subxt      │
            │ API         │ (MANDATORY)   │ (MANDATORY)│
            ▼             ▼               ▼             ▼
┌───────────────┐  ┌─────────────┐  ┌──────────┐  ┌─────────────┐
│  Local Store  │  │ IPFS Network│  │Substrate │  │   Sled DB   │
│  (File System)│  │  (Kubo)     │  │  Chain   │  │  (Metadata) │
├───────────────┤  ├─────────────┤  ├──────────┤  ├─────────────┤
│ pdfs/         │  │ Distributed │  │ system.  │  │ Key-Value   │
│ ├─a3f5...pdf  │  │ Content     │  │ remark() │  │ Store       │
│ └─c7b4...pdf  │  │ Addressing  │  │ Extrinsic│  │             │
└───────────────┘  └─────────────┘  └──────────┘  └─────────────┘
      ▲                   │               │              ▲
      └───────────────────┴───────────────┴──────────────┘
           Content-Addressed Storage Architecture
```

---

## Core Components

### 1. DocStore (Core Library - `lib.rs`)

The heart of the storage system, responsible for:

**Key Structures:**

```rust
pub struct DocStore {
    root: PathBuf,      // Database root directory
    kv: Db,             // Sled embedded database
}

pub struct DocMeta {
    pub id_hex: String,              // SHA-256 hash (hex-encoded)
    pub filename: String,            // Original filename
    pub mime: String,                // MIME type (e.g., "application/pdf")
    pub size_bytes: u64,             // File size in bytes
    pub sha256: Hash32,              // Raw SHA-256 bytes
    pub created_at_unix_ms: u64,     // Timestamp in milliseconds
    pub cid: Option<String>,         // IPFS CID (if pinned)
}
```

**Core Methods:**

| Method | Purpose | Features |
|--------|---------|----------|
| `open(root)` | Initialize/open database | Creates directories, opens Sled DB |
| `store_pdf(path, cid)` | Store PDF locally | Streaming SHA-256, deduplication |
| `store_pdf_with_ipfs(path, ipfs_url)` | Store + IPFS pin | IPFS upload, CID tracking |
| `get_by_hex(id)` | Retrieve metadata | Fast key-value lookup |
| `list()` | List all documents | Iterate Sled DB |
| `delete_by_hex(id)` | Remove document | Delete file + metadata |

**Streaming Storage Algorithm:**

```rust
// Pseudo-code for store_pdf
fn store_pdf(input_path):
    1. Create temporary file in pdfs/ directory
    2. Open input file for reading
    3. Initialize SHA-256 hasher
    4. Loop:
        a. Read 8KB chunk from input
        b. Update hash with chunk
        c. Write chunk to temp file
        d. Validate PDF magic bytes on first chunk
    5. Finalize SHA-256 hash
    6. Check if file already exists (hash.pdf)
    7. If new: persist temp file, else: discard temp
    8. Store metadata in Sled DB
    9. Return DocMeta
```

### 2. REST API Server (`server.rs`)

**Framework**: Axum (async web framework)

**Architecture Pattern**: Shared State + Handler Functions

```rust
struct AppState {
    db: Arc<DocStore>,          // Thread-safe DocStore reference
    ipfs_url: Option<String>,   // IPFS API endpoint
    node_url: String,           // Substrate WebSocket URL
    seed: String,               // Signing key seed
}
```

**Request Flow:**

```
Client Request
    │
    ├─> Axum Router (path matching)
    │
    ├─> Middleware (CORS, logging)
    │
    ├─> Handler Function (extract State, Query, Body)
    │   │
    │   ├─> Extract multipart file upload
    │   ├─> Save to temp file
    │   ├─> Call DocStore.store_pdf() or store_pdf_with_ipfs()
    │   ├─> (Optional) Publish to blockchain via subxt
    │   └─> Return JSON response
    │
    └─> Response (JSON with metadata)
```

**Endpoints Implementation:**

| Endpoint | Handler | Operations |
|----------|---------|------------|
| `POST /api/store` | `store_pdf()` | Multipart parse → Store → IPFS → Blockchain → Response |
| `GET /api/docs/:id` | `get_metadata()` | Extract ID → Query DB → Return metadata |
| `GET /api/docs/:id/download` | `download_pdf()` | Validate ID → Read file → Stream bytes |
| `DELETE /api/docs/:id` | `delete_doc()` | Extract ID → Delete file & metadata |
| `GET /api/docs` | `list_docs()` | Query DB → Return all metadata |

### 3. CLI Tool (`main.rs`)

**Framework**: Clap (command-line argument parser)

**Commands:**
- `store`: Upload PDF with optional IPFS/blockchain
- `get`: Retrieve metadata by ID
- `list`: Show all stored documents
- `delete`: Remove document
- `export`: Generate on-chain JSON payload

**Usage Pattern:**
```bash
store-cli --db <path> <command> [options]
```

### 4. IPFS Integration (MANDATORY - Always Enabled)

**Library**: `ipfs-api-backend-hyper`

**Flow:**
```
PDF File → Read into memory → IPFS Client.add() → Receive CID → Store CID in metadata
```

**Implementation:**
```rust
pub fn store_pdf_with_ipfs(path, ipfs_url) {
    // 1. Store file locally (same as store_pdf)
    // 2. Read file into memory
    // 3. Connect to IPFS daemon
    let client = IpfsClient::from_str(ipfs_url)?;
    // 4. Add to IPFS
    let response = tokio::block_on(client.add(file_data))?;
    // 5. Extract CID
    let cid = response.hash;
    // 6. Store metadata with CID
    // 7. Return DocMeta with CID
}
```

**IPFS Advantages:**
- **Redundancy**: Multiple nodes can pin the same content
- **Global Accessibility**: Content accessible via IPFS gateways
- **Censorship Resistance**: No single point of failure
- **Content Addressing**: CID = hash of content (integrity guaranteed)

### 5. Blockchain Integration (MANDATORY - Always Enabled)

**Library**: `subxt` (Substrate transaction library)

**Mechanism**: `system.remark` extrinsic

```rust
pub async fn publish_remark(ws_url, seed, meta) {
    // 1. Create on-chain payload
    let payload = OnChainPayload {
        sha256_hex: meta.id_hex,
        cid: meta.cid,
        size_bytes: meta.size_bytes,
        filename: meta.filename,
        timestamp: meta.created_at_unix_ms,
    };
    
    // 2. Connect to Substrate node
    let api = OnlineClient::from_url(ws_url).await?;
    
    // 3. Create keypair from seed
    let keypair = Keypair::from_uri(seed)?;
    
    // 4. Build remark transaction
    let remark_call = dynamic::tx("System", "remark", vec![payload_bytes]);
    
    // 5. Sign and submit
    let tx_progress = api.tx().sign_and_submit(&remark_call, &keypair).await?;
    
    // 6. Wait for finalization
    let events = tx_progress.wait_for_finalized_success().await?;
    
    // 7. Return block hash
    return events.extrinsic_hash();
}
```

**Why system.remark?**
- **Minimal**: No custom pallet required
- **Data Storage**: Arbitrary bytes stored in block
- **Indexable**: Can be queried via SubQuery/Subsquid
- **Tamper-Proof**: Immutable once finalized

---

## Data Flow

### Complete PDF Upload Flow (Frontend → Blockchain)

```
┌──────────┐
│ Frontend │  User selects property PDF
└────┬─────┘
     │
     │ 1. FormData with PDF file
     │    POST /api/store (ALWAYS pins to IPFS + publishes to blockchain)
     ▼
┌─────────────────┐
│  Axum Server    │
├─────────────────┤
│ 2. Receive      │
│    multipart    │
│    upload       │
└────┬────────────┘
     │
     │ 3. Save to temp file
     ▼
┌─────────────────┐
│  DocStore       │
├─────────────────┤
│ 4. Streaming    │
│    storage:     │
│    • Read 8KB   │
│      chunks     │
│    • Compute    │
│      SHA-256    │
│    • Write to   │
│      temp       │
│    • Validate   │
│      PDF magic  │
└────┬────────────┘
     │
     │ 5. SHA-256: a3f5e7d9b2c4f1e8...
     │    Rename: pdfs/a3f5e7d9...pdf
     ▼
┌─────────────────┐
│  Sled DB        │  6. Insert metadata:
├─────────────────┤     Key: [32 bytes SHA-256]
│ Key-Value Store │     Value: JSON(DocMeta)
└─────────────────┘
     │
     ├─────────────────────────────────┐
     │                                 │
     │ ALWAYS pin to IPFS              │ ALWAYS publish to blockchain
     ▼                                 ▼
┌─────────────────┐            ┌────────────────────┐
│  IPFS Client    │            │ Substrate Node     │
├─────────────────┤            ├────────────────────┤
│ 7. client.add() │            │ 9. Connect via WS  │
│    → CID        │            │    (subxt)         │
│                 │            │                    │
│ 8. Store CID in │            │ 10. Sign with seed │
│    metadata     │            │     (//Alice)      │
└─────────────────┘            │                    │
                               │ 11. system.remark  │
                               │     (payload JSON) │
                               │                    │
                               │ 12. Wait for       │
                               │     finalization   │
                               └────────────────────┘
                                        │
                                        │ Block Hash
                                        ▼
┌───────────────────────────────────────────────────┐
│               JSON Response to Frontend            │
├───────────────────────────────────────────────────┤
│ {                                                  │
│   "success": true,                                 │
│   "id": "a3f5e7d9b2c4f1e8...",                    │
│   "sha256": "a3f5e7d9b2c4f1e8...",                │
│   "cid": "bafybeigdyrzt5sfp7udm7hu76uh...",       │
│   "size_bytes": 245760,                            │
│   "block_hash": "0x1234abcd...",                   │
│   "message": "PDF stored successfully on IPFS and blockchain"  │
│ }                                                  │
└───────────────────────────────────────────────────┘
```

### Document Retrieval Flow

```
Frontend Request: GET /api/docs/{sha256_hex}
    │
    ├─> Axum Handler (get_metadata)
    │
    ├─> DocStore.get_by_hex(sha256_hex)
    │   │
    │   ├─> Decode hex to [u8; 32]
    │   ├─> Query Sled DB with key
    │   └─> Deserialize JSON → DocMeta
    │
    └─> Return JSON response with metadata

Frontend Request: GET /api/docs/{sha256_hex}/download
    │
    ├─> Axum Handler (download_pdf)
    │
    ├─> Validate document exists
    │
    ├─> Read file: pdfs/{sha256_hex}.pdf
    │
    └─> Stream bytes with Content-Type: application/pdf
```

---

## Storage Layer

### Local Storage

**Directory Structure:**
```
.pdfdb/                          # Database root
├── pdfs/                        # Content-addressed blobs
│   ├── a3f5e7d9b2c4f1e8...pdf  # 64-char hex filename
│   ├── c7b4e2f9a1d8c5e3...pdf
│   └── ...
└── kv/                          # Sled database files
    ├── conf
    ├── db
    └── snap.*
```

**Storage Properties:**
- **Content-Addressed**: Filename = SHA-256(file_content)
- **Deduplication**: Duplicate files share same hash
- **Integrity**: Hash verification on read
- **Scalability**: Limited by filesystem capacity

### Sled Embedded Database

**Why Sled?**
- Pure Rust implementation
- Embedded (no separate process)
- ACID transactions
- Fast key-value operations
- Lock-free concurrent reads

**Schema:**
```
Key:   [u8; 32]         // 32-byte SHA-256 hash
Value: Vec<u8>          // JSON-serialized DocMeta
```

**Example:**
```
Key:   [0xa3, 0xf5, 0xe7, ...]  (32 bytes)
Value: b'{"id_hex":"a3f5e7d9...","filename":"property.pdf",...}'
```

---

## Decentralization Strategy

### Three-Tier Storage Model

```
┌─────────────────────────────────────────────────────┐
│ Tier 1: Local Storage (Fast, Private)              │
├─────────────────────────────────────────────────────┤
│ • Immediate access                                   │
│ • Full file content                                  │
│ • Server-controlled                                  │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│ Tier 2: IPFS (Decentralized, Redundant)            │
├─────────────────────────────────────────────────────┤
│ • Distributed across nodes                           │
│ • Content-addressed (CID)                            │
│ • Gateway accessible                                 │
│ • Pinning ensures persistence                        │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│ Tier 3: Blockchain (Index, Immutable)              │
├─────────────────────────────────────────────────────┤
│ • Metadata only (no file content)                    │
│ • Tamper-proof registry                              │
│ • Public verifiability                               │
│ • Low cost (small payload)                           │
└─────────────────────────────────────────────────────┘
```

### Why Not Store PDFs On-Chain?

| Aspect | On-Chain | Off-Chain (IPFS) |
|--------|----------|------------------|
| **Cost** | ~$100-1000/MB | ~$0.01/GB/month |
| **Size Limits** | ~10KB practical | Unlimited |
| **Speed** | Block time (6-12s) | Milliseconds |
| **Privacy** | Public by default | Controllable |
| **Scalability** | Limited | Horizontal |

**Conclusion**: Store **metadata index** on-chain, **file content** on IPFS.

---

## API Design

### RESTful Principles

1. **Resource-Oriented**: `/api/docs/{id}`
2. **HTTP Methods**: GET (read), POST (create), DELETE (remove)
3. **Stateless**: Each request contains all necessary information
4. **JSON Responses**: Structured, consistent error handling

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Document not found"
}
```

### API Versioning

Current: `/api/store`, `/api/docs`
Future: `/api/v1/store`, `/api/v2/store`

---

## Security Architecture

### Threat Model

| Threat | Mitigation |
|--------|------------|
| **File tampering** | SHA-256 validation |
| **Unauthorized access** | (TODO: Add authentication) |
| **Man-in-the-middle** | HTTPS (deployment) |
| **Blockchain key exposure** | Env vars, never commit seeds |
| **IPFS privacy leak** | Encrypt before pinning |
| **Database corruption** | Sled ACID transactions |

### Current Security Features

1. **Content Integrity**: SHA-256 hashing
2. **File Validation**: PDF magic byte check
3. **CORS**: Configurable origins
4. **Environment Isolation**: Separate dev/prod configs

### Security Roadmap

1. **JWT Authentication**: API token validation
2. **End-to-End Encryption**: AES-GCM for sensitive docs
3. **Access Control Lists**: Per-document permissions
4. **Audit Logging**: Track all operations
5. **Rate Limiting**: Prevent abuse

---

## Performance Considerations

### Bottlenecks & Optimizations

| Operation | Bottleneck | Solution |
|-----------|------------|----------|
| **PDF Upload** | Disk I/O | Streaming (8KB chunks) |
| **SHA-256** | CPU | Hardware acceleration (SHA-NI) |
| **IPFS Pin** | Network latency | Async processing |
| **Blockchain Tx** | Block time (6s) | Background jobs |
| **Metadata Query** | DB lookup | Sled B-tree index |

### Benchmarks (Typical Hardware)

- **Local Store**: 200-500 MB/s (disk-bound)
- **IPFS Pin**: 5-50 MB/s (network-bound)
- **Blockchain Publish**: 1 tx/6s (consensus-bound)
- **Metadata Query**: <1ms (index-bound)

### Scalability

**Horizontal Scaling:**
- Multiple API servers (stateless)
- Shared database (network-attached storage)
- Load balancer (nginx, HAProxy)

**Vertical Scaling:**
- SSD/NVMe for faster I/O
- Multi-core for parallel hashing
- High-bandwidth network for IPFS

---

## Deployment Architecture

### Development Setup

```
┌─────────────┐
│  Developer  │
│   Machine   │
├─────────────┤
│ • Cargo     │
│ • IPFS      │
│   daemon    │
│ • Substrate │
│   node      │
└─────────────┘
```

### Production Deployment

```
┌───────────────────┐      ┌──────────────┐
│   Load Balancer   │──────│  API Server  │
│   (nginx/HAProxy) │      │  Instance 1  │
└───────────────────┘      └──────┬───────┘
         │                        │
         │                 ┌──────▼───────┐
         │                 │  API Server  │
         │                 │  Instance 2  │
         │                 └──────┬───────┘
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌──────────────────┐
│  NFS/S3 Storage │      │  IPFS Cluster    │
│  (PDFs + DB)    │      │  (Pinning)       │
└─────────────────┘      └──────────────────┘
         │                        │
         └────────────┬───────────┘
                      │
                      ▼
         ┌──────────────────────┐
         │  Substrate Network   │
         │  (Validators)        │
         └──────────────────────┘
```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release --features "server,ipfs,chain"

FROM debian:bullseye-slim
COPY --from=builder /app/target/release/store-server /usr/local/bin/
ENV DATABASE_PATH=/data/.pdfdb
EXPOSE 3000
CMD ["store-server", "/data/.pdfdb", "3000"]
```

### Environment Variables (Production)

```bash
# .env.production
DATABASE_PATH=/var/lib/brickchain/pdfdb
IPFS_URL=http://ipfs-cluster:5001
NODE_URL=wss://mainnet.brickchain.io:9944
SEED=${VAULT_SEED}  # From secure vault
LOG_LEVEL=info
CORS_ORIGINS=https://app.brickchain.io
```

---

## Summary

BrickCHAIN Storage provides a **production-ready, decentralized document storage system** that balances:
- **Performance**: Local storage + streaming processing
- **Decentralization**: IPFS + blockchain integration
- **Security**: Content addressing + validation
- **Scalability**: Modular architecture + horizontal scaling

The system is designed for **real-world property document management** where:
1. **Speed matters**: Users expect fast uploads/downloads
2. **Trust is critical**: Blockchain proof prevents tampering
3. **Privacy is required**: Encryption before IPFS pinning
4. **Cost is constrained**: Only metadata on-chain

For questions or contributions, see the main [README.md](./README.md).
