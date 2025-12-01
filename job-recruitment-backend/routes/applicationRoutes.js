// routes/applicationRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  applyToJob,
  getJobApplications,
  getUserApplications,

  // ⭐ NEW CONTROLLERS
  updateApplicationStatus,
  getEmployerPostedJobs,
  getEmployerApplications,
  getJobApplicationCount
} from "../controllers/applicationController.js";

const router = express.Router();

const employerOnly = (req, res, next) => {
  if (req.user.role !== "employer") {
    return res.status(403).json({ message: "❌ Only employers can access this route" });
  }
  next();
};


const jobseekerOnly = (req, res, next) => {
  if (req.user.role !== "jobseeker") {
    return res.status(403).json({ message: "❌ Only jobseekers can apply to jobs" });
  }
  next();
};


const validateId = (req, res, next) => {
  const id = req.params.jobId || req.params.appId;
  const pattern = /^[0-9a-fA-F]{24}$/;
  if (!pattern.test(id)) {
    return res.status(400).json({ message: "❌ Invalid ID format" });
  }
  next();
};

/**
 * @route   POST /api/applications/:jobId
 * @desc    Apply for a job (Logged-in Job Seeker)
 * @access  Private
 */
router.post("/:jobId", protect, jobseekerOnly, validateId, applyToJob);

/**
 * @route   GET /api/applications/job/:jobId
 * @desc    Employer fetches all applicants for a job
 * @access  Private
 */
router.get("/job/:jobId", protect, employerOnly, validateId, getJobApplications);

/**
 * @route   GET /api/applications/my
 * @desc    Logged-in user fetches their submitted applications
 * @access  Private
 */
router.get("/my", protect, getUserApplications);

/* ==========================================================
   ⭐ NEW ROUTES BELOW — DO NOT MODIFY ANYTHING ABOVE
   ========================================================== */

/**
 * @route   PUT /api/applications/status/:appId
 * @desc    Employer updates application status (accepted/rejected)
 * @access  Private
 */
router.put("/status/:appId", protect, employerOnly, validateId, updateApplicationStatus);

/**
 * @route   GET /api/applications/employer/jobs
 * @desc    Employer fetches all jobs they posted
 * @access  Private
 */
router.get("/employer/jobs", protect, employerOnly, getEmployerPostedJobs);

/**
 * @route   GET /api/applications/employer/all
 * @desc    Employer fetches applications ONLY for their jobs
 * @access  Private
 */
router.get("/employer/all", protect, employerOnly, getEmployerApplications);

/**
 * @route   GET /api/applications/job/:jobId/count
 * @desc    Get number of applications for 1 job
 * @access  Private
 */
router.get("/job/:jobId/count", protect, employerOnly, validateId, getJobApplicationCount);

export default router;
