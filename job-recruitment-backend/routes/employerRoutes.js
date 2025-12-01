// routes/employerRoutes.js
import express from "express";
import {
  getEmployerJobs,
  postJob,
  editJob,
  deleteJob,
  getApplicationsForJob,
  updateApplicationStatus,
  // NEW FEATURES
  searchEmployerJobs,
  filterEmployerJobs,
  sortEmployerJobs,
  downloadAllResumesZip,
  updateApplicantReviewStatus,
  updateEmployerProfile
} from "../controllers/employerController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.use(protect);



// Get all jobs posted by this employer
router.get("/jobs", getEmployerJobs);

// Create a new job posting
router.post("/jobs", postJob);

// Edit a job
router.put("/jobs/:jobId", editJob);

// Delete a job
router.delete("/jobs/:jobId", deleteJob);



// Search employer jobs by title
router.get("/jobs/search/:keyword", searchEmployerJobs);

// Filter jobs by type or location
router.get("/jobs/filter", filterEmployerJobs);

// Sort jobs (newest / oldest)
router.get("/jobs/sort/:order", sortEmployerJobs);



// Get job applications for a job
router.get("/jobs/:jobId/applications", getApplicationsForJob);

// Update application status (accept/reject/pending)
router.put("/applications/:appId/status", updateApplicationStatus);

router.put("/applications/:appId/review", updateApplicantReviewStatus);


router.get("/jobs/:jobId/download-resumes", downloadAllResumesZip);


router.put("/profile/update", updateEmployerProfile);


export default router;
