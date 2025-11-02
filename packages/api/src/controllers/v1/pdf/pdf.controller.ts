import catchAsync from "@/handlers/async.handler";
import { Request, Response } from "express";
import { storeConfig } from "@/config/store";
import { execa } from "execa";
import { ApiPromise, WsProvider } from "@polkadot/api";
import Keyring from "@polkadot/keyring";
import { db } from "@/config/database";

const bin = () => storeConfig.STORE_BIN;
const dbDir = () => storeConfig.STORE_DB_DIR;

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, baseMs = 300): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e) { lastErr = e; await new Promise(r => setTimeout(r, baseMs * (i + 1))); }
  }
  throw lastErr;
}

async function publishOnChain(id: string) {
  const { stdout } = await execa(bin(), ["--db", dbDir(), "get", id], { windowsHide: true });
  const meta = JSON.parse(stdout);
  const payload = JSON.stringify({ sha256_hex: id, cid: meta.cid, size_bytes: meta.size_bytes });
  return await withRetry(async () => {
    const api = await ApiPromise.create({ provider: new WsProvider(storeConfig.CHAIN_WS_URL) });
    const keyring = new Keyring({ type: "sr25519" });
    const pair = keyring.addFromUri(storeConfig.CHAIN_SEED);
    const tx = api.tx.system.remark(payload);
    const hash = await tx.signAndSend(pair);
    await api.disconnect();
    return hash.toHex();
  });
}

const store = catchAsync(async (req: Request, res: Response) => {
  const file = (req as any).file as Express.Multer.File;
  if (!file) { res.status(400).json({ message: "file required" }); return; }
  // quick magic check
  const fs = await import("fs/promises");
  const fh = await fs.open(file.path, "r");
  const buf = Buffer.alloc(8); await fh.read(buf, 0, 8, 0); await fh.close();
  if (!buf.toString("utf8").startsWith("%PDF-")) { res.status(400).json({ message: "Invalid PDF" }); return; }
  if (process.env.VIRUS_SCAN === "true") {
    // Run clamscan
    const ClamScan = (await import("clamscan")).default;
    const clamscan = await new ClamScan({ clamscan: { path: process.env.CLAMSCAN_PATH || "clamscan" } }).init();
    const { is_infected } = await clamscan.is_infected(file.path);
    if (is_infected) { res.status(400).json({ message: "Malware detected" }); return; }
  }
  const args = ["--db", dbDir(), "store", file.path];
  if (storeConfig.STORE_PIN_IPFS) {
    args.push("--pin-ipfs");
    if (storeConfig.IPFS_URL) { args.push("--ipfs-url", storeConfig.IPFS_URL); }
  }
  const { stdout } = await withRetry(() => execa(bin(), args, { windowsHide: true }));
  const id = stdout.trim();
  // fetch metadata
  const metaJson = (await execa(bin(), ["--db", dbDir(), "get", id], { windowsHide: true })).stdout;
  const meta = JSON.parse(metaJson);
  // persist to DB (id is sha256 hex)
  await db.document.upsert({
    where: { id },
    create: { id, filename: meta.filename, mime: meta.mime, sizeBytes: meta.size_bytes, cid: meta.cid || null },
    update: { cid: meta.cid || null, sizeBytes: meta.size_bytes, mime: meta.mime, filename: meta.filename },
  });
  let onChain: string | undefined;
  if (storeConfig.CHAIN_PUBLISH) {
    onChain = await publishOnChain(id);
  }
  res.status(201).json({ id, onChain });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { stdout } = await execa(bin(), ["--db", dbDir(), "get", id], { windowsHide: true });
  res.json(JSON.parse(stdout));
});

const list = catchAsync(async (_req: Request, res: Response) => {
  const { stdout } = await execa(bin(), ["--db", dbDir(), "list"], { windowsHide: true });
  // parse simple TSV lines
  const items = stdout.split(/\r?\n/).filter(Boolean).map(line => {
    const [id, filename, sizeStr] = line.split(/\t/);
    return { id, filename, size: parseInt(sizeStr) };
  });
  res.json(items);
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { stdout } = await execa(bin(), ["--db", dbDir(), "delete", id], { windowsHide: true });
  res.json({ status: stdout.trim() });
});

export default { store, getById, list, remove };