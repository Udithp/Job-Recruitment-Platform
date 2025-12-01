import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function JobCard({ job }) {
  const rawLogo = job?.company?.logo || "";

  // FIX: route company logos to /company-logos
  const cleanLogo = rawLogo.replace("/uploads", "").replace(/^\/+/, "");

  const logoUrl =
    rawLogo.startsWith("http")
      ? rawLogo
      : `http://localhost:5000/company-logos/${cleanLogo}`;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-4">
        <div className="d-flex align-items-start mb-3">
          <img
            src={logoUrl}
            alt={job.company?.name || "Company"}
            style={{
              width: "60px",
              height: "60px",
              objectFit: "contain",
              borderRadius: "10px",
              marginRight: "15px",
              background: "#fff",
              padding: "5px",
              border: "1px solid #ddd",
            }}
            onError={(e) => {
              e.target.src = "/default-logo.png";
            }}
          />

          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 700, color: "#0a58ca" }}>{job.title}</h3>
            <p className="text-dark mb-1">{job.company?.name}</p>
            <p className="text-secondary small d-flex align-items-center">
              <FaMapMarkerAlt className="me-1 text-danger" />
              {job.location}
            </p>
          </div>

          <Badge bg="primary">{job.type}</Badge>
        </div>

        <h6>Job Description</h6>
        <p>{job.description}</p>

        <h6 className="mt-3">Requirements / Skills</h6>
        <div className="d-flex flex-wrap gap-2">
          {job.skills?.map((skill, i) => (
            <span key={i} className="badge bg-info text-dark">
              {skill}
            </span>
          ))}
        </div>

        <Link to={`/jobs/${job._id}`}>
          <Button className="w-100 mt-3" variant="primary">
            View Details
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}
