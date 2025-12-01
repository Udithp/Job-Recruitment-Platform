import React, { useState, useRef, useEffect } from "react";
import api from "../api/api";
import { Form, Button, Spinner, Alert, Card } from "react-bootstrap";
import { motion } from "framer-motion";

export default function ApplyForm({ jobId }) {
  const [cover, setCover] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [darkMode, setDarkMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const MAX_COVER_CHARS = 1500;
  const fileInputRef = useRef();

  // Toggle dark/light mode automatically if needed
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Handle file upload & validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validExtensions = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validExtensions.includes(file.type)) {
      setMessage({ type: "danger", text: "Invalid file type. Upload PDF or Word only." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "danger", text: "File too large. Max 5MB allowed." });
      return;
    }

    setResumeFile(file);
    setMessage({ type: "", text: "" });
  };

  // Submit application
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setMessage({ type: "danger", text: "Please upload your resume before submitting." });
      return;
    }

    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("coverLetter", cover);

      await api.post(`/api/applications/${jobId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage({ type: "success", text: "Application submitted successfully!" });
      setCover("");
      setResumeFile(null);
      fileInputRef.current.value = null;
    } catch (err) {
      console.error(err);
      setMessage({ type: "danger", text: "Failed to submit application. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // Floating background shapes
  const FloatingShape = ({ size, color, top, left, delay }) => (
    <motion.div
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 6, repeat: Infinity, delay }}
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}, transparent)`,
        filter: "blur(40px)",
        zIndex: 0,
      }}
    />
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "#111" : "#f4f6fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Background floating shapes */}
      <FloatingShape size="200px" color="#dbe8ff" top="10%" left="5%" delay={0} />
      <FloatingShape size="260px" color="#ffe7d0" top="65%" left="15%" delay={1} />
      <FloatingShape size="300px" color="#e1f4ff" top="25%" left="70%" delay={2} />

      {/* Dark Mode Toggle Button */}
      <motion.button
        onClick={toggleDarkMode}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 10,
          width: 50,
          height: 50,
          borderRadius: "50%",
          border: "none",
          fontSize: "1.2rem",
          cursor: "pointer",
          background: darkMode ? "#fdd835" : "#111",
          color: darkMode ? "#111" : "#fff",
        }}
        whileHover={{ scale: 1.1 }}
      >
        {darkMode ? "🌞" : "🌙"}
      </motion.button>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: "600px",
          borderRadius: "26px",
          padding: "40px",
          background: darkMode ? "rgba(25,25,25,0.95)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(15px)",
          boxShadow: darkMode
            ? "0 20px 60px rgba(0,0,0,0.5)"
            : "0 20px 60px rgba(0,0,0,0.08)",
          zIndex: 10,
          color: darkMode ? "#eee" : "#000",
        }}
      >
        <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "15px" }}>
          Submit Your Application
        </h2>
        <p style={{ color: darkMode ? "#aaa" : "#5c697a", marginBottom: "25px" }}>
          Upload your resume and include a cover letter. Recruiters usually respond within 3–5 days.
        </p>

        {message.text && (
          <Alert variant={message.type} className="mb-3">
            {message.text}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Cover Letter */}
          <Form.Group className="mb-4">
            <Form.Label>Cover Letter (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              maxLength={MAX_COVER_CHARS}
              placeholder="Write something to introduce yourself..."
              className={darkMode ? "bg-dark text-light" : "bg-light"}
            />
            <div className="small text-muted mt-1">
              {cover.length}/{MAX_COVER_CHARS} characters
            </div>
          </Form.Group>

          {/* Resume Upload */}
          <Form.Group className="mb-4">
            <Form.Label>Resume (PDF or Word)</Form.Label>
            <Form.Control
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className={darkMode ? "bg-dark text-light" : "bg-light"}
            />

            {resumeFile && (
              <div
                className={darkMode ? "mt-2 p-2 bg-secondary rounded border small text-light" : "mt-2 p-2 bg-light rounded border small text-muted"}
              >
                <strong>File:</strong> {resumeFile.name} <br />
                <strong>Size:</strong> {(resumeFile.size / 1024 / 1024).toFixed(2)} MB <br />
                <strong>Type:</strong> {resumeFile.type}
              </div>
            )}
          </Form.Group>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03, boxShadow: darkMode ? "0 0 15px #0ff" : "0 0 15px rgba(0,123,255,0.5)" }}
            disabled={submitting}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              background: darkMode ? "#0d6efd" : "#2563eb",
              color: "#fff",
              fontSize: "1.15rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {submitting ? <Spinner size="sm" animation="border" className="me-2" /> : null}
            {submitting ? "Submitting..." : "Submit Application"}
          </motion.button>
        </Form>
      </motion.div>
    </div>
  );
}
