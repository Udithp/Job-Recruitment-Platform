// routes/jobseekerRoutes.js
import express from "express";
import {
  getMyApplications,
  uploadCertificate,
  updateMarks
} from "../controllers/jobseekerController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Apply auth protection to all routes
router.use(protect);

/* ============================================================
   ADD: Jobseeker-only access control (NO logic changed)
============================================================ */
const jobseekerOnly = (req, res, next) => {
  if (req.user.role !== "jobseeker") {
    return res.status(403).json({ message: "❌ Only jobseekers can access this route" });
  }
  next();
};

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}



const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "application/pdf"
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("❌ Only JPG, PNG, WEBP or PDF files allowed"), false);
  }
  cb(null, true);
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${cleanName}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});



// 1️⃣ Get ALL applications of logged-in user
router.get("/applications", jobseekerOnly, getMyApplications);

// 2️⃣ Upload certificate (OLD)
router.post(
  "/upload-certificate",
  jobseekerOnly,
  upload.single("file"),
  uploadCertificate
);

// 3️⃣ Update marks (10th, 12th, Degree)
router.put("/marks", jobseekerOnly, updateMarks);


router.post(
  "/profile-image",
  jobseekerOnly,
  upload.single("profileImage"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "❌ Profile upload failed" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: "✅ Profile image uploaded from jobseeker route",
      url: fileUrl
    });
  }
);

router.post(
  "/certificate",
  jobseekerOnly,
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "❌ Certificate upload failed" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: "✅ Certificate uploaded successfully",
      url: fileUrl
    });
  }
);


router.post(
  "/upload-marks",
  jobseekerOnly,
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "❌ Marks file upload failed" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "✅ Marks file uploaded",
      url: fileUrl
    });
  }
);

export default router;
