use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use store::DocStore;
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "store-cli", version, about = "Decentralized PDF storage - pins to IPFS and publishes to on-chain")] 
struct Cli {
    /// Database root directory
    #[arg(short, long, default_value = "./.pdfdb")] 
    db: PathBuf,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Store a PDF and print its id (sha256 hex) - ALWAYS pins to IPFS and publishes on-chain
    Store { 
        path: PathBuf,
        /// IPFS API URL (default: http://127.0.0.1:5001)
        #[arg(long, default_value = "http://127.0.0.1:5001")] ipfs_url: String,
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

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let db = DocStore::open(&cli.db).context("opening database")?;

    match cli.command {
        Commands::Store { path, ipfs_url, node_url, seed } => {
            eprintln!("Storing document in Decentralize databse");
            
            // ALWAYS pin to IPFS (mandatory)
            eprintln!("Pinning to IPFS at {}...", ipfs_url);
            let meta = db.store_pdf_with_ipfs(&path, Some(&ipfs_url)).await?;
            eprintln!("IPFS CID: {}", meta.cid.as_ref().unwrap());
            
            // ALWAYS publish to blockchain (mandatory)
            eprintln!("Publishing to on-chain at {}...", node_url);
            use store::chain::publish_remark;
            let block_hash = publish_remark(&node_url, &seed, &meta).await?;
            eprintln!("on-chain block hash: {}", block_hash);
            
            eprintln!("Document stored successfully!");
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
            println!("{j}");
        }
    }

    Ok(())
}
