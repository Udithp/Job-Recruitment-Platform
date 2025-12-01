import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'resumes',          // folder in Cloudinary
    allowed_formats: ['pdf', 'doc', 'docx'], // accepted formats
  },
});

// Configure multer with Cloudinary storage and optional file size limit (5MB)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export default upload;
