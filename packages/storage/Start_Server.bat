@echo off
echo Starting BrickChain Storage Server...
echo.
echo Database: ./.pdfdb
echo Port: 3020
echo.
echo Make sure IPFS is running on http://127.0.0.1:5001
echo Make sure Substrate node is running on ws://localhost:9944
echo.
cargo run --bin store-server ./.pdfdb 3020