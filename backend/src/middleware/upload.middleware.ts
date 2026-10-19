import multer from "multer";
import path from "path";
import fs from "fs";

// ======================================================
// SECURE FILE UPLOAD CONFIGURATION
// ======================================================

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

const validateImage = (
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  // Explicitly disallow SVG or HTML to prevent XSS payloads
  if (mime.includes("svg") || ext === ".svg" || ext === ".html") {
    return cb(new Error("SVG and HTML files are not permitted for security reasons"));
  }

  if (ALLOWED_MIME_TYPES.has(mime) && ALLOWED_EXTENSIONS.has(ext)) {
    return cb(null, true);
  }

  return cb(
    new Error("Only valid image formats (JPG, JPEG, PNG, WEBP) and PDF files are allowed"),
  );
};

const getSafeFilename = (originalName: string): string => {
  const ext = path.extname(originalName).toLowerCase();
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".jpg";
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
};

// ======================================================
// SCHOOL / GENERAL UPLOAD
// ======================================================

const uploadDir = path.join(process.cwd(), "public/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    cb(null, getSafeFilename(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    validateImage(file, cb);
  },
});

// ======================================================
// USER AVATAR UPLOAD
// ======================================================

const userUploadDir = path.join(process.cwd(), "public/uploads", "users");

if (!fs.existsSync(userUploadDir)) {
  fs.mkdirSync(userUploadDir, { recursive: true });
}

const userStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, userUploadDir);
  },

  filename: (_req, file, cb) => {
    cb(null, getSafeFilename(file.originalname));
  },
});

export const userUpload = multer({
  storage: userStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    validateImage(file, cb);
  },
});
