# packages/store — Rust content‑addressed PDF store (optional IPFS; Polkadot-ready)

This crate provides streaming, content‑addressed storage for PDFs with a small CLI. It’s designed to pair with a REST API and, optionally, decentralization via IPFS and on‑chain indexing on a Polkadot/Substrate chain.

Key features
- Streaming writes + SHA‑256 IDs: files are stored at <DB>/pdfs/<sha256>.pdf
- Metadata index: sled key‑value DB stores filename, mime, size, sha256, timestamp, optional CID
- Optional IPFS pinning (feature `ipfs`)
- Simple CLI (store-cli): store/get/list/delete/export
- Clean Rust API (DocStore/DocMeta)

What’s here now
- Library: `DocStore` and `DocMeta` in `src/lib.rs`
- CLI: `store-cli` in `src/main.rs`
- Tests: integration and CLI tests under `tests/`
- Optional IPFS pinning behind `--features ipfs`
- On‑chain: currently recommended via the Node API using @polkadot/api system.remark; a Rust subxt path can be added later


## Requirements
- Rust (stable), Cargo
- Optional: IPFS daemon/API (e.g., kubo at http://127.0.0.1:5001) if you plan to pin from the CLI
- OS permissions to write the chosen DB directory


## Build
```
# Base build (no IPFS support in the CLI)
cargo build --release

# With IPFS pinning support in the CLIcargo build --release --features ipfs
```

The binary will be at `target/release/store-cli` (or `store-cli.exe` on Windows).


## Data layout
Given `--db C:\data\.pdfdb` (Windows) or `--db /var/lib/pdfdb` (Linux/macOS), the crate uses:
- `<db>/pdfs/<sha256>.pdf` — content‑addressed blobs
- `<db>/kv` — sled key‑value metadata store


## CLI usage
```
# Store a PDF -> prints 64‑char id (sha256 hex)
store-cli --db <DB_DIR> store <path/to/doc.pdf>

# Store + IPFS (requires binary built with --features ipfs)
store-cli --db <DB_DIR> store --pin-ipfs --ipfs-url http://127.0.0.1:5001 <doc.pdf>

# Read metadata as JSON
store-cli --db <DB_DIR> get <sha256_hex>

# List all (TSV: id\tfilename\tsize bytes)
store-cli --db <DB_DIR> list

# Delete
store-cli --db <DB_DIR> delete <sha256_hex>

# Export minimal on‑chain JSON ({ sha256, cid, size_bytes })
store-cli --db <DB_DIR> export <sha256_hex>
```


## Library usage (Rust)
```rust
use store::DocStore;
let db = DocStore::open("./.pdfdb")?;
let meta = db.store_pdf("./file.pdf", None)?;
println!("{}", meta.id_hex);
```


## Decentralization & On‑chain
- Decentralize storage: enable IPFS pinning (build CLI with `--features ipfs` and pass `--pin-ipfs --ipfs-url ...`).
- On‑chain indexing: recommended via the Node API layer which publishes a `system.remark` `{ sha256_hex, cid, size_bytes }` after storing. A Rust subxt client can be added if you need an all‑Rust path; open an issue or request and we’ll wire it.


## Security notes
- By default, files are plaintext on the filesystem. For private content, encrypt before storing/pinning (e.g., AES‑GCM, KMS‑managed keys).
- If pinned to IPFS, the CID makes content publicly retrievable—only publish encrypted CIDs for private data.
- Ensure OS permissions restrict access to the DB directory.


## Large files
- Storage is streaming (8 KiB chunks), so memory footprint is small.
- Throughput depends on disk and hash speed; ensure enough disk capacity in `<db>/pdfs`.


## Tests
```
cargo test
# or with IPFS feature compiled too (tests don’t require IPFS running)
cargo test --features ipfs
```


## Troubleshooting
- "not a PDF file": the library checks the header magic `%PDF-`.
- IPFS pinning errors: verify `--features ipfs` at build time and `--ipfs-url` is reachable.
- Permission denied: run with a writable `--db` directory.


## Roadmap for full Polkadot on‑chain database
1) Keep primary bytes off‑chain (IPFS or other CAS); never store raw PDF bytes on‑chain.
2) Standardize on‑chain schema: minimally `{ sha256_hex, cid, size_bytes }` with indexing.
3) Implement a Substrate pallet or use a remark/indexer (Subsquid/SubQuery) to index documents.
4) Harden key management (non‑dev seeds; KMS/HSM), retries/backoff, monitoring.

This crate already handles content‑addressed storage and IPFS pinning. Use the API layer to publish on‑chain today; a direct Rust/subxt path can be added if required.
