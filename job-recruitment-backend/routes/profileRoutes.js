// routes/profileRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { protect } from "../middleware/authMiddleware.js";
import { updateProfile, getProfile } from "../controllers/profileController.js";  // ⭐ added getProfile

const router = express.Router();

// ES Module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload folder → public/uploads
const uploadDir = path.join(process.cwd(), "public", "uploads");

// Create folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const clean = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${clean}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only image files allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* =====================================================
   ROUTES
===================================================== */

// ⭐ GET profile (fixes Profile.jsx 404 error)
router.get("/", protect, getProfile);

// ⭐ Update profile (name, bio, image)
router.put("/", protect, upload.single("profileImage"), updateProfile);

// ❌ Removed broken /image route

export default router;
