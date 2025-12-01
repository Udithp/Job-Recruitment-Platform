// routes/userRoutes.js
import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  uploadProfileImage,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure uploads folder exists for profile images
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_");
    cb(null, `${timestamp}-${baseName}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
});

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);


router.post(
  '/profile/image',
  protect,
  upload.single('profileImage'), // FIXED: matches frontend FormData field
  uploadProfileImage
);

export default router;
