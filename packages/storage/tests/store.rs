use assert_cmd::prelude::*;
use predicates::prelude::*;
use std::fs;
use std::io::Write;
use std::process::Command;
use tempfile::TempDir;

fn write_fake_pdf(dir: &TempDir, name: &str, body: &[u8]) -> std::path::PathBuf {
    let path = dir.path().join(name);
    let mut f = fs::File::create(&path).unwrap();
    f.write_all(b"%PDF-1.4\n%").unwrap();
    f.write_all(body).unwrap();
    f.flush().unwrap();
    path
}

#[test]
fn cli_store_get_list_delete() {
    let tmp = TempDir::new().unwrap();
    let db_dir = tmp.path().join("db");
    let pdf = write_fake_pdf(&tmp, "doc.pdf", b"CLI test");

    // store
    let output = Command::new(assert_cmd::cargo::cargo_bin!("store-cli"))
        .args(["--db", db_dir.to_str().unwrap(), "store", pdf.to_str().unwrap()])
        .output()
        .unwrap();
    assert!(output.status.success());
    let id = String::from_utf8(output.stdout).unwrap();
    let id = id.trim();
    assert_eq!(id.len(), 64);

    // get
    Command::new(assert_cmd::cargo::cargo_bin!("store-cli"))
        .args(["--db", db_dir.to_str().unwrap(), "get", id])
        .assert()
        .success()
        .stdout(predicate::str::contains(id));

    // list
    Command::new(assert_cmd::cargo::cargo_bin!("store-cli"))
        .args(["--db", db_dir.to_str().unwrap(), "list"]) 
        .assert()
        .success()
        .stdout(predicate::str::contains(id));

    // delete
    Command::new(assert_cmd::cargo::cargo_bin!("store-cli"))
        .args(["--db", db_dir.to_str().unwrap(), "delete", id])
        .assert()
        .success()
        .stdout(predicate::str::contains("deleted"));

    // list empty
    Command::new(assert_cmd::cargo::cargo_bin!("store-cli"))
        .args(["--db", db_dir.to_str().unwrap(), "list"]) 
        .assert()
        .success();
}
