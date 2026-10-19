import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
]);

const proofsDir = path.join(process.cwd(), "public/uploads/proofs");
if (!fs.existsSync(proofsDir)) {
  fs.mkdirSync(proofsDir, { recursive: true });
}

const proofStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, proofsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".jpg";
    const randomName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${safeExt}`;
    cb(null, randomName);
  },
});

export const proofUpload = multer({
  storage: proofStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    // Prevent executable / script files
    if (
      mime.includes("svg") ||
      mime.includes("html") ||
      mime.includes("javascript") ||
      ext === ".svg" ||
      ext === ".html" ||
      ext === ".js" ||
      ext === ".exe"
    ) {
      return cb(new Error("File type not permitted for security reasons."));
    }

    if (ALLOWED_MIME_TYPES.has(mime) && ALLOWED_EXTENSIONS.has(ext)) {
      return cb(null, true);
    }

    return cb(
      new Error("Only valid image formats (JPG, JPEG, PNG, WEBP) and PDF files are allowed."),
    );
  },
});
