import { Router } from "express";
import controller from "@/controllers/v1/pdf/pdf.controller";
import multer, { FileFilterCallback } from "multer";
import type { Request } from "express";
import path from "path";
import fs from "fs";
import rateLimit from "express-rate-limit";
import { requireAuth } from "@/middlewares/auth.middleware";

const uploadDir = path.resolve(process.cwd(), ".uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const maxMb = parseInt(process.env.PDF_MAX_MB || "100", 10);
const upload = multer({ dest: uploadDir, limits: { fileSize: maxMb * 1024 * 1024 }, fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === "application/pdf") cb(null, true); else cb(new Error("Only PDFs are allowed"));
}});

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: parseInt(process.env.RATE_LIMIT_MAX || "200", 10) });

const router = Router();
router.use(limiter, requireAuth);
router.post("/", upload.single("file"), controller.store);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.delete("/:id", controller.remove);
export default router;
