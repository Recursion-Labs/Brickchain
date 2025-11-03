//! Lightweight local PDF storage with metadata, designed to pair with a future Polkadot/Substrate on-chain index.
#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;

use alloc::{string::String, vec::Vec};
use core::fmt;

#[cfg(feature = "std")]
use {
    anyhow::{bail, Context, Result},
    serde::{Deserialize, Serialize},
    sha2::{Digest, Sha256},
    sled::Db,
    std::{
        fs,
        io::{Read, Write},
        path::{Path, PathBuf},
        time::{SystemTime, UNIX_EPOCH},
    },
};

/// 32-byte SHA-256 digest
pub type Hash32 = [u8; 32];

/// Metadata tracked for each stored PDF
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[derive(Clone, PartialEq, Eq, Debug)]
pub struct DocMeta {
    /// Hex-encoded primary key (sha256)
    pub id_hex: String,
    pub filename: String,
    pub mime: String,
    pub size_bytes: u64,
    pub sha256: Hash32,
    pub created_at_unix_ms: u64,
    /// Optional IPFS CID (or other content address)
    pub cid: Option<String>,
}

#[cfg(feature = "std")]
#[derive(Clone)]
pub struct DocStore {
    root: PathBuf,
    kv: Db,
}

#[cfg(feature = "std")]
impl fmt::Debug for DocStore {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("DocStore")
            .field("root", &self.root)
            .finish_non_exhaustive()
    }
}

#[cfg(feature = "std")]
impl DocStore {
    /// Open or create a database at the given root directory.
    pub fn open<P: AsRef<Path>>(root: P) -> Result<Self> {
        let root = root.as_ref().to_path_buf();
        fs::create_dir_all(root.join("pdfs")).context("creating pdfs dir")?;
        let kv = sled::open(root.join("kv"))?;
        Ok(Self { root, kv })
    }

    fn write_blob_and_index(
        &self,
        input_path: &Path,
        size_bytes: u64,
        sha256_bytes: [u8; 32],
        cid: Option<String>,
    ) -> Result<DocMeta> {
        let id_hex = hex::encode(sha256_bytes);
        let filename = input_path
            .file_name()
            .map(|s| s.to_string_lossy().into_owned())
            .unwrap_or_else(|| "unknown.pdf".into());
        let mime = mime_guess::from_path(input_path)
            .first_or_octet_stream()
            .essence_str()
            .to_string();
        // Persist file as content-addressed blob (renamed from temp by caller)
        let out_path = self.root.join("pdfs").join(format!("{id_hex}.pdf"));
        let created_at_unix_ms = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
        let meta = DocMeta {
            id_hex: id_hex.clone(),
            filename,
            mime,
            size_bytes,
            sha256: sha256_bytes,
            created_at_unix_ms,
            cid,
        };
        let key = sha256_bytes;
        let val = serde_json::to_vec(&meta)?;
        self.kv.insert(key, val)?;
        self.kv.flush()?;
        Ok(meta)
    }

    /// Store a PDF from `input_path`, returning its metadata.
    /// Copies the file into `<root>/pdfs/<sha256>.pdf` and indexes metadata in sled.
    pub fn store_pdf<P: AsRef<Path>>(&self, input_path: P, cid: Option<String>) -> Result<DocMeta> {
        use std::io::Read;
        let input_path = input_path.as_ref();
        let mut file = fs::File::open(input_path)
            .with_context(|| format!("opening {:?}", input_path))?;
        // Stream to a temp file while hashing
        let mut hasher = Sha256::new();
        let mut temp = tempfile::NamedTempFile::new_in(self.root.join("pdfs"))?;
        let mut buf = [0u8; 8192];
        let mut total: u64 = 0;
        let mut first_chunk = Vec::new();
        loop {
            let n = file.read(&mut buf)?;
            if n == 0 { break; }
            hasher.update(&buf[..n]);
            temp.write_all(&buf[..n])?;
            if total == 0 { first_chunk.extend_from_slice(&buf[..n.min(8)]); }
            total += n as u64;
        }
        // Basic PDF magic check
        if !(first_chunk.starts_with(b"%PDF-")) {
            let _ = temp.close();
            bail!("not a PDF file");
        }
        let sha256_bytes: [u8; 32] = hasher.finalize().into();
        let id_hex = hex::encode(sha256_bytes);
        let final_path = self.root.join("pdfs").join(format!("{id_hex}.pdf"));
        if final_path.exists() {
            // duplicate; discard temp
            let _ = temp.close();
        } else {
            temp.persist(&final_path)?;
        }
        self.write_blob_and_index(input_path, total, sha256_bytes, cid)
    }

