import dotenv from "dotenv";
dotenv.config();

const path = require("path");
const fs = require("fs");
function resolveStoreBin() {
  if (process.env.STORE_BIN) return process.env.STORE_BIN;
  const rel = (...p: string[]) => path.resolve(process.cwd(), "..", "store", ...p);
  const win = process.platform === "win32";
  const candidates = [
    rel("target", "release", win ? "store-cli.exe" : "store-cli"),
    rel("target", "debug", win ? "store-cli.exe" : "store-cli"),
  ];
  for (const c of candidates) { if (fs.existsSync(c)) return c; }
  return candidates[0];
}
export const storeConfig = {
  STORE_BIN: resolveStoreBin(),
  STORE_DB_DIR: process.env.STORE_DB_DIR || require("path").resolve(process.cwd(), ".pdfdb"),
  STORE_PIN_IPFS: (process.env.STORE_PIN_IPFS || "false").toLowerCase() === "true",
  IPFS_URL: process.env.IPFS_URL || "",
  CHAIN_PUBLISH: (process.env.CHAIN_PUBLISH || "false").toLowerCase() === "true",
  CHAIN_WS_URL: process.env.CHAIN_WS_URL || "ws://127.0.0.1:9944",
  CHAIN_SEED: process.env.CHAIN_SEED || "//Alice",
};