// controllers/employerController.js
import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import archiver from "archiver"; // npm install archiver



const safeTrim = (v) => (typeof v === "string" ? v.trim() : v);
const normalizeSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map((s) => safeTrim(s)).filter(Boolean);
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((s) => safeTrim(s))
      .filter(Boolean);
  }
  return [];
};

const toObjectId = (id) => {
  try {
    return new ObjectId(id);
  } catch (e) {
    return null;
  }
};

const isValidObjectId = (id) => {
  try {
    return ObjectId.isValid(String(id));
  } catch {
    return false;
  }
};


const verifyEmployerAndCompany = async (db, req, providedCompanyId) => {
  if (!req.user) {
    return { ok: false, status: 401, message: "Unauthorized: missing user" };
  }
  if (req.user.role !== "employer") {
    return { ok: false, status: 403, message: "Forbidden: only employers allowed" };
  }
  const employerCompanyId = req.user.companyId || null;
  if (!employerCompanyId) {
    return { ok: false, status: 400, message: "Employer account not linked to a company" };
  }

  if (providedCompanyId && String(providedCompanyId) !== String(employerCompanyId)) {
    return { ok: false, status: 400, message: "Provided companyId does not match logged-in employer" };
  }

  const companies = db.collection("companies");
  const company = await companies.findOne({ companyId: employerCompanyId });
  if (!company) {
    return { ok: false, status: 400, message: "Company record not found for this employer" };
  }

  return { ok: true, company };
};

/* =============================================
   GET EMPLOYER JOBS
   - supports ?page=1&limit=10
   ============================================= */
export const getEmployerJobs = async (req, res) => {
  try {
    const db = req.app.locals.db;

    if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({ message: "❌ Only employers can view their jobs" });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.user.companyId) {
      query.companyId = String(req.user.companyId);
    } else {
      query.postedBy = String(req.user.userId);
    }

    // Optionally support text search via query.q
    if (req.query.q) {
      const q = safeTrim(req.query.q);
      query.$or = [
        { title: new RegExp(q, "i") },
        { "company.name": new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
      ];
    }

    const jobsColl = db.collection("jobs");
    const total = await jobsColl.countDocuments(query);
    const jobs = await jobsColl
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return res.json({ total, page, limit, jobs });
  } catch (err) {
    console.error("getEmployerJobs error:", err);
    return res.status(500).json({ message: "❌ Server error while fetching employer jobs" });
  }
};

export const postJob = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const providedCompanyId = req.body.companyId || undefined;
    const verify = await verifyEmployerAndCompany(db, req, providedCompanyId);
    if (!verify.ok) return res.status(verify.status).json({ message: verify.message });

    const company = verify.company;

    const title = safeTrim(req.body.title);
    const description = safeTrim(req.body.description);

    if (!title || !description) {
      return res.status(400).json({ message: "❌ title and description are required" });
    }

    const requirements = safeTrim(req.body.requirements || "");
    const location = safeTrim(req.body.location || "");
    const skills = normalizeSkills(req.body.skills);
    const type = safeTrim(req.body.type || "Full-time");

    const jobDoc = {
      title,
      description,
      requirements,
      location,
      skills,
      type,
      companyId: String(req.user.companyId),
      company: {
        name: company.companyName || req.body.companyName || req.user.companyName || "",
        logo: company.logo || req.body.companyLogo || req.user.companyLogo || "/uploads/default.png",
      },
      postedBy: String(req.user.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("jobs").insertOne(jobDoc);
    const createdJob = { ...jobDoc, _id: result.insertedId };

    return res.status(201).json({ message: "✅ Job posted successfully", job: createdJob });
  } catch (err) {
    console.error("postJob error:", err);
    return res.status(500).json({ message: "❌ Server error while posting job" });
  }
};


