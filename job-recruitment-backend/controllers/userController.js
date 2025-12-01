// controllers/userController.js
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";
import { ObjectId } from "mongodb";
import path from "path";
import fs from "fs";


const userUploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(userUploadsDir)) fs.mkdirSync(userUploadsDir, { recursive: true });


const formatUser = (user) => ({
  id: user._id ? String(user._id) : null,
  name: user.name || "",
  email: user.email || "",
  role: user.role || "jobseeker",

  profileImage: user.profileImage
    ? `/public/uploads/${path.basename(user.profileImage)}`
    : "",

  bio: user.bio || "",
  companyId: user.companyId || null,
  companyName: user.companyName || "",
  createdAt: user.createdAt || null,

  marks: user.marks || {},
  certificates: user.certificates || {},
});

export const registerUser = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");
    const companies = db.collection("companies");

    const {
      name,
      email,
      password,
      role,
      companyId,
      companyName,
      address,
      industry,
      website,
    } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "❌ All fields are required" });

    const emailNorm = email.toLowerCase();

    if (await users.findOne({ email: emailNorm })) {
      return res.status(400).json({ message: "❌ Email already registered" });
    }

    let finalCompanyId = null;
    let finalCompanyName = "";

    if (role === "employer") {
      if (!companyId || !companyName)
        return res.status(400).json({
          message: "❌ companyId + companyName required for employers",
        });

      if (await companies.findOne({ companyId }))
        return res
          .status(400)
          .json({ message: "❌ Company ID already exists" });

      const companyLogo = req.file ? `/uploads/${req.file.filename}` : "";

      await companies.insertOne({
        companyId,
        companyName,
        address: address || "",
        industry: industry || "",
        website: website || "",
        logo: companyLogo,
        createdAt: new Date(),
      });

      finalCompanyId = companyId;
      finalCompanyName = companyName;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email: emailNorm,
      password: hashedPassword,
      role,

      companyId: finalCompanyId,
      companyName: finalCompanyName,

      profileImage: "",
      certificates: {},
      marks: {},

      bio: "",
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    return res.status(201).json({
      message: "✅ Registered Successfully",
      token: generateToken({ userId: result.insertedId }),
      user: formatUser({ ...newUser, _id: result.insertedId }),
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "❌ Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");
    const companies = db.collection("companies");

    const { email, password, companyId } = req.body;
    const emailNorm = email.toLowerCase();

    const user = await users.findOne({ email: emailNorm });
    if (!user)
      return res.status(400).json({ message: "❌ Invalid email or password" });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "❌ Invalid email or password" });

    if (user.role === "employer") {
      if (!companyId)
        return res.status(400).json({
          message: "❌ Company ID is required for employer login",
        });

      if (companyId !== user.companyId)
        return res.status(400).json({
          message: "❌ Incorrect Company ID",
        });

      if (!(await companies.findOne({ companyId })))
        return res
          .status(400)
          .json({ message: "❌ Company profile does not exist" });
    }

    return res.json({
      message: "✅ Login Successful",
      token: generateToken({ userId: user._id }),
      user: formatUser(user),
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "❌ Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(req.user.userId) },
        { projection: { password: 0 } }
      );

    if (!user) return res.status(404).json({ message: "❌ User not found" });

    res.json({ user: formatUser(user) });
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res.status(500).json({ message: "❌ Server error" });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.bio !== undefined) updates.bio = req.body.bio;

    const updated = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(req.user.userId) },
      { $set: updates },
      { returnDocument: "after", projection: { password: 0 } }
    );

    if (!updated.value)
      return res.status(404).json({ message: "❌ User not found" });

    res.json({
      message: "✅ Profile updated successfully",
      user: formatUser(updated.value),
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ message: "❌ Error updating profile" });
  }
};


export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "❌ No image uploaded" });

    const db = req.app.locals.db;

    const imagePath = `/public/uploads/${req.file.filename}`;

    const updated = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(req.user.userId) },
      { $set: { profileImage: imagePath } },
      { returnDocument: "after", projection: { password: 0 } }
    );

    if (!updated.value)
      return res.status(404).json({ message: "❌ User not found" });

    res.json({
      message: "✅ Profile image updated",
      user: formatUser(updated.value),
    });
  } catch (err) {
    console.error("❌ Upload profile image error:", err);
    res.status(500).json({ message: "❌ Failed to upload image" });
  }
};
