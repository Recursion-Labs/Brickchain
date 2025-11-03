import multer, { FileFilterCallback } from "multer";
import type { Request } from "express";
import path from "path";
import fs from "fs";
import envVars from "@/config/envVars";

const uploadDir = path.resolve(process.cwd(), ".uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const maxMb = parseInt(envVars.PDF_MAX_MB, 10);

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
	if (file.mimetype === "application/pdf") {
		cb(null, true);
	} else {
		cb(new Error("Only PDFs are allowed"));
	}
};

const upload = multer({
	dest: uploadDir,
	limits: { fileSize: maxMb * 1024 * 1024 },
	fileFilter,
});

export default upload;
