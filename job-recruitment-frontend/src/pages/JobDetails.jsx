import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { motion } from "framer-motion";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/api/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching job details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  if (loading) return <h3 className="text-center mt-5">Loading job details…</h3>;
  if (!job) return <h3 className="text-center mt-5">Job not found.</h3>;

  const requirementsList = job.requirements
    ? job.requirements.split(",").map((r) => r.trim())
    : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: "80px 20px",
        background: "#f9f9f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating circles animation */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: ["-10%", "110%"] }}
            transition={{
              repeat: Infinity,
              duration: 20 + Math.random() * 20,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            style={{
              position: "absolute",
              top: "-10%",
              left: `${Math.random() * 100}%`,
              width: `${10 + Math.random() * 30}px`,
              height: `${10 + Math.random() * 30}px`,
              background: "rgba(200,200,200,0.15)",
              borderRadius: "50%",
            }}
          />
        ))}
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "900px",
        }}
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          style={{
            padding: "50px 40px",
            borderRadius: "20px",
            background: "#ffffff",
            boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
            border: "1px solid #e2e2e2",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Company Info */}
          {job.company && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
              }}
            >
              {job.company.logo && (
                <img
                  src={`http://localhost:5000${job.company.logo}`}   // FIXED ✔
                  alt={job.company.name}
                  style={{
                    height: "60px",
                    width: "60px",
                    objectFit: "contain",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  background: "linear-gradient(90deg, #007bff, #00d4ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {job.company.name}
              </span>
            </motion.div>
          )}

          {/* Job Title */}
          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: 900,
              color: "#0056b3",
              marginBottom: "15px",
            }}
          >
            {job.title}
          </h1>

          {/* Location & Type */}
          <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "20px" }}>
            📍 {job.location} • {job.type}
          </p>

          {/* Description */}
          {job.description && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "#007bff", marginBottom: "10px" }}>
                Job Description
              </h3>
              <p style={{ fontSize: "1rem", color: "#444", lineHeight: 1.7 }}>
                {job.description}
              </p>
            </div>
          )}

          {/* Requirements */}
          {requirementsList.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "#007bff", marginBottom: "10px" }}>
                Requirements
              </h3>
              <ul
                style={{
                  fontSize: "1rem",
                  color: "#444",
                  paddingLeft: "20px",
                  lineHeight: 1.6,
                }}
              >
                {requirementsList.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "25px",
              }}
            >
              {job.skills.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "30px",
                    background: "#e9f5ff",
                    border: "1px solid #bcdcff",
                    color: "#0056b3",
                    fontWeight: 600,
                    boxShadow: "0 0 5px rgba(0,0,0,0.05)",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Apply button */}
          <motion.button
            onClick={() => navigate(`/jobs/${id}/apply`)}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 6px 25px rgba(0,123,255,0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: "100%",
              padding: "16px",
              border: "none",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #007bff, #0056d6)",
              color: "white",
              fontSize: "1.25rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 5px 15px rgba(0,123,255,0.3)",
            }}
          >
            Apply Now
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
