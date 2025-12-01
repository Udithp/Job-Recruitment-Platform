import { ObjectId } from "mongodb";


const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export const applyToJob = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { resumeUrl } = req.body;
    const jobId = req.params.jobId;

    // Added security
    if (!isValidId(jobId)) {
      return res.status(400).json({ message: "❌ Invalid Job ID" });
    }

    if (!resumeUrl) {
      return res.status(400).json({ message: "❌ Resume URL is required" });
    }

    const newApplication = {
      job: new ObjectId(jobId),
      applicant: new ObjectId(req.user.userId),
      resumeUrl,
      appliedAt: new Date(),
      status: "pending"
    };

    const result = await db.collection("applications").insertOne(newApplication);

    return res.status(201).json({
      message: "✅ Application submitted successfully",
      applicationId: result.insertedId
    });
  } catch (error) {
    console.error("❌ applyToJob Error:", error);
    res.status(500).json({ message: "❌ Server error applying to job" });
  }
};


export const getJobApplications = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const jobId = req.params.jobId;

    if (!isValidId(jobId)) {
      return res.status(400).json({ message: "❌ Invalid Job ID" });
    }

    const applications = await db
      .collection("applications")
      .find({ job: new ObjectId(jobId) })
      .toArray();

    const users = db.collection("users");

    const populated = await Promise.all(
      applications.map(async (app) => {
        const user = await users.findOne(
          { _id: new ObjectId(app.applicant) },
          { projection: { password: 0 } }
        );
        return { ...app, applicant: user };
      })
    );

    res.status(200).json(populated);
  } catch (error) {
    console.error("❌ getJobApplications Error:", error);
    res.status(500).json({ message: "❌ Error fetching job applications" });
  }
};

/* ============================================================
   Get Authenticated User's Applications
   GET /api/applications/my
============================================================ */
export const getUserApplications = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const apps = await db
      .collection("applications")
      .find({ applicant: new ObjectId(req.user.userId) })
      .toArray();

    const jobs = db.collection("jobs");

    const populated = await Promise.all(
      apps.map(async (app) => {
        const job = await jobs.findOne(
          { _id: new ObjectId(app.job) }
        );
        return { ...app, jobDetails: job };
      })
    );

    res.status(200).json(populated);
  } catch (error) {
    console.error("❌ getUserApplications Error:", error);
    res.status(500).json({ message: "❌ Error fetching your applications" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status } = req.body;
    const appId = req.params.appId;

    if (!isValidId(appId)) {
      return res.status(400).json({ message: "❌ Invalid Application ID" });
    }

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "❌ Invalid status" });
    }

    const application = await db.collection("applications").findOne({
      _id: new ObjectId(appId)
    });

    if (!application)
      return res.status(404).json({ message: "❌ Application not found" });

    const job = await db.collection("jobs").findOne({
      _id: new ObjectId(application.job)
    });

    // Employer validation
    if (String(job.postedBy) !== String(req.user.userId)) {
      return res.status(403).json({ message: "❌ Access denied" });
    }

    await db.collection("applications").updateOne(
      { _id: new ObjectId(appId) },
      { $set: { status } }
    );

    res.json({ message: "✅ Application status updated" });

  } catch (error) {
    console.error("updateApplicationStatus Error:", error);
    res.status(500).json({ message: "❌ Server error updating status" });
  }
};
export const getEmployerPostedJobs = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const jobs = await db.collection("jobs")
      .find({ postedBy: req.user.userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(jobs);

  } catch (error) {
    console.error("getEmployerPostedJobs Error:", error);
    res.status(500).json({ message: "❌ Could not fetch employer jobs" });
  }
};

export const getEmployerApplications = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const jobs = await db.collection("jobs")
      .find({ postedBy: req.user.userId })
      .toArray();

    const jobIds = jobs.map(j => j._id.toString());

    const apps = await db.collection("applications")
      .find({ job: { $in: jobIds.map(id => new ObjectId(id)) } })
      .toArray();

    res.json(apps);

  } catch (error) {
    console.error("getEmployerApplications Error:", error);
    res.status(500).json({ message: "❌ Cannot fetch employer applications" });
  }
};

/* ============================================================
   Count applications for a job
   GET /api/applications/job/:jobId/count
============================================================ */
export const getJobApplicationCount = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const jobId = req.params.jobId;

    if (!isValidId(jobId)) {
      return res.status(400).json({ message: "❌ Invalid Job ID" });
    }

    const count = await db.collection("applications").countDocuments({
      job: new ObjectId(jobId)
    });

    res.json({ count });

  } catch (error) {
    console.error("getJobApplicationCount Error:", error);
    res.status(500).json({ message: "❌ Cannot count applications" });
  }
};
