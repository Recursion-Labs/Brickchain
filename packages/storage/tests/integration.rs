use std::fs;
use std::io::Write;
use std::path::PathBuf;
use tempfile::TempDir;

use store::DocStore;

fn write_fake_pdf(dir: &TempDir, name: &str, body: &[u8]) -> PathBuf {
    let path = dir.path().join(name);
    let mut f = fs::File::create(&path).unwrap();
    // minimal PDF header + body
    f.write_all(b"%PDF-1.4\n%").unwrap();
    f.write_all(body).unwrap();
    f.flush().unwrap();
    path
}

#[test]
fn store_get_list_delete_flow() {
    let tmp = TempDir::new().unwrap();
    let pdf = write_fake_pdf(&tmp, "test.pdf", b"Hello BrickChain");

    let db_root = tmp.path().join("db");
    let db = DocStore::open(&db_root).expect("open db");

    let meta = db.store_pdf(&pdf, Some("bafy...cid".to_string())).expect("store");
    assert_eq!(meta.filename, "test.pdf");
    assert_eq!(meta.mime, "application/pdf");
    assert_eq!(meta.id_hex.len(), 64);

    let got = db.get_by_hex(&meta.id_hex).expect("get").expect("some");
    assert_eq!(got.sha256, meta.sha256);

    let list = db.list().expect("list");
    assert_eq!(list.len(), 1);

    let deleted = db.delete_by_hex(&meta.id_hex).expect("delete");
    assert!(deleted);

    let list2 = db.list().expect("list2");
    assert!(list2.is_empty());
}
