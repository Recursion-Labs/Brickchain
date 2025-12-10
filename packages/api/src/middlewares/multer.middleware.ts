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

const pdfUpload = multer({
	dest: uploadDir,
	limits: { fileSize: maxMb * 1024 * 1024 },
	fileFilter,
});

// Image upload middleware
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
	const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"));
	}
};

const imageUpload = multer({
	storage: multer.memoryStorage(), // Store in memory for Cloudinary
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for images
	fileFilter: imageFileFilter,
});

export { pdfUpload as default, imageUpload };
