use anyhow::{bail, Context, Result};
use clap::{Parser, Subcommand};
use store::DocStore;
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "store-cli", version, about = "Store PDFs locally (optional IPFS pin) with metadata; ready for on-chain indexing")] 
struct Cli {
    /// Database root directory
    #[arg(short, long, default_value = "./.pdfdb")] 
    db: PathBuf,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Store a PDF and print its id (sha256 hex)
    Store { 
        path: PathBuf, 
        #[arg(long)] cid: Option<String>,
        /// Pin bytes to IPFS and record CID (requires feature `ipfs`)
        #[arg(long, default_value_t = false)] pin_ipfs: bool,
        /// IPFS API URL (e.g., http://127.0.0.1:5001)
        #[arg(long)] ipfs_url: Option<String>,
        /// Publish doc metadata on-chain after storing (requires feature `chain`)
        #[arg(long, default_value_t = false)] publish: bool,
        /// Substrate node WebSocket URL
        #[arg(long, default_value = "ws://localhost:9944")] node_url: String,
        /// Dev seed (//Alice, //Bob, etc.)
        #[arg(long, default_value = "//Alice")] seed: String,
    },
    /// Get metadata by id (sha256 hex)
    Get { id: String },
    /// List all stored PDFs
    List,
    /// Delete by id
    Delete { id: String },
    /// Export minimal on-chain JSON ({ sha256, cid, size_bytes })
    Export { id: String },
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    let db = DocStore::open(&cli.db).context("opening database")?;

    match cli.command {
        Commands::Store { path, cid, pin_ipfs, ipfs_url, publish, node_url, seed } => {
            #[cfg(feature = "ipfs")]
            let meta = if pin_ipfs { 
                db.store_pdf_with_ipfs(&path, ipfs_url.as_deref())?
            } else {
                db.store_pdf(&path, cid)?
            };
            #[cfg(not(feature = "ipfs"))]
            let meta = {
                if pin_ipfs { bail!("binary not built with `ipfs` feature") };
                db.store_pdf(&path, cid)?
            };
            // Optional on-chain publish
            #[cfg(feature = "chain")]
            if publish {
                use tokio::runtime::Runtime;
                use store::chain::publish_remark;
                let rt = Runtime::new()?;
                let block_hash = rt.block_on(publish_remark(&node_url, &seed, &meta))?;
                eprintln!("Published to chain in block: {}", block_hash);
            }
            #[cfg(not(feature = "chain"))]
            if publish { bail!("binary not built with `chain` feature") };
            // Silence unused when features disabled
            #[cfg(not(feature = "chain"))]
            { let _ = (&ipfs_url, &node_url, &seed); }
            println!("{}", meta.id_hex);
        }
        Commands::Get { id } => {
            let meta = db.get_by_hex(&id)?.context("not found")?;
            println!("{}", serde_json::to_string_pretty(&meta)?);
        }
        Commands::List => {
            for m in db.list()? {
                println!("{}\t{}\t{} bytes", m.id_hex, m.filename, m.size_bytes);
            }
        }
        Commands::Delete { id } => {
            let ok = db.delete_by_hex(&id)?;
            println!("{}", if ok { "deleted" } else { "not-found" });
        }
        Commands::Export { id } => {
            let meta = db.get_by_hex(&id)?.context("not found")?;
            #[derive(serde::Serialize)]
            struct OnChain<'a> { sha256: &'a [u8; 32], cid: &'a Option<String>, size_bytes: u64 }
            let j = serde_json::to_string_pretty(&OnChain { sha256: &meta.sha256, cid: &meta.cid, size_bytes: meta.size_bytes })?;
            println!("{}", j);
        }
    }

    Ok(())
}