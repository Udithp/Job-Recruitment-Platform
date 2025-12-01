// routes/uploadRoutes.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import fs from "fs";

const router = express.Router();

// ES module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const userUploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(userUploadDir)) fs.mkdirSync(userUploadDir, { recursive: true });

const companyUploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(companyUploadDir)) fs.mkdirSync(companyUploadDir, { recursive: true });
const userStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, userUploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const uploadUser = multer({ storage: userStorage });
router.post("/profile", protect, uploadUser.single("profileImage"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "❌ Profile image upload failed" });

  const fileUrl = `/public/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: "✅ Profile image uploaded",
    url: fileUrl,
  });
});


router.post("/certificate", protect, uploadUser.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "❌ Certificate upload failed" });

  const fileUrl = `/public/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: "✅ Certificate uploaded",
    url: fileUrl,
  });
});


router.post("/resume", protect, uploadUser.single("resume"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "❌ Resume upload failed" });

  const fileUrl = `/public/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: "✅ Resume uploaded",
    url: fileUrl,
  });
});


router.post("/jobseeker/upload-certificate", protect, uploadUser.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "❌ Certificate upload failed" });

  const fileUrl = `/public/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: "✅ Certificate uploaded",
    url: fileUrl,
  });
});


router.post("/jobseeker/upload-marks", protect, uploadUser.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "❌ Marks upload failed" });

  const fileUrl = `/public/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: "✅ Marks file uploaded",
    url: fileUrl,
  });
});

export default router;
