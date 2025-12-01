// controllers/jobController.js
import { ObjectId } from "mongodb";

/* =====================================================
   HELPER — Validate ObjectId to prevent server crash
===================================================== */
const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

/* =====================================================
   CREATE JOB — FINAL FIXED VERSION
===================================================== */
export const createJob = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const jobs = db.collection("jobs");

    const {
      title,
      description,
      requirements,
      location,
      skills,
      type,
    } = req.body;

    // Only Employers can post jobs
    if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({ message: "❌ Only employers can post jobs" });
    }

    if (!req.user.companyId) {
      return res.status(400).json({
        message: "❌ You must have a registered company to post jobs",
      });
    }

    // ADDED: Basic field validation
    if (!title || !description || !location) {
      return res.status(400).json({ message: "❌ Missing required fields" });
    }

    const job = {
      title,
      description,
      requirements,
      location,
      skills,
      type,

      /* Auto-fill company details */
      companyId: req.user.companyId,
      companyName: req.user.companyName,
      companyLogo: req.user.companyLogo || "/uploads/default.png",

      postedBy: new ObjectId(req.user.userId),
      createdAt: new Date(),
    };

    const result = await jobs.insertOne(job);

    res.status(201).json({
      message: "✅ Job posted successfully",
      jobId: result.insertedId,
    });
  } catch (error) {
    console.error("❌ Error creating job:", error);
    res
      .status(500)
      .json({ message: "❌ Server error while posting job" });
  }
};

/* =====================================================
   GET ALL JOBS
===================================================== */
export const getAllJobs = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const jobs = db.collection("jobs");
    const allJobs = await jobs.find().sort({ createdAt: -1 }).toArray();

    res.json(allJobs);
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    res.status(500).json({ message: "❌ Server error while fetching jobs" });
  }
};

/* =====================================================
   SEARCH JOBS
===================================================== */
export const searchJobs = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const jobs = db.collection("jobs");

    const { title, location, skills } = req.query;
    const query = {};

    if (title) query.title = new RegExp(title, "i");
    if (location) query.location = new RegExp(location, "i");
    if (skills) query.skills = { $in: skills.split(",") };

    const results = await jobs.find(query).sort({ createdAt: -1 }).toArray();

    res.json(results);
  } catch (error) {
    console.error("❌ Error searching jobs:", error);
    res.status(500).json({ message: "❌ Server error while searching jobs" });
  }
};

/* =====================================================
   GET JOB BY ID
===================================================== */
export const getJobById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const jobs = db.collection("jobs");
    const jobId = req.params.id;

    // ADDED: Validate ID
    if (!isValidId(jobId)) {
      return res.status(400).json({ message: "❌ Invalid Job ID" });
    }

    const job = await jobs.findOne({ _id: new ObjectId(jobId) });

    if (!job) {
      return res.status(404).json({ message: "❌ Job not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("❌ Error fetching job:", error);
    res.status(500).json({ message: "❌ Server error while fetching job" });
  }
};

/* =====================================================
   DELETE JOB
===================================================== */
export const deleteJob = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const jobId = req.params.id;

    if (!isValidId(jobId)) {
      return res.status(400).json({ message: "❌ Invalid Job ID" });
    }

    const result = await db
      .collection("jobs")
      .deleteOne({ _id: new ObjectId(jobId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "❌ Job not found" });
    }

    res.json({ message: "✅ Job deleted successfully" });
  } catch (error) {
    console.error("❌ Delete job error:", error);
    res.status(500).json({
      message: "❌ Server error while deleting job",
    });
  }
};

/* =====================================================
   GET JOBS BY EMPLOYER
===================================================== */
export const getEmployerJobs = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const jobs = db.collection("jobs");

    if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({
        message: "❌ Only employers can view their posted jobs",
      });
    }

    const employerJobs = await jobs
      .find({ companyId: req.user.companyId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      count: employerJobs.length,
      jobs: employerJobs,
    });
  } catch (error) {
    console.error("❌ Dashboard fetch error:", error);
    res.status(500).json({
      message: "❌ Server error while fetching employer jobs",
    });
  }
};

/* ============================================================
   ADDED: EXTRA SAFETY LAYER (Does not change your logic)
============================================================ */
export const safeJobFormat = (job) => ({
  _id: job._id,
  title: job.title || "",
  description: job.description || "",
  location: job.location || "",
  requirements: job.requirements || "",
  skills: job.skills || [],
  type: job.type || "",
  companyId: job.companyId || "",
  companyName: job.companyName || "",
  companyLogo: job.companyLogo || "/uploads/default.png",
  createdAt: job.createdAt || null,
});
