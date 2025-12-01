// src/pages/EmployerDashboard.jsx
import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Image,
  Badge,
  Spinner,
  Alert,
  OverlayTrigger,
  Tooltip,
  Form,
  InputGroup,
  Dropdown,
  DropdownButton,
  Modal,
  Table,
} from "react-bootstrap";
import { motion } from "framer-motion";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


const BACKEND_BASE = "http://localhost:5000";

const safe = (fn, fallback = null) => {
  try {
    const v = fn();
    return v === undefined ? fallback : v;
  } catch {
    return fallback;
  }
};

const getCompanyLogo = (job) => {
  // job can contain many shapes; check multiple possible fields
  const c = job?.company || {};
  const candidates = [
    job?.logo,
    c?.logo,
    c?.companyLogo,
    job?.companyLogo,
    c?.company_logo,
    job?.company_logo,
    c?.companyLogoUrl,
    job?.companyLogoUrl,
    c?.image,
    job?.image,
  ];
  const logo = candidates.find((x) => typeof x === "string" && x.trim().length > 0) || null;
  if (!logo) return `${BACKEND_BASE}/uploads/default-company.png`;
  if (logo.startsWith("http://") || logo.startsWith("https://")) return logo;
  return `${BACKEND_BASE}${logo.startsWith("/") ? "" : "/"}${logo}`;
};

const getProfileImage = (applicant) => {
  if (!applicant) return `${BACKEND_BASE}/uploads/default-profile.png`;
  const candidates = [
    applicant?.profileImage,
    applicant?.avatar,
    applicant?.photo,
    applicant?.image,
    applicant?.profile_image,
  ];
  const img = candidates.find((x) => typeof x === "string" && x.trim().length > 0) || null;
  if (!img) return `${BACKEND_BASE}/uploads/default-profile.png`;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  return `${BACKEND_BASE}${img.startsWith("/") ? "" : "/"}${img}`;
};


