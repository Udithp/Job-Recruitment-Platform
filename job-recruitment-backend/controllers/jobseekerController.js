import { ObjectId } from "mongodb";
const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);


const ensureJobseeker = (req, res) => {
  if (req.user.role !== "jobseeker") {
    return res.status(403).json({ message: "❌ Only jobseekers can perform this action" });
  }
};


export const getMyApplications = async (req, res) => {
  try {
    ensureJobseeker(req, res);

    const db = req.app.locals.db;

    const apps = await db
      .collection("applications")
      .find({ applicant: new ObjectId(req.user.userId) })
      .sort({ appliedAt: -1 })
      .toArray();

    const jobs = db.collection("jobs");

    const populated = await Promise.all(
      apps.map(async (a) => {
        if (!isValidId(a.job)) return { ...a, job: null };

        const job = await jobs.findOne(
          { _id: new ObjectId(a.job) }
        );

        return { ...a, job };
      })
    );

    res.json({ applications: populated });
  } catch (err) {
    console.error("❌ getMyApplications error:", err);
    res.status(500).json({ message: "❌ Server error fetching applications" });
  }
};


export const uploadCertificate = async (req, res) => {
  try {
    ensureJobseeker(req, res);

    const db = req.app.locals.db;
    const users = db.collection("users");

    if (!req.file)
      return res.status(400).json({ message: "❌ No file uploaded" });

    const type = req.body.type || "other";
    const url = `/uploads/${req.file.filename}`;

    const updateField = {};
    updateField[`certificates.${type}`] = url;

    const updated = await users.findOneAndUpdate(
      { _id: new ObjectId(req.user.userId) },
      { $set: updateField },
      { returnDocument: "after", projection: { password: 0 } }
    );

    res.json({
      message: "✅ Certificate uploaded",
      user: updated.value,
    });
  } catch (err) {
    console.error("❌ uploadCertificate error:", err);
    res.status(500).json({ message: "❌ Server error uploading certificate" });
  }
};

export const updateMarks = async (req, res) => {
  try {
    ensureJobseeker(req, res);

    const db = req.app.locals.db;
    const users = db.collection("users");

    const { tenth, twelfth, degree } = req.body || {};

    if (tenth === undefined && twelfth === undefined && degree === undefined) {
      return res.status(400).json({ message: "❌ Missing mark fields" });
    }

    const updated = await users.findOneAndUpdate(
      { _id: new ObjectId(req.user.userId) },
      { $set: { marks: { tenth, twelfth, degree } } },
      { returnDocument: "after", projection: { password: 0 } }
    );

    res.json({
      message: "✅ Marks updated successfully",
      user: updated.value,
    });
  } catch (err) {
    console.error("❌ updateMarks error:", err);
    res.status(500).json({ message: "❌ Server error updating marks" });
  }
};


export const saveProfileImage = async (req, res) => {
  try {
    ensureJobseeker(req, res);

    const db = req.app.locals.db;
    const users = db.collection("users");

    if (!req.file) {
      return res.status(400).json({ message: "❌ No profile image uploaded" });
    }

    const url = `/uploads/${req.file.filename}`;

    const updated = await users.findOneAndUpdate(
      { _id: new ObjectId(req.user.userId) },
      { $set: { profileImage: url } },
      { returnDocument: "after", projection: { password: 0 } }
    );

    res.json({
      message: "✅ Profile image updated",
      user: updated.value,
      url,
    });
  } catch (err) {
    console.error("❌ saveProfileImage error:", err);
    res.status(500).json({ message: "❌ Error saving profile image" });
  }
};


export const uploadCertificateAlt = async (req, res) => {
  try {
    ensureJobseeker(req, res);

    if (!req.file)
      return res.status(400).json({ message: "❌ No file uploaded" });

    const db = req.app.locals.db;
    const users = db.collection("users");

    const url = `/uploads/${req.file.filename}`;

    const updated = await users.findOneAndUpdate(
      { _id: new ObjectId(req.user.userId) },
      { $push: { "certificates.other": url } },
      { returnDocument: "after" }
    );

    res.json({
      message: "✅ Certificate uploaded",
      url,
      user: updated.value,
    });
  } catch (err) {
    console.error("❌ uploadCertificateAlt error:", err);
    res.status(500).json({ message: "❌ Certificate upload error" });
  }
};