export const editJob = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const jobId = req.params.jobId;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ message: "❌ Invalid job ID" });
    }

    const jobsColl = db.collection("jobs");
    const existingJob = await jobsColl.findOne({ _id: new ObjectId(jobId) });

    if (!existingJob) return res.status(404).json({ message: "❌ Job not found" });

    // Ownership check: companyId match or postedBy match
    const allowedToEdit =
      (existingJob.companyId &&
        req.user.companyId &&
        String(existingJob.companyId) === String(req.user.companyId)) ||
      String(existingJob.postedBy) === String(req.user.userId);

    if (!allowedToEdit) {
      return res.status(403).json({ message: "❌ Unauthorized to edit this job" });
    }

    const whitelist = [
      "title",
      "description",
      "requirements",
      "location",
      "skills",
      "type",
      "company",
      "companyId",
    ];
    const updatePayload = {};
    for (const key of whitelist) {
      if (req.body[key] !== undefined) {
        if (key === "skills") {
          updatePayload.skills = normalizeSkills(req.body.skills);
        } else {
          updatePayload[key] = req.body[key];
        }
      }
    }
    updatePayload.updatedAt = new Date();

    const updated = await jobsColl.findOneAndUpdate(
      { _id: new ObjectId(jobId) },
      { $set: updatePayload },
      { returnDocument: "after" }
    );

    return res.json({ message: "✅ Job updated", job: updated.value });
  } catch (err) {
    console.error("editJob error:", err);
    return res.status(500).json({ message: "❌ Server error while editing job" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const jobId = req.params.jobId;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ message: "❌ Invalid job ID" });
    }

    const jobsColl = db.collection("jobs");
    const job = await jobsColl.findOne({ _id: new ObjectId(jobId) });

    if (!job) return res.status(404).json({ message: "❌ Job not found" });

    const allowedToDelete =
      (job.companyId &&
        req.user.companyId &&
        String(job.companyId) === String(req.user.companyId)) ||
      String(job.postedBy) === String(req.user.userId);

    if (!allowedToDelete) {
      return res.status(403).json({ message: "❌ Unauthorized to delete this job" });
    }

    await jobsColl.deleteOne({ _id: new ObjectId(jobId) });

    const appsColl = db.collection("applications");
    const maybeObj = toObjectId(jobId);
    if (maybeObj) {
      await appsColl.deleteMany({
        $or: [{ job: String(jobId) }, { job: maybeObj }],
      });
    } else {
      await appsColl.deleteMany({ job: String(jobId) });
    }

    return res.json({ message: "✅ Job and related applications deleted" });
  } catch (err) {
    console.error("deleteJob error:", err);
    return res.status(500).json({ message: "❌ Server error while deleting job" });
  }
};


export const getApplicationsForJob = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const jobId = req.params.jobId;

    if (!isValidObjectId(jobId)) return res.status(400).json({ message: "Invalid job ID" });

    const jobsColl = db.collection("jobs");
    const job = await jobsColl.findOne({ _id: new ObjectId(jobId) });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const allowed =
      (job.companyId && req.user.companyId && String(job.companyId) === String(req.user.companyId)) ||
      String(job.postedBy) === String(req.user.userId);

    if (!allowed) return res.status(403).json({ message: "Unauthorized" });

    const appsColl = db.collection("applications");
    const usersColl = db.collection("users");

    const maybeObj = toObjectId(jobId);
    const jobQuery = maybeObj ? { $or: [{ job: String(jobId) }, { job: maybeObj }] } : { job: String(jobId) };

    const apps = await appsColl.find(jobQuery).sort({ appliedAt: -1 }).toArray();

    const populated = await Promise.all(
      apps.map(async (a) => {
        let applicantDetails = null;
        try {
          if (a.applicant) {
            if (isValidObjectId(a.applicant)) {
              applicantDetails = await usersColl.findOne(
                { _id: new ObjectId(String(a.applicant)) },
                { projection: { password: 0 } }
              );
            } else {
              // fallback (if applicant stored as other string)
              applicantDetails = await usersColl.findOne(
                { _id: String(a.applicant) },
                { projection: { password: 0 } }
              );
            }
          }
        } catch (e) {
          applicantDetails = null;
        }
        return { ...a, applicantDetails };
      })
    );

    return res.json({ applications: populated });
  } catch (err) {
    console.error("getApplicationsForJob error:", err);
    return res.status(500).json({ message: "❌ Server error while fetching applications" });
  }
};


export const updateApplicationStatus = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { appId } = req.params;
    const status = safeTrim(req.body.status || "");

    if (!isValidObjectId(appId)) return res.status(400).json({ message: "Invalid application ID" });

    const appsColl = db.collection("applications");
    const app = await appsColl.findOne({ _id: new ObjectId(appId) });
    if (!app) return res.status(404).json({ message: "Application not found" });

    const jobsColl = db.collection("jobs");
    let job = null;
    try {
      if (isValidObjectId(String(app.job))) {
        job = await jobsColl.findOne({ _id: new ObjectId(String(app.job)) });
      }
    } catch {
      // ignore
    }
    if (!job) {
      job = await jobsColl.findOne({ _id: app.job });
    }
    if (!job) return res.status(404).json({ message: "Job not found" });

    const allowed =
      (job.companyId && req.user.companyId && String(job.companyId) === String(req.user.companyId)) ||
      String(job.postedBy) === String(req.user.userId);

    if (!allowed) return res.status(403).json({ message: "Unauthorized" });

    const allowedStatuses = ["accepted", "rejected", "pending"];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: "Invalid status value" });

    await appsColl.updateOne({ _id: new ObjectId(appId) }, { $set: { status } });

    return res.json({ message: "✅ Application status updated" });
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    return res.status(500).json({ message: "❌ Server error while updating status" });
  }
};