const getResumeUrl = (raw) => {
  if (!raw) return null;
  if (typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Already an absolute link
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  // If starts with /user-uploads or /uploads
  if (trimmed.startsWith("/user-uploads") || trimmed.startsWith("/uploads")) {
    return `${BACKEND_BASE}${trimmed}`;
  }

  // If contains public/uploads (filesystem style)
  if (trimmed.includes("public/uploads") || trimmed.includes("public\\uploads")) {
    const parts = trimmed.split(/[/\\]/);
    const file = parts.pop();
    return `${BACKEND_BASE}/user-uploads/${file}`;
  }

  // If it's just a filename
  if (!trimmed.startsWith("/")) {
    // try user-uploads first
    return `${BACKEND_BASE}/user-uploads/${trimmed}`;
  }

  // fallback to prefixing backend
  return `${BACKEND_BASE}${trimmed}`;
};

export default function EmployerDashboard({ darkMode }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // local state
  const [myJobs, setMyJobs] = useState([]);
  const [applications, setApplications] = useState({}); // shape: { jobId: [app,...] }
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  // UI controls
  const [query, setQuery] = useState("");
  const [applicantSearch, setApplicantSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | accepted | rejected
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [applicantModalData, setApplicantModalData] = useState(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [busyAction, setBusyAction] = useState(false);

  // small date formatter
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return "";
    }
  };


  const loadMyJobs = useCallback(
    async (signal) => {
      setError("");
      try {
        const res = await api.get("/api/employer/jobs", { signal });

        // backend may return { jobs: [...] } or an array directly
        const jobs = safe(() => res.data.jobs, null) || safe(() => res.data, null) || [];

        // normalize
        const normalized = (Array.isArray(jobs) ? jobs : []).map((j) => {
          const company = j.company || {};
          return {
            ...j,
            company: {
              name:
                company.name ||
                company.companyName ||
                j.companyName ||
                user?.companyName ||
                "Company",
              logo:
                company.logo ||
                company.companyLogo ||
                j.companyLogo ||
                j.logo ||
                company.companyLogoUrl ||
                company.image ||
                "/uploads/default-company.png",
            },
          };
        });

        normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyJobs(normalized);
      } catch (err) {
        console.error("Load jobs error:", err);
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        if (err?.response?.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        setError(err?.response?.data?.message || "Failed to load jobs. Try again.");
      }
    },
    [navigate, user?.companyName]
  );

  // --------------------------
  // Load applications for a list of jobs concurrently
  // --------------------------
  const loadApplications = useCallback(
    async (jobsList, signal) => {
      if (!jobsList || jobsList.length === 0) {
        setApplications({});
        return;
      }

      try {
        const promises = jobsList.map((job) =>
          api
            .get(`/api/employer/jobs/${job._id}/applications`, { signal })
            .then((resp) => ({ jobId: job._id, apps: resp.data.applications || resp.data || [] }))
            .catch((err) => {
              if (err?.name === "CanceledError" || err?.name === "AbortError") {
                return { jobId: job._id, apps: [] };
              }
              if (err?.response?.status === 401) throw err;
              console.warn(`Failed to fetch applications for job ${job._id}`, err);
              return { jobId: job._id, apps: [] };
            })
        );

        const results = await Promise.all(promises);
        const map = {};
        for (const r of results) {
          map[r.jobId] = (r.apps || []).map((a) => ({
            ...a,
            applicantDetails: a.applicantDetails || a.user || a.applicant || null,
            resumeUrl: a.resumeUrl || a.resume || a.cv || a.resume_link || null,
          }));
        }
        setApplications(map);
      } catch (err) {
        console.error("loadApplications error:", err);
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        if (err?.response?.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
      }
    },
    [navigate]
  );

  // initial load & refreshKey
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    (async () => {
      await loadMyJobs(controller.signal);
      setLoading(false);
    })();
    return () => controller.abort();
  }, [loadMyJobs, refreshKey]);

  // when myJobs changes, load their applications
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      if (myJobs && myJobs.length > 0) {
        await loadApplications(myJobs, controller.signal);
      } else {
        setApplications({});
      }
    })();
    return () => controller.abort();
  }, [myJobs, loadApplications]);

  // --------------------------
  // Update application status (accept/reject)
  // --------------------------
  const updateStatus = async (appId, status, jobId) => {
    if (!window.confirm(`Change status to "${status}" ?`)) return;
    setBusyAction(true);
    try {
      // optimistic update
      setApplications((prev) => {
        const copy = { ...prev };
        copy[jobId] = (copy[jobId] || []).map((a) => (a._id === appId ? { ...a, status } : a));
        return copy;
      });

      await api.put(`/api/employer/applications/${appId}/status`, { status });

      alert("Status updated successfully");
    } catch (err) {
      console.error("updateStatus error:", err);
      alert(err?.response?.data?.message || "Failed to update status");
      // reload as fallback
      setRefreshKey((k) => k + 1);
    } finally {
      setBusyAction(false);
    }
  };

  // --------------------------
  // Delete a job (and its applications)
  // --------------------------
  const deleteJob = async (jobId) => {
    if (!window.confirm("Delete this job and all its applications?")) return;
    setBusyAction(true);
    try {
      await api.delete(`/api/employer/jobs/${jobId}`);
      alert("Job deleted.");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("deleteJob error:", err);
      alert(err?.response?.data?.message || "Failed to delete job");
    } finally {
      setBusyAction(false);
    }
  };

  // --------------------------
  // Helper: open applicant modal
  // --------------------------
  const openApplicantModal = (app) => {
    setApplicantModalData(app);
    setShowApplicantModal(true);
  };

  const closeApplicantModal = () => {
    setApplicantModalData(null);
    setShowApplicantModal(false);
  };


  const filteredJobs = useMemo(() => {
    let list = Array.isArray(myJobs) ? myJobs.slice() : [];

    if (query && query.trim().length > 0) {
      const q = query.toLowerCase();
      list = list.filter(
        (j) =>
          (j.title || "").toLowerCase().includes(q) ||
          (safe(() => j.company.name, "") || "").toLowerCase().includes(q) ||
          (j.location || "").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

    return list;
  }, [myJobs, query, sortOrder]);

  // small count helper
  const totalApplicationsCount = useMemo(() => {
    return Object.values(applications).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  }, [applications]);


  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "70vh" }}>
        <Spinner animation="border" />
      </div>
    );
  }


  return (
    <Container style={{ paddingTop: 100, paddingBottom: 80 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ color: darkMode ? "#e6f7ff" : "#111" }}>Employer Dashboard</h2>
          <div style={{ color: darkMode ? "#aaaaaa" : "#444", fontSize: 14 }}>
            Logged in as: <strong>{user?.name || "—"}</strong>{" "}
            <span style={{ marginLeft: 12 }}>
              <small>Company: {user?.companyName || "—"}</small>
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center">
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={() => setRefreshKey((k) => k + 1)}
            aria-label="Refresh jobs"
            disabled={busyAction}
          >
            Refresh
          </Button>

          <Button
            onClick={() => navigate("/post-job")}
            style={{ background: "#007bff", border: "none", color: "#fff", fontWeight: 600 }}
            aria-label="Post job"
            disabled={busyAction}
          >
            + Post Job
          </Button>
        </div>
      </div>

      {/* Controls row (search, filters) */}
      <Row className="mb-4 align-items-center">
        <Col md={5}>
          <InputGroup>
            <Form.Control
              placeholder="Search jobs by title, company or location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <DropdownButton
              as={InputGroup.Append}
              variant={darkMode ? "light" : "secondary"}
              style={{ color: darkMode ? "#000" : "#fff", background: darkMode ? "#e2e8f0" : "#6c757d", border: "none", fontWeight: 600 }}
              title="Sort"
              id="sort-dropdown"
            >
              <Dropdown.Item onClick={() => setSortOrder("newest")} active={sortOrder === "newest"}>
                Newest
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortOrder("oldest")} active={sortOrder === "oldest"}>
                Oldest
              </Dropdown.Item>
            </DropdownButton>
          </InputGroup>
        </Col>

        <Col md={4}>
          <InputGroup>
            <Form.Control
              placeholder="Search applicants by name or email..."
              value={applicantSearch}
              onChange={(e) => setApplicantSearch(e.target.value)}
            />
            <DropdownButton
              as={InputGroup.Append}
              variant={darkMode ? "light" : "secondary"}
              style={{ color: darkMode ? "#000" : "#fff", background: darkMode ? "#e2e8f0" : "#6c757d", border: "none", fontWeight: 600 }}
              title={statusFilter === "all" ? "Status: All" : `Status: ${statusFilter}`}
              id="status-filter"
            >
              <Dropdown.Item onClick={() => setStatusFilter("all")} active={statusFilter === "all"}>
                All
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter("pending")} active={statusFilter === "pending"}>
                Pending
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter("accepted")} active={statusFilter === "accepted"}>
                Accepted
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter("rejected")} active={statusFilter === "rejected"}>
                Rejected
              </Dropdown.Item>
            </DropdownButton>
          </InputGroup>
        </Col>

        <Col md={3} className="text-end">
          <div style={{ fontSize: 14, color: darkMode ? "#e5e5e5" : "#444", fontWeight: 500 }}>
            Jobs: <strong>{filteredJobs.length}</strong> &nbsp; • &nbsp; Applications:{" "}
            <strong>{totalApplicationsCount}</strong>
          </div>
        </Col>
      </Row>

      {/* count card + main error */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="p-3" style={{ borderRadius: 12, background: darkMode ? "#071126" : "#fff" }}>
            <div style={{ fontSize: 13, color: darkMode ? "#c8d4ff" : "#222" }}>Total Posts</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: darkMode ? "#fff" : "#111" }}>{myJobs.length}</div>
          </Card>
        </Col>

        <Col md={8}>{error && <Alert variant="danger">{error}</Alert>}</Col>
      </Row>

      {/* no jobs */}
      {!filteredJobs.length && (
        <div style={{ marginTop: 50, textAlign: "center", color: "#888" }}>
          <h4>No jobs posted yet.</h4>
          <p>Click the + button above to post your first job.</p>
        </div>
      )}

      {/* jobs list */}
      {filteredJobs.map((job) => {
        const jobApps = applications[job._id] || [];
        // apply applicant search + status filter to the displayed list for this job
        const displayedApps = jobApps.filter((a) => {
          // status filter
          if (statusFilter !== "all" && (a.status || "pending") !== statusFilter) return false;
          // applicant search
          if (applicantSearch && applicantSearch.trim().length > 0) {
            const s = applicantSearch.toLowerCase();
            const name = safe(() => a.applicantDetails?.name, "") || "";
            const email = safe(() => a.applicantDetails?.email, "") || "";
            return name.toLowerCase().includes(s) || email.toLowerCase().includes(s);
          }
          return true;
        });

        return (
          <motion.div key={job._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card
              style={{
                borderRadius: 16,
                padding: 18,
                marginBottom: 24,
                background: darkMode ? "#07101a" : "#ffffff",
                color: darkMode ? "#e6f7ff" : "#222",
              }}
            >
              <Row className="align-items-center">
                <Col md={8}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Small logo next to title (left) */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee" }}>
                        <Image
                          src={getCompanyLogo(job)}
                          width={56}
                          height={56}
                          alt={`${job.company?.name || "Company"} logo`}
                          style={{ objectFit: "contain" }}
                        />
                      </div>

                      <div>
                        <h4 style={{ marginBottom: 2, color: darkMode ? "#ffffff" : "#111111" }}>{job.title}</h4>
                        <div style={{ fontSize: 14, color: darkMode ? "#c8d4ff" : "#444" }}>{job.location}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center" }}>
                    <div>
                      <strong style={{ color: darkMode ? "#e6f7ff" : "#222" }}>Company:</strong> <span style={{ color: darkMode ? "#fff" : "#222" }}>{job.company?.name || user?.companyName}</span>
                    </div>
                    <div>
                      <strong>Posted:</strong> {formatDate(job.createdAt)}
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <small style={{ color: darkMode ? "#b9c2d0" : "#555" }}>
                      {job.description ? (job.description.length > 220 ? job.description.slice(0, 220) + "…" : job.description) : "No description"}
                    </small>
                  </div>
                </Col>

                <Col md={4} className="text-end">
                  <div>
                    <OverlayTrigger placement="left" overlay={<Tooltip>Delete this job</Tooltip>}>
                      <Button variant="outline-danger" size="sm" className="me-2" onClick={() => deleteJob(job._id)} disabled={busyAction}>
                        Delete
                      </Button>
                    </OverlayTrigger>

                    <Button variant="outline-secondary" size="sm" onClick={() => navigate(`/jobs/${job._id}`)}>
                      View
                    </Button>
                  </div>

                  {/* small summary on the right */}
                  <div style={{ marginTop: 12 }}>
                    <Badge bg="secondary">{job.type || "Full-time"}</Badge>
                    <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>{(displayedApps || []).length} applications</div>
                  </div>
                </Col>
              </Row>

              <hr />

              {/* Applications section */}
              <h5>Applications ({(jobApps || []).length})</h5>

              {!jobApps.length && <div style={{ color: darkMode ? "#00eaff" : "#000", fontWeight: 600, padding: "10px 0", fontSize: "1rem" }}>No applications yet.</div>}

              {(displayedApps || []).map((app) => (
                <Card
                  key={app._id}
                  style={{
                    borderRadius: 12,
                    padding: 12,
                    marginTop: 12,
                    background: darkMode ? "#081521" : "#f7f7f7",
                  }}
                >
                  <Row className="align-items-center">
                    <Col md={2}>
                      <Image
                        src={getProfileImage(app.applicantDetails || {})}
                        width={64}
                        height={64}
                        roundedCircle
                        alt={app.applicantDetails?.name || "Applicant"}
                        style={{ objectFit: "cover", border: "2px solid #007bff" }}
                      />
                    </Col>

                    <Col md={5}>
                      <h6 style={{ marginBottom: 4, color: darkMode ? "#ffffff" : "#111" }}>{app.applicantDetails?.name || "Unknown"}</h6>
                      <div style={{ color: darkMode ? "#d0d8de" : "#666", fontSize: 14 }}>{app.applicantDetails?.email || "—"}</div>

                      <div style={{ marginTop: 6 }}>
                        <Badge bg={app.status === "accepted" ? "success" : app.status === "rejected" ? "danger" : "warning"}>
                          {app.status || "Pending"}
                        </Badge>

                        <small style={{ marginLeft: 10, color: "#999" }}>
                          Applied: {formatDate(app.appliedAt || app.createdAt || job.createdAt)}
                        </small>
                      </div>
                    </Col>

                    <Col md={3}>
                      {getResumeUrl(app.resumeUrl || app.resume) ? (
                        <a href={getResumeUrl(app.resumeUrl || app.resume)} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline-info" size="sm">
                            View Resume
                          </Button>
                        </a>
                      ) : (
                        <Button variant="outline-secondary" size="sm" disabled>
                          No resume
                        </Button>
                      )}
                    </Col>

                    <Col md={2} className="text-end">
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => updateStatus(app._id, "accepted", job._id)}
                        disabled={busyAction || app.status === "accepted"}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => updateStatus(app._id, "rejected", job._id)}
                        disabled={busyAction || app.status === "rejected"}
                      >
                        Reject
                      </Button>

                      {/* quick view */}
                      <div style={{ marginTop: 8 }}>
                        <Button variant="light" size="sm" onClick={() => { setSelectedJobForModal(job); openApplicantModal(app); }}>
                          Quick View
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Card>
          </motion.div>
        );
      })}

      {/* floating add job button */}
      <motion.div
        onClick={() => navigate("/post-job")}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: 34,
          right: 34,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#007bff",
          color: "#fff",
          fontSize: "36px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          zIndex: 999,
        }}
        role="button"
        aria-label="Add job"
      >
        +
      </motion.div>

      {/* Applicant quick view modal */}
      <Modal show={showApplicantModal} onHide={closeApplicantModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Applicant Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {applicantModalData ? (
            <>
              <Row>
                <Col md={3} className="text-center">
                  <Image src={getProfileImage(applicantModalData.applicantDetails || {})} roundedCircle width={120} height={120} style={{ objectFit: "cover" }} />
                </Col>
                <Col md={9}>
                  <h4 style={{ color: darkMode ? "#ffffff" : "#111" }}>{applicantModalData.applicantDetails?.name || "Unknown"}</h4>
                  <div style={{ color: darkMode ? "#d0d8de" : "#666" }}>{applicantModalData.applicantDetails?.email}</div>
                  <div style={{ marginTop: 8 }}>
                    <Badge bg={applicantModalData.status === "accepted" ? "success" : applicantModalData.status === "rejected" ? "danger" : "warning"}>
                      {applicantModalData.status || "Pending"}
                    </Badge>
                    <small style={{ marginLeft: 12, color: "#999" }}>Applied: {formatDate(applicantModalData.appliedAt || applicantModalData.createdAt)}</small>
                  </div>
                </Col>
              </Row>

              <hr />

              <h6>Resume</h6>
              {getResumeUrl(applicantModalData.resumeUrl || applicantModalData.resume) ? (
                <div>
                  <a href={getResumeUrl(applicantModalData.resumeUrl || applicantModalData.resume)} target="_blank" rel="noopener noreferrer">
                    Open resume
                  </a>
                </div>
              ) : (
                <div style={{ color: "#888" }}>No resume URL available.</div>
              )}

              <hr />
              <h6>Application Details</h6>
              <Table bordered size="sm">
                <tbody>
                  <tr>
                    <th>Applied at</th>
                    <td>{formatDate(applicantModalData.appliedAt || applicantModalData.createdAt)}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{applicantModalData.status || "pending"}</td>
                  </tr>
                  <tr>
                    <th>Message / Cover Letter</th>
                    <td style={{ whiteSpace: "pre-wrap" }}>{applicantModalData.message || applicantModalData.coverLetter || "—"}</td>
                  </tr>
                </tbody>
              </Table>
            </>
          ) : (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeApplicantModal}>
            Close
          </Button>
          {applicantModalData && (
            <>
              <Button variant="success" onClick={() => { updateStatus(applicantModalData._id, "accepted", selectedJobForModal?._id); closeApplicantModal(); }} disabled={busyAction}>
                Accept
              </Button>
              <Button variant="danger" onClick={() => { updateStatus(applicantModalData._id, "rejected", selectedJobForModal?._id); closeApplicantModal(); }} disabled={busyAction}>
                Reject
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

