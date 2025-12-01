// routes/companyRoutes.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

/* ========================================================
   FIXED UPLOAD DIRECTORY (backend/uploads)
======================================================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct folder: backend/uploads
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ========================================================
   MULTER STORAGE
======================================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const cleanedName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${cleanedName}`);
  },
});

const upload = multer({ storage });

/* ========================================================
   VERIFY COMPANY BY companyId
   GET /api/company/verify/:companyId
======================================================== */
router.get("/verify/:companyId", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const companies = db.collection("companies");

    const companyId = req.params.companyId;

    const company = await companies.findOne({ companyId });

    return res.json({
      valid: !!company,
      company,
    });
  } catch (error) {
    console.error("Company verify error:", error);
    return res.json({ valid: false });
  }
});


router.post("/upload-logo/:companyId", upload.single("logo"), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const companies = db.collection("companies");

    const companyId = req.params.companyId;
    const company = await companies.findOne({ companyId });

    if (!company) {
      return res.status(400).json({ message: "Company not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // IMPORTANT: This URL maps correctly with server.js express.static("/uploads")
    const logoPath = `/uploads/${req.file.filename}`;

    const updated = await companies.findOneAndUpdate(
      { companyId },
      { $set: { logo: logoPath } },
      { returnDocument: "after" }
    );

    return res.json({
      success: true,
      message: "Logo uploaded successfully",
      logoUrl: logoPath,
      company: updated.value,
    });
  } catch (err) {
    console.error("Logo upload error:", err);
    return res.status(500).json({ message: "Logo upload failed" });
  }
});

export default router;