export const downloadAllResumesZip = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const jobId = req.params.jobId;

    if (!isValidObjectId(jobId)) return res.status(400).json({ message: "Invalid job ID" });

    const jobsColl = db.collection("jobs");
    const job = await jobsColl.findOne({ _id: new ObjectId(jobId) });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const allowed =
      (job.companyId && req.user.companyId && String(job.companyId) === String(req.user.companyId)) ||
      String(job.postedBy) === String(req.user.userId);

    if (!allowed) return res.status(403).json({ message: "Unauthorized" });

    const appsColl = db.collection("applications");

    // Find apps where job stored as string or ObjectId
    const maybeObj = toObjectId(jobId);
    const jobQuery = maybeObj ? { $or: [{ job: String(jobId) }, { job: maybeObj }] } : { job: String(jobId) };

    const apps = await appsColl.find(jobQuery).toArray();

    if (!apps || apps.length === 0) {
      return res.status(404).json({ message: "No applications found for this job" });
    }

    // Collect local file paths to include in zip
    const uploadsRoot = path.join(process.cwd(), "uploads");
    const filesToZip = [];

    apps.forEach((a, idx) => {
      // Common fields where resume may be stored
      const candidateName =
        (a.applicantName && safeTrim(a.applicantName)) ||
        (a.applicantDetails && a.applicantDetails.name) ||
        `applicant-${idx + 1}`;

      // prefer resumeUrl -> resume -> filePath
      const resumeField = a.resumeUrl || a.resume || a.file || a.resumePath || "";

      if (!resumeField) return;

      // If it's an absolute/relative local path starting with /uploads or uploads
      if (resumeField.startsWith("/uploads") || resumeField.startsWith("uploads")) {
        const cleaned = resumeField.replace(/^\/+/, ""); // remove leading slash
        const absolute = path.join(process.cwd(), cleaned);
        if (fs.existsSync(absolute)) {
          // choose a friendly filename: <CandidateName>_<originalFilename>
          const originalName = path.basename(absolute);
          // sanitize candidate name for filename
          const safeName = candidateName.replace(/[^\w\-\. ]+/g, "_").slice(0, 60);
          const zipName = `${safeName}_${originalName}`;
          filesToZip.push({ path: absolute, name: zipName });
        }
      } else {
        // If resumeField looks like URL (http:// or https://) — skip (or could download)
        if (resumeField.startsWith("http://") || resumeField.startsWith("https://")) {
          // Skip remote URLs to keep things simple and fast.
          // Option: implement remote fetch & include in zip (requires streaming downloads)
          // For now, note in response that some resumes were remote and skipped.
        } else {
          // Possibly stored as filename only
          const absolute = path.join(uploadsRoot, resumeField);
          if (fs.existsSync(absolute)) {
            const originalName = path.basename(absolute);
            const safeName = candidateName.replace(/[^\w\-\. ]+/g, "_").slice(0, 60);
            const zipName = `${safeName}_${originalName}`;
            filesToZip.push({ path: absolute, name: zipName });
          }
        }
      }
    });

    if (filesToZip.length === 0) {
      return res.status(404).json({ message: "No local resume files found to zip" });
    }

    // Set response headers for zip streaming
    const zipFileName = `${(job.company?.name || "company")}_resumes_${jobId}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      console.error("Archiver error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "❌ Error creating zip" });
      } else {
        // if headers already sent, just destroy
        try {
          res.end();
        } catch {}
      }
    });

    // Pipe archive to response
    archive.pipe(res);

    // Append each file
    for (const f of filesToZip) {
      // safe check
      try {
        const stat = fs.statSync(f.path);
        if (stat.isFile()) {
          archive.file(f.path, { name: f.name });
        }
      } catch (e) {
        console.warn("Skipping missing file during zip:", f.path, e.message);
      }
    }

    // finalize stream
    await archive.finalize();
    // archiver will end the response when done (since piped)
  } catch (err) {
    console.error("downloadAllResumesZip error:", err);
    return res.status(500).json({ message: "❌ Server error while preparing resumes zip" });
  }
};

export const searchEmployerJobs = async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({ message: "❌ Only employers can search their jobs" });
    }

    const q = safeTrim(req.query.q || "");
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const baseQuery = {};
    if (req.user.companyId) {
      baseQuery.companyId = String(req.user.companyId);
    } else {
      baseQuery.postedBy = String(req.user.userId);
    }

    if (!q) {
      const jobs = await db.collection("jobs").find(baseQuery).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
      const total = await db.collection("jobs").countDocuments(baseQuery);
      return res.json({ total, page, limit, jobs });
    }

    const regex = new RegExp(q, "i");
    const query = {
      ...baseQuery,
      $or: [{ title: regex }, { description: regex }, { location: regex }, { "company.name": regex }, { skills: regex }],
    };

    const total = await db.collection("jobs").countDocuments(query);
    const jobs = await db.collection("jobs").find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();

    return res.json({ total, page, limit, jobs });
  } catch (err) {
    console.error("searchEmployerJobs error:", err);
    return res.status(500).json({ message: "❌ Server error while searching jobs" });
  }
};

export const filterEmployerJobs = async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({ message: "❌ Only employers can filter their jobs" });
    }

    const { type, skill, location } = req.query;
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.user.companyId) query.companyId = String(req.user.companyId);
    else query.postedBy = String(req.user.userId);

    if (type) query.type = safeTrim(type);
    if (skill) query.skills = { $in: [safeTrim(skill)] };
    if (location) query.location = new RegExp(safeTrim(location), "i");

    const total = await db.collection("jobs").countDocuments(query);
    const jobs = await db.collection("jobs").find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();

    return res.json({ total, page, limit, jobs });
  } catch (err) {
    console.error("filterEmployerJobs error:", err);
    return res.status(500).json({ message: "❌ Server error while filtering jobs" });
  }
};

export const sortEmployerJobs = async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({ message: "❌ Only employers can sort their jobs" });
    }

    const { by = "createdAt", dir = "desc" } = req.query;
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const sortDir = dir === "asc" ? 1 : -1;

    const query = {};
    if (req.user.companyId) query.companyId = String(req.user.companyId);
    else query.postedBy = String(req.user.userId);

    const total = await db.collection("jobs").countDocuments(query);
    const jobs = await db.collection("jobs").find(query).sort({ [by]: sortDir }).skip(skip).limit(limit).toArray();

    return res.json({ total, page, limit, jobs });
  } catch (err) {
    console.error("sortEmployerJobs error:", err);
    return res.status(500).json({ message: "❌ Server error while sorting jobs" });
  }
};


export const updateApplicantReviewStatus = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { appId } = req.params;
    const { reviewStatus } = req.body; // expected: shortlisted | under_review | rejected_review

    if (!isValidObjectId(appId)) return res.status(400).json({ message: "Invalid application ID" });

    const allowed = ["shortlisted", "under_review", "rejected_review", "none"];
    if (!allowed.includes(reviewStatus)) return res.status(400).json({ message: "Invalid reviewStatus" });

    const appsColl = db.collection("applications");
    const app = await appsColl.findOne({ _id: new ObjectId(appId) });
    if (!app) return res.status(404).json({ message: "Application not found" });

    // ownership check
    const jobsColl = db.collection("jobs");
    let job = null;
    if (isValidObjectId(String(app.job))) {
      job = await jobsColl.findOne({ _id: new ObjectId(String(app.job)) });
    }
    if (!job) job = await jobsColl.findOne({ _id: app.job });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const allowedOwner =
      (job.companyId && req.user.companyId && String(job.companyId) === String(req.user.companyId)) ||
      String(job.postedBy) === String(req.user.userId);

    if (!allowedOwner) return res.status(403).json({ message: "Unauthorized" });

    await appsColl.updateOne({ _id: new ObjectId(appId) }, { $set: { reviewStatus } });

    return res.json({ message: "✅ Applicant review status updated" });
  } catch (err) {
    console.error("updateApplicantReviewStatus error:", err);
    return res.status(500).json({ message: "❌ Server error while updating review status" });
  }
};


export const updateEmployerProfile = async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!req.user || req.user.role !== "employer") {
      return res.status(403).json({ message: "❌ Only employers can update profile" });
    }

    const companies = db.collection("companies");
    const companyId = req.user.companyId;
    if (!companyId) return res.status(400).json({ message: "Employer has no company linked" });

    const allowed = ["companyName", "address", "industry", "website", "logo", "description", "size"];
    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    updates.updatedAt = new Date();

    const updated = await companies.findOneAndUpdate({ companyId }, { $set: updates }, { returnDocument: "after" });
    if (!updated.value) return res.status(404).json({ message: "Company not found" });

    return res.json({ message: "✅ Company profile updated", company: updated.value });
  } catch (err) {
    console.error("updateEmployerProfile error:", err);
    return res.status(500).json({ message: "❌ Server error while updating company profile" });
  }
};



export default {
  getEmployerJobs,
  postJob,
  editJob,
  deleteJob,
  getApplicationsForJob,
  updateApplicationStatus,
  downloadAllResumesZip,
  searchEmployerJobs,
  filterEmployerJobs,
  sortEmployerJobs,
  updateApplicantReviewStatus,
  updateEmployerProfile,
};
