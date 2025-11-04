# BrickCHAIN Storage Package 🔗📄

## ⚠️ FULLY DECENTRALIZED - NO COMPROMISES

A **100% decentralized, content-addressed PDF storage system** built with Rust. **EVERY document is MANDATORY stored on IPFS and indexed on blockchain** - no optional flags, no partial decentralization.

## 🌟 Overview

BrickCHAIN Storage is a **fully decentralized** document management solution. It provides:
- **Content-Addressed Storage**: Files are stored using SHA-256 hashes, ensuring data integrity and deduplication
- **MANDATORY IPFS Pinning**: Every document is automatically pinned to IPFS (no exceptions)
- **MANDATORY Blockchain Indexing**: Every document metadata is published to Polkadot/Substrate chains via `system.remark` (no exceptions)
- **RESTful API**: Full-featured HTTP server for web application integration
- **CLI Tools**: Command-line interface for direct database operations

### 🔒 Decentralization Philosophy

**This system enforces TRUE decentralization:**
- ✅ **No optional flags** - IPFS and blockchain are ALWAYS used
- ✅ **No partial storage** - Every upload goes to all three layers (local, IPFS, blockchain)
- ✅ **No centralization backdoors** - Cannot bypass decentralization
- ✅ **Trustless by design** - Cryptographic proof for every document

## 🏗️ Architecture

The package consists of three main components:

1. **Library (`lib.rs`)**: Core storage logic with `DocStore` and `DocMeta`
2. **CLI (`main.rs`)**: Command-line tool (`store-cli`) for document operations
3. **Server (`server.rs`)**: REST API server (`store-server`) with Axum framework

See [Architecture.md](./ARCHITECTURE.md) for detailed architecture documentation.

## ✨ Key Features

### Storage & Indexing
- **Streaming writes**: Memory-efficient processing with 8KB chunks
- **SHA-256 content addressing**: Files stored at `<DB>/pdfs/<sha256>.pdf`
- **Metadata tracking**: Filename, MIME type, size, timestamps, optional CID
- **Embedded database**: Sled key-value store for fast metadata queries
- **Deduplication**: Identical files are automatically detected and reused

### Mandatory Decentralization
- **IPFS pinning** (MANDATORY): ALL files are automatically stored on distributed IPFS network
- **Blockchain integration** (MANDATORY): ALL document metadata is published to Substrate chains
- **Content verification**: Cryptographic hash validation ensures integrity
- **Triple redundancy**: Local + IPFS + Blockchain for maximum resilience

### API & Integration
- **RESTful endpoints**: Store, retrieve, list, delete, download documents
- **Multipart upload**: Standard HTTP file upload support
- **CORS enabled**: Ready for web application integration
- **JSON responses**: Structured API responses with metadata

## 📋 Requirements

