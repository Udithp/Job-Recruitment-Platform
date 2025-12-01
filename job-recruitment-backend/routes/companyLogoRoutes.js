// routes/companyLogoRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();


const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({ storage });

/* ------------------------------------------
   🔥 Upload company logo
-------------------------------------------*/
router.post("/upload-logo", upload.single("logo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "❌ No file uploaded" });
  }

  // File served from http://localhost:5000/uploads/<filename>
  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({
    message: "✅ Logo uploaded successfully",
    logoUrl: fileUrl,
  });
});

export default router;
