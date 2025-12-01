// src/pages/JobApplications.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function JobApplications() {
  const { id } = useParams(); // Job ID
  const { user, token } = useContext(AuthContext);

  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch job applications + job details
  useEffect(() => {
    if (!token || user?.role !== "employer") return;

    const fetchData = async () => {
      try {
        const [appsRes, jobRes] = await Promise.all([
          api.get(`/applications/job/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/jobs/${id}`)
        ]);

        setApplications(appsRes.data || []);
        setJob(jobRes.data);
      } catch (err) {
        console.error("Error fetching job applications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, user]);

  if (!user || user.role !== "employer") {
    return (
      <Container className="mt-5 text-center">
        <h3>❌ Only employers can view job applicants.</h3>
        <Link to="/">Go Home</Link>
      </Container>
    );
  }

  if (loading) return <h3 className="text-center mt-5">Loading applications…</h3>;

  if (!applications.length)
    return (
      <Container className="mt-5 text-center">
        <h4>No applications yet for this job.</h4>
      </Container>
    );

  const companyLogo = job?.company?.logo
    ? `http://localhost:5000${job.company.logo}`
    : "https://via.placeholder.com/60";

  return (
    <Container style={{ paddingTop: "90px", maxWidth: "900px" }}>
      <div className="mb-4 text-center">
        <img
          src={companyLogo}
          alt={job?.company?.name}
          style={{
            width: 80,
            height: 80,
            objectFit: "contain",
            borderRadius: 12,
            marginBottom: 10,
          }}
        />
        <h2>{job?.title}</h2>
        <p className="text-muted">{job?.company?.name}</p>
      </div>

      {applications.map((app, index) => (
        <motion.div
          key={app._id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-3"
        >
          <Card className="shadow-sm">
            <Card.Body className="d-flex justify-content-between">
              
              {/* Applicant Info */}
              <div>
                <h5>{app.applicantName || "Applicant"}</h5>
                <p className="mb-1">
                  <strong>Email:</strong> {app.applicantEmail}
                </p>
                <small className="text-muted">
                  Applied on:{" "}
                  {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "N/A"}
                </small>
              </div>

              {/* Actions */}
              <div className="d-flex flex-column align-items-end">
                {app.resumeUrl && (
                  <Button
                    href={`http://localhost:5000${app.resumeUrl}`}
                    target="_blank"
                    variant="outline-primary"
                    size="sm"
                    className="mb-2"
                  >
                    View Resume
                  </Button>
                )}

                <Button as={Link} to={`/jobs/${id}`} size="sm" variant="secondary">
                  View Job
                </Button>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      ))}
    </Container>
  );
}
