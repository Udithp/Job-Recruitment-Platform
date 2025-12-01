import express from 'express';
import {
  createJob,
  getAllJobs,
  searchJobs,
  getJobById,
  deleteJob
} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


const employerOnly = (req, res, next) => {
  if (req.user.role !== "employer") {
    return res.status(403).json({ message: "❌ Only employers can perform this action" });
  }
  next();
};


router.get('/', getAllJobs);

// Search jobs by title, location, or skills
// GET /api/jobs/search?title=...&location=...&skills=...
router.get('/search', searchJobs);


router.get('/:id', getJobById);


router.post('/', protect, employerOnly, createJob);


router.delete('/:id', protect, employerOnly, deleteJob);

export default router;
