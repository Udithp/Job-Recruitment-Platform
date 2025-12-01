// src/pages/JobseekerDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Image,
  Spinner,
  Badge,
} from "react-bootstrap";
import { motion } from "framer-motion";
import api from "../api/api"; // ⭐ FIX: Missing import
import { AuthContext } from "../context/AuthContext";

export default function JobseekerDashboard({ darkMode }) {
  const { user } = useContext(AuthContext);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ------------------------------------------------------
     LOAD APPLICATIONS
  ------------------------------------------------------- */
  const loadApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/api/jobseeker/applications");
      const data = res.data?.applications || [];
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load applications error:", err);
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  /* ------------------------------------------------------
     FIXED COMPANY LOGO BUILDER
     Matches your server.js route → /company-logos
  ------------------------------------------------------- */
  const getLogo = (job) => {
    if (!job) return "http://localhost:5000/company-logos/default.png";

    const rawLogo =
      job.company?.logo ||
      job.companyLogo ||
      job.logo ||
      job.companyLogoUrl ||
      "";

    if (!rawLogo) return "http://localhost:5000/company-logos/default.png";

    const fileName = rawLogo.split("/").pop();
    return `http://localhost:5000/company-logos/${fileName}`;
  };

  const getTitle = (job) =>
    job?.title || job?.position || job?.name || "Untitled Job";

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return isNaN(date) ? d : date.toLocaleDateString();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 30,
        background: darkMode ? "#071019" : "#f8fafc",
      }}
    >
      <Container>
        <Row className="mb-4 align-items-center">
          <Col>
            <h3 style={{ color: darkMode ? "#e2e8f0" : "#0f172a" }}>
              Application Tracker
            </h3>
          </Col>

          <Col xs="auto">
            <Button
              variant={darkMode ? "outline-light" : "outline-primary"}
              onClick={loadApplications}
            >
              Refresh
            </Button>
          </Col>
        </Row>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card
            style={{
              borderRadius: 16,
              background: darkMode ? "#0b1220" : "#fff",
            }}
          >
            <Card.Body style={{ padding: 0 }}>
              {/* LOADING */}
              {loading && (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: 180 }}
                >
                  <Spinner animation="border" />
                </div>
              )}

              {/* ERROR */}
              {!loading && error && (
                <div style={{ padding: 20, color: "red" }}>{error}</div>
              )}

              {/* EMPTY */}
              {!loading && !error && applications.length === 0 && (
                <div style={{ padding: 20 }}>
                  <h6>No applications yet.</h6>
                  <div className="text-muted">
                    Apply to jobs and they will appear here.
                  </div>
                </div>
              )}

              {/* LIST */}
              {!loading &&
                !error &&
                applications.map((app) => {
                  const job = app.job || {};

                  return (
                    <div
                      key={app._id}
                      style={{
                        padding: "14px 20px",
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      {/* Logo */}
                      <Image
                        src={getLogo(job)}
                        onError={(e) => {
                          e.target.src =
                            "http://localhost:5000/company-logos/default.png";
                        }}
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: "contain",
                          borderRadius: 10,
                          border: "1px solid #ddd",
                          background: "#fff",
                          padding: 4,
                        }}
                      />

                      {/* Job Info */}
                      <div style={{ flex: 1, marginLeft: 15 }}>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: darkMode ? "#e2e8f0" : "#111",
                          }}
                        >
                          {getTitle(job)}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            color: darkMode ? "#94a3b8" : "#555",
                          }}
                        >
                          {job.companyName || job.company?.name || ""}
                          {" • "}
                          {formatDate(app.appliedAt)}
                        </div>
                      </div>

                      {/* Status */}
                      <Badge bg="secondary" className="me-2">
                        {app.status || "Applied"}
                      </Badge>
                    </div>
                  );
                })}
            </Card.Body>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
