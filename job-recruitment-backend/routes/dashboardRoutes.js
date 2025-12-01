// routes/dashboardRoutes.js
import express from "express";

const router = express.Router();

// Temporary placeholder route 
router.get("/", (req, res) => {
  res.json({
    message: "Dashboard route active — Jobseeker & Employer features coming."
  });
});

export default router;
