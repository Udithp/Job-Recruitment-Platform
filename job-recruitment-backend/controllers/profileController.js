// controllers/profileController.js
import { ObjectId } from "mongodb";
export const getProfile = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - Missing userId" });
    }

    // Get user (exclude password)
    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("❌ getProfile error:", err);
    res.status(500).json({ message: "Server error loading profile" });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - Missing userId" });
    }

    // Fetch existing user
    const existingUser = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build update object safely
    const update = {};

    if (req.body.name) update.name = req.body.name.trim();
    if (req.body.bio !== undefined) update.bio = req.body.bio.trim();

    // If an image was uploaded
    if (req.file) {
      update.profileImage = `/user-uploads/${req.file.filename}`;
    }

    // Update user in DB
    const updated = await users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: update },
      { returnDocument: "after", projection: { password: 0 } }
    );

    return res.json({
      message: "Profile updated successfully",
      user: updated.value,
    });

  } catch (err) {
    console.error("❌ updateProfile error:", err);
    res.status(500).json({ message: "Server error updating profile" });
  }
};