- **Rust** (stable 1.70+)
- **Cargo** (comes with Rust)
- **IPFS daemon** (REQUIRED): For IPFS pinning - [Install Kubo](https://docs.ipfs.tech/install/)
- **Substrate node** (REQUIRED): For blockchain publishing - [Substrate Node](https://substrate.io/)
- **OS permissions**: Write access to database directory

⚠️ **IMPORTANT**: IPFS and Substrate node are NOT optional. The system will fail if they are not running.

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
cd packages/storage

# Build (IPFS, blockchain, and server are enabled by default)
cargo build --release

# Features are now MANDATORY and enabled by default
# No optional builds - full decentralization only
```

### Binaries Location
- **CLI**: `target/release/store-cli` (or `store-cli.exe` on Windows)
- **Server**: `target/release/store-server` (or `store-server.exe` on Windows)

## 📖 Usage

### 1. REST API Server

Start the HTTP server for web application integration:

```bash
# Start server with default settings (port 3000, DB at ./.pdfdb)
cargo run --bin store-server

# Custom port and database location
cargo run --bin store-server -- /path/to/db 8080

# With environment variables (REQUIRED)
export IPFS_URL=http://127.0.0.1:5001      # REQUIRED - IPFS API endpoint
export NODE_URL=ws://localhost:9944         # REQUIRED - Substrate node
export SEED="//Alice"                       # REQUIRED - Signing key
cargo run --bin store-server
```

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API documentation |
| POST | `/api/store` | Upload PDF (ALWAYS pins to IPFS + publishes to blockchain) |
| GET | `/api/docs` | List all documents |
| GET | `/api/docs/:id` | Get document metadata |
| GET | `/api/docs/:id/download` | Download PDF file |
| DELETE | `/api/docs/:id` | Delete document |
| GET | `/api/docs/:id/export` | Export on-chain JSON |

#### API Examples

**Upload a PDF:**
```bash
# Upload (AUTOMATICALLY pins to IPFS AND publishes to blockchain)
curl -X POST -F "file=@document.pdf" http://localhost:3000/api/store

# No optional flags - EVERY upload is fully decentralized
# Result: Document stored locally + IPFS + Blockchain (always)
```

**Response:**
```json
{
  "success": true,
  "id": "a3f5e7d9...",
  "sha256": "a3f5e7d9...",
  "cid": "bafybeigdyrzt5...",
  "size_bytes": 245760,
  "block_hash": "0x1234...",
  "message": "PDF stored successfully"
}
```

**Get document metadata:**
```bash
curl http://localhost:3000/api/docs/a3f5e7d9...
```

**Download document:**
```bash
curl -O http://localhost:3000/api/docs/a3f5e7d9.../download
```

**List all documents:**
```bash
curl http://localhost:3000/api/docs
```

### 2. Command-Line Interface (CLI)

Direct database operations via CLI:

```bash
# Store a PDF (ALWAYS pins to IPFS and publishes to blockchain)
store-cli --db ./.pdfdb store document.pdf
# Output: Document ID + IPFS CID + Blockchain hash

# Customize IPFS/blockchain endpoints (but still mandatory)
store-cli --db ./.pdfdb store \
  --ipfs-url http://127.0.0.1:5001 \
  --node-url ws://localhost:9944 \
  --seed "//Alice" \
  document.pdf

# Get metadata as JSON
store-cli --db ./.pdfdb get a3f5e7d9b2c4f1e8...

# List all documents (TSV format: id\tfilename\tsize)
store-cli --db ./.pdfdb list

# Delete a document
store-cli --db ./.pdfdb delete a3f5e7d9b2c4f1e8...

# Export minimal on-chain JSON
store-cli --db ./.pdfdb export a3f5e7d9b2c4f1e8...
```

### 3. Library Usage (Rust)

Integrate into your Rust application:

```rust
use store::DocStore;
use anyhow::Result;

fn main() -> Result<()> {
    // Open or create database
    let db = DocStore::open("./.pdfdb")?;
    
    // Store a PDF
    let meta = db.store_pdf("./document.pdf", None)?;
    println!("Stored with ID: {}", meta.id_hex);
    println!("Size: {} bytes", meta.size_bytes);
    
    // ALWAYS pins to IPFS (mandatory decentralization)
    let meta = db.store_pdf_with_ipfs("./document.pdf", Some("http://127.0.0.1:5001"))?;
    
    // Retrieve metadata
    if let Some(doc) = db.get_by_hex(&meta.id_hex)? {
        println!("Found: {}", doc.filename);
        println!("CID: {:?}", doc.cid);
    }
    
    // List all documents
    let docs = db.list()?;
    for doc in docs {
        println!("{} - {} ({} bytes)", doc.id_hex, doc.filename, doc.size_bytes);
    }
    
    // Delete a document
    db.delete_by_hex(&meta.id_hex)?;
    
    Ok(())
}

// Publish to blockchain (ALWAYS enabled - mandatory)
use store::chain::publish_remark;

#[tokio::main]
async fn publish_doc() -> Result<()> {
    let db = DocStore::open("./.pdfdb")?;
    // This automatically pins to IPFS
    let meta = db.store_pdf_with_ipfs("./document.pdf", Some("http://127.0.0.1:5001"))?;
    
    // And publishes to blockchain
    let block_hash = publish_remark(
        "ws://localhost:9944",
        "//Alice",
        &meta
    ).await?;
    
    println!("Published to blockchain: {}", block_hash);
    println!("IPFS CID: {:?}", meta.cid);
    Ok(())
}
```

## 📂 Data Storage Layout

```
<database-root>/
├── pdfs/
│   ├── a3f5e7d9b2c4f1e8...sha256.pdf
│   ├── c7b4e2f9a1d8c5e3...sha256.pdf
│   └── ...
└── kv/
    └── (sled database files for metadata)
```

- **`pdfs/`**: Content-addressed PDF files named by SHA-256 hash
- **`kv/`**: Embedded Sled database storing metadata (JSON-serialized `DocMeta`)

## 🔒 Security Considerations

### Data Privacy
- **Plaintext storage**: Files are stored unencrypted by default
- **For sensitive data**: Encrypt PDFs before storage using AES-GCM or similar
- **IPFS public access**: CIDs make content globally retrievable - only pin encrypted files

### Access Control
- **File system permissions**: Restrict database directory access
- **API authentication**: Add authentication middleware (not included by default)
- **Blockchain privacy**: Metadata published on-chain is public - avoid PII

### Key Management
- **Development seeds**: `//Alice`, `//Bob` are for testing only
- **Production**: Use proper key management (KMS, HSM, or secure vaults)
- **Never commit**: Keep production seeds/keys out of version control

## 🧪 Testing

```bash
# Run all tests (all features enabled by default)
cargo test

# Run integration tests only
cargo test --test integration
cargo test --test store

# Run with verbose output
cargo test -- --nocapture
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `IPFS_URL` | IPFS API endpoint | `http://127.0.0.1:5001` |
| `NODE_URL` | Substrate WebSocket URL | `ws://localhost:9944` |
| `SEED` | Development seed phrase | `//Alice` |

### Feature Flags

| Feature | Description | Status |
|---------|-------------|--------|
| `std` | Standard library support | ✅ Enabled by default |
| `ipfs` | IPFS pinning | ✅ **MANDATORY** - Enabled by default |
| `chain` | Blockchain integration | ✅ **MANDATORY** - Enabled by default |
| `server` | REST API server | ✅ Enabled by default |

**All features are now enabled by default. No optional builds.**

## 🚧 Performance

- **Streaming**: 8KB chunks minimize memory usage (handles multi-GB files)
- **Deduplication**: Identical files stored only once
- **Database**: Sled provides fast embedded key-value storage
- **Throughput**: Limited by disk I/O and SHA-256 computation (~200-500 MB/s typical)

## 🐛 Troubleshooting

### Common Issues

**"not a PDF file" error**
- The library validates PDF magic bytes (`%PDF-`)
- Ensure file is a valid PDF (not corrupted or different format)

**IPFS pinning fails**
- ⚠️ **CRITICAL**: IPFS daemon MUST be running for the system to work
- Verify IPFS daemon: `ipfs daemon`
- Check IPFS API endpoint: `curl http://127.0.0.1:5001/api/v0/version`
- Set IPFS_URL environment variable if using custom endpoint

**Blockchain publishing fails**
- ⚠️ **CRITICAL**: Substrate node MUST be running for the system to work
- Confirm node is running: Check WebSocket at `ws://localhost:9944`
- Verify account has sufficient balance for transaction fees
- Check seed phrase format (e.g., `//Alice` for dev)
- Set NODE_URL and SEED environment variables

**Permission denied**
- Ensure write permissions on database directory
- On Linux/macOS: `chmod 755 /path/to/db`

**Port already in use**
- Change server port: `store-server /path/to/db 8080`
- Kill existing process: `lsof -ti:3000 | xargs kill` (Linux/macOS)

## 🗺️ Roadmap

### Current Capabilities ✅
- ✅ Content-addressed PDF storage
- ✅ **MANDATORY** IPFS pinning (100% of uploads)
- ✅ **MANDATORY** Blockchain metadata publishing (100% of uploads)
- ✅ REST API server
- ✅ CLI tool
- ✅ Comprehensive testing
- ✅ **TRUE decentralization** - no optional flags

### Future Enhancements 🚀
1. **Substrate Pallet**: Custom pallet for document registry (better than system.remark)
2. **Indexer Integration**: SubQuery/Subsquid for on-chain queries
3. **Multi-format Support**: Beyond PDF (images, documents)
4. **Encryption Layer**: Built-in encryption for sensitive documents
5. **Advanced API Auth**: JWT, OAuth2 integration
6. **Monitoring**: Prometheus metrics, health checks
7. **IPFS Cluster**: Multi-node IPFS pinning for redundancy
8. **Query API**: Advanced metadata search and filtering
9. **Filecoin Integration**: Long-term archival storage
10. **Multi-chain Support**: Deploy to multiple Substrate chains simultaneously

## 📚 Additional Resources

- **[Architecture Documentation](./ARCHITECTURE.md)**: Detailed system design
- **[Substrate Documentation](https://docs.substrate.io/)**: Blockchain framework
- **[IPFS Documentation](https://docs.ipfs.tech/)**: Decentralized storage
- **[Axum Web Framework](https://docs.rs/axum/)**: REST API framework
- **[Sled Database](https://docs.rs/sled/)**: Embedded database

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Tests pass: `cargo test --all-features`
- Code formatted: `cargo fmt`
- Lints pass: `cargo clippy --all-features`

## 📄 License

See project root for license information.

---

**Built with ❤️ for decentralized document management on BrickCHAIN**
