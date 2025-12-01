// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;


    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "❌ No token provided" });
    }

    const token = authHeader.split(" ")[1];


    if (!token || typeof token !== "string" || token.split(".").length !== 3) {
      return res.status(401).json({ message: "❌ Invalid / malformed token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("❌ JWT Verify Error:", err.message);
      return res.status(401).json({ message: "❌ Invalid or expired token" });
    }

 
    const finalUserId = decoded.userId || decoded.id;

    if (!finalUserId) {
      return res.status(401).json({ message: "❌ Token missing userId field" });
    }


    const db = req.app.locals.db;
    const users = db.collection("users");
    const companies = db.collection("companies");

    const user = await users.findOne({ _id: new ObjectId(finalUserId) });

    if (!user) {
      return res.status(401).json({ message: "❌ User not found" });
    }

    
    let companyInfo = {};
    if (user.role === "employer" && user.companyId) {
      companyInfo =
        (await companies.findOne({ companyId: user.companyId })) || {};
    }


    req.user = {
      userId: String(user._id),
      role: user.role,
      name: user.name,
      email: user.email,

      // Employer extras
      companyId: user.companyId || null,
      companyName: user.companyName || companyInfo.companyName || "",
      companyLogo: companyInfo.logo || "/uploads/default.png",
    };

    req.user.company = {
      name: req.user.companyName,
      logo: req.user.companyLogo,
    };

    next();
  } catch (err) {
    console.error("❌ Auth error:", err);
    return res.status(401).json({ message: "❌ Unauthorized access" });
  }
};
