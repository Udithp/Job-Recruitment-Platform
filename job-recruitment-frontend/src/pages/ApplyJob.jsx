import React, { useState, useRef, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function ApplyJob() {
  const { id } = useParams(); // Job ID
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const { user } = useContext(AuthContext);

  const [resumeUrl, setResumeUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect IF not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // 📌 UPLOAD RESUME
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const token = localStorage.getItem("token");

      const res = await api.post("/api/upload/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });

      setResumeUrl(res.data.url);
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed! Make sure you are logged in.");
    }

    setUploading(false);
  };

  // 📌 SUBMIT APPLICATION
  const handleApply = async () => {
    if (!resumeUrl) return alert("Please upload your resume first!");

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      await api.post(`/api/applications/${id}`, { resumeUrl }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(true);
      setTimeout(() => navigate("/jobs"), 2000);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit application!");
    }

    setSubmitting(false);
  };

  // 🎨 Floating Background Bubbles
  const FloatingShape = ({ size, color, top, left, delay }) => (
    <motion.div
      animate={{ y: [0, -30, 0] }}
      transition={{ duration: 6, repeat: Infinity, delay }}
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}, transparent)`,
        filter: "blur(35px)",
        zIndex: 0
      }}
    />
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom,#f2f6ff,#e9efff,#e7eeff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background Bubbles */}
      <FloatingShape size="220px" color="#cce1ff" top="10%" left="5%" delay={0} />
      <FloatingShape size="300px" color="#ffe3c2" top="60%" left="10%" delay={1} />
      <FloatingShape size="280px" color="#d1f0ff" top="30%" left="70%" delay={2} />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: "580px",
          borderRadius: "26px",
          padding: "40px",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(15px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          zIndex: 2,
          color: "#000"
        }}
      >
        <h2 style={{ fontWeight: 800 }}>Apply for This Job</h2>
        <p style={{ color: "#6c7480", marginBottom: "25px", fontWeight: 500 }}>
          Upload your resume and get shortlisted faster.
        </p>

        {/* Resume Upload */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            fileInputRef.current.files = e.dataTransfer.files;
            handleResumeUpload({ target: fileInputRef.current });
          }}
          style={{
            padding: "35px",
            borderRadius: "20px",
            border: "3px dashed #0a58ca",
            background: "#f8faff",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "25px",
            fontSize: "1.15rem",
            fontWeight: "700",
            color: "#0a58ca",
            transition: "0.3s"
          }}
        >
          📄 {uploading ? "Uploading..." : resumeUrl ? "✔ Resume Uploaded" : "Click / Drop Resume Here"}
          <input type="file" hidden ref={fileInputRef} onChange={handleResumeUpload} />
          <p style={{ fontSize: "0.8rem", color: "#777", marginTop: "8px" }}>
            Accepted formats: PDF, DOC, DOCX
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          onClick={handleApply}
          disabled={submitting}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "14px",
            border: "none",
            background: "#0a58ca",
            color: "#fff",
            fontSize: "1.15rem",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </motion.button>

        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              color: "#0a58ca",
              fontWeight: 700,
              marginTop: "15px",
              textAlign: "center"
            }}
          >
            🎉 Application Submitted!
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