    /// Store a PDF and pin its bytes to IPFS, saving the returned CID in metadata.
    #[cfg(feature = "ipfs")]
    pub fn store_pdf_with_ipfs<P: AsRef<Path>>(
        &self,
        input_path: P,
        ipfs_url: Option<&str>,
    ) -> Result<DocMeta> {
use ipfs_api_backend_hyper::{IpfsApi, IpfsClient};
        use ipfs_api_prelude::TryFromUri;
        use std::io::Cursor;

        let input_path = input_path.as_ref();
        // Read file fully and compute hash
        let mut file = fs::File::open(input_path)
            .with_context(|| format!("opening {:?}", input_path))?;
        let mut hasher = Sha256::new();
        let mut temp = tempfile::NamedTempFile::new_in(self.root.join("pdfs"))?;
        let mut buf = [0u8; 8192];
        let mut total: u64 = 0;
        let mut first_chunk = Vec::new();
        loop {
            let n = file.read(&mut buf)?;
            if n == 0 { break; }
            hasher.update(&buf[..n]);
            temp.write_all(&buf[..n])?;
            if total == 0 { first_chunk.extend_from_slice(&buf[..n.min(8)]); }
            total += n as u64;
        }
        if !(first_chunk.starts_with(b"%PDF-")) {
            let _ = temp.close();
            bail!("not a PDF file");
        }
        let sha256_bytes: [u8; 32] = hasher.finalize().into();

        // Pin to IPFS
        let cid = {
            let client = match ipfs_url {
                Some(u) => IpfsClient::from_str(u).context("invalid IPFS url")?,
                None => IpfsClient::default(),
            };
            let rt = tokio::runtime::Runtime::new()?;
            let add_resp = rt.block_on(client.add(Cursor::new(std::fs::File::open(temp.path())?)))?;
            Some(add_resp.hash)
        };
        let id_hex = hex::encode(sha256_bytes);
        let final_path = self.root.join("pdfs").join(format!("{id_hex}.pdf"));
        if final_path.exists() { let _ = temp.close(); } else { temp.persist(&final_path)?; }
        self.write_blob_and_index(input_path, total, sha256_bytes, cid)
    }

    /// Fetch metadata by hex id.
pub fn get_by_hex(&self, id_hex: &str) -> Result<Option<DocMeta>> {
        let bytes = hex::decode(id_hex)?;
        if bytes.len() != 32 {
            bail!("expected 32-byte id, got {}", bytes.len());
        }
        let mut key = [0u8; 32];
        key.copy_from_slice(&bytes);
        let Some(val) = self.kv.get(key)? else { return Ok(None) };
        let meta: DocMeta = serde_json::from_slice(&val)?;
        Ok(Some(meta))
    }

    /// List all stored PDF metadata.
    pub fn list(&self) -> Result<Vec<DocMeta>> {
        let mut out = Vec::new();
        for item in self.kv.iter() {
            let (_, v) = item?;
            let meta: DocMeta = serde_json::from_slice(&v)?;
            out.push(meta);
        }
        Ok(out)
    }

    /// Remove a PDF and its metadata.
    pub fn delete_by_hex(&self, id_hex: &str) -> Result<bool> {
        let Some(_meta) = self.get_by_hex(id_hex)? else { return Ok(false) };
        // Remove file
        let path = self.root.join("pdfs").join(format!("{id_hex}.pdf"));
        let _ = fs::remove_file(path);
        // Remove kv
        let bytes = hex::decode(id_hex)?;
        let mut key = [0u8; 32];
        key.copy_from_slice(&bytes);
        self.kv.remove(key)?;
        self.kv.flush()?;
        Ok(true)
    }
}

    /// On-chain schema definitions
pub mod on_chain_schema {
    use super::*;
    use alloc::string::String;

    /// Minimal, `no_std`-friendly document record suitable for on-chain storage.
    #[derive(Clone, PartialEq, Eq, Debug)]
    pub struct OnChainDoc {
        pub sha256: Hash32,
        pub cid: Option<String>,
        pub size_bytes: u64,
    }
}

#[cfg(feature = "chain")]
pub mod chain {
    use super::*;
    use anyhow::Result;
    use subxt::{tx::PairSigner, OnlineClient, PolkadotConfig};
    use subxt_signer::sr25519::Keypair;

    /// Publish a remark containing minimal document info.
    /// Payload format: JSON { sha256_hex, cid, size_bytes }
    pub async fn publish_remark(ws_url: &str, seed: &str, meta: &DocMeta) -> Result<()> {
        #[derive(serde::Serialize)]
        struct Payload<'a> { sha256_hex: &'a str, cid: &'a Option<String>, size_bytes: u64 }
        let payload = serde_json::to_vec(&Payload { sha256_hex: &meta.id_hex, cid: &meta.cid, size_bytes: meta.size_bytes })?;
        let api = OnlineClient::<PolkadotConfig>::from_url(ws_url).await?;
        let pair = Keypair::from_phrase(seed, None).map(|(kp, _)| kp)?;
        let signer = PairSigner::new(pair);
        // system.remark
        let call = subxt::dynamic::tx("System", "remark").push_arg_bytes(&payload);
        let _events = api.tx().sign_and_submit_then_watch_default(&call, &signer).await?.wait_for_in_block().await?;
        Ok(())
    }
}
