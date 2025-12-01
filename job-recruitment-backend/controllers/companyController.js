// controllers/companyController.js
import { ObjectId } from "mongodb";
// Create a new company
export const createCompany = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const companies = db.collection("companies");

    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Company name is required" });
    }

    // Check duplicate company name
    const exists = await companies.findOne({ name: name.trim() });

    if (exists) {
      return res.status(400).json({ message: "Company already exists" });
    }

    const doc = {
      name: name.trim(),
      logo: "",
      createdAt: new Date()
    };

    const result = await companies.insertOne(doc);

    return res.json({
      message: "Company created successfully",
      company: { ...doc, _id: result.insertedId }
    });

  } catch (err) {
    console.error("createCompany error:", err);
    return res.status(500).json({ message: "Server error creating company" });
  }
};

/* =====================================================
   VERIFY COMPANY (USED IN PostJob.jsx)
   GET /api/company/verify/:companyId
===================================================== */
export const verifyCompany = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const companies = db.collection("companies");

    const { companyId } = req.params;

    if (!ObjectId.isValid(companyId)) {
      return res.json({ valid: false });
    }

    const company = await companies.findOne({ _id: new ObjectId(companyId) });

    if (!company) return res.json({ valid: false });

    // Ensure logo field is a usable path (empty or starts with /uploads or url)
    const logo = company.logo && company.logo.trim() !== "" ? company.logo : "";

    return res.json({
      valid: true,
      company: { ...company, logo }
    });

  } catch (err) {
    console.error("verifyCompany error:", err);
    return res.json({ valid: false });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const companies = db.collection("companies");

    const { companyId } = req.params;

    if (!ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const logoPath = `/uploads/${req.file.filename}`;

    const updated = await companies.findOneAndUpdate(
      { _id: new ObjectId(companyId) },
      { $set: { logo: logoPath } },
      { returnDocument: "after" }
    );

    return res.json({
      message: "Logo uploaded successfully",
      logo: logoPath,
      company: updated.value
    });

  } catch (err) {
    console.error("uploadLogo error:", err);
    return res.status(500).json({ message: "Logo upload failed" });
  }
};
