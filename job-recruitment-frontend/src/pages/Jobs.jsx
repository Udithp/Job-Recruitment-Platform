// src/pages/Jobs.jsx
import React, { useState, useEffect, useMemo } from "react";
import api from "../api/api";
import JobCard from "../components/JobCard";
import { Container, Row, Col, Form, Button, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("All");
  const [company, setCompany] = useState("All");
  const [skillsText, setSkillsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  // Read logged-in user role
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.get("/api/jobs");
      setJobs(res.data || []);
    } catch (err) {
      console.error("🔥 Job Fetch Error:", err);
      setErrorMsg("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Unique location list
  const locations = useMemo(() => {
    const setLoc = new Set();
    jobs.forEach((j) => j.location && setLoc.add(j.location));
    return ["All", ...Array.from(setLoc)];
  }, [jobs]);

  // Unique company list
  const companies = useMemo(() => {
    const setComp = new Set();
    jobs.forEach((j) => {
      if (j.company?.name) setComp.add(j.company.name);
    });
    return ["All", ...Array.from(setComp)];
  }, [jobs]);

  // Convert string → array of skills
  const skillsFilter = useMemo(() => {
    if (!skillsText) return [];
    return skillsText
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, [skillsText]);

  // Final filtered job list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const titleMatch = title
        ? job.title?.toLowerCase().includes(title.toLowerCase())
        : true;

      const locationMatch =
        location === "All"
          ? true
          : job.location?.toLowerCase() === location.toLowerCase();

      const companyMatch =
        company === "All"
          ? true
          : job.company?.name?.toLowerCase() === company.toLowerCase();

      const jobSkills = Array.isArray(job.skills)
        ? job.skills.map((s) => s.toLowerCase())
        : [];

      const skillsMatch =
        skillsFilter.length === 0
          ? true
          : skillsFilter.some((skill) =>
              jobSkills.some((js) => js.includes(skill))
            );

      return titleMatch && locationMatch && companyMatch && skillsMatch;
    });
  }, [jobs, title, location, company, skillsFilter]);

  const clearAll = () => {
    setTitle("");
    setLocation("All");
    setCompany("All");
    setSkillsText("");
  };

  return (
    <div style={{ background: "#f9f9f9", minHeight: "100vh", paddingTop: "80px" }}>

      {/* DASHBOARD BUTTON */}
      <div style={{ padding: "0 25px", marginBottom: "15px" }}>
        <Button
          variant="primary"
          style={{
            borderRadius: "12px",
            padding: "10px 20px",
            fontWeight: 600,
          }}
          onClick={() => {
            // Auto-detect role
            if (role === "employer") navigate("/employer-dashboard");
            else navigate("/jobseeker-dashboard");
          }}
        >
          Go to Dashboard
        </Button>
      </div>

      <Container>
        {/* FILTER BOX */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 mb-4 shadow-sm"
          style={{
            borderRadius: "20px",
            background: "#fff",
            border: "1px solid #eee",
          }}
        >
          <Form>
            <Row className="gx-3 gy-3">
              {/* TITLE SEARCH */}
              <Col md={5} sm={12} style={{ position: "relative" }}>
                <Form.Control
                  placeholder="Search job title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    borderRadius: "12px",
                    padding: "10px 42px 10px 14px",
                    height: "44px",
                  }}
                />

                {title && (
                  <FaTimes
                    onClick={() => setTitle("")}
                    style={{
                      position: "absolute",
                      right: "44px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#666",
                      cursor: "pointer",
                    }}
                  />
                )}

                <FaSearch
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#007bff",
                  }}
                />
              </Col>

              {/* LOCATION */}
              <Col md={2} sm={6}>
                <Form.Select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ borderRadius: "12px", height: "44px" }}
                >
                  {locations.map((loc, i) => (
                    <option value={loc} key={i}>
                      {loc}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              {/* COMPANY */}
              <Col md={2} sm={6}>
                <Form.Select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={{ borderRadius: "12px", height: "44px" }}
                >
                  {companies.map((c, i) => (
                    <option value={c} key={i}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              {/* SKILLS */}
              <Col md={3} sm={12}>
                <Form.Control
                  placeholder='Skills (comma separated) e.g. "React, AWS"'
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  style={{ borderRadius: "12px", height: "44px" }}
                />
              </Col>
            </Row>

            {/* COUNTS + CLEAR */}
            <Row className="mt-3 gx-2 align-items-center">
              <Col md={8}>
                <div style={{ color: "#666" }}>
                  Showing <strong>{filteredJobs.length}</strong> of{" "}
                  <strong>{jobs.length}</strong> jobs
                </div>

                {/* SKILL BADGES */}
                {skillsFilter.length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    {skillsFilter.map((skill, index) => (
                      <Badge
                        key={index}
                        bg="light"
                        text="dark"
                        style={{ padding: "6px 10px", borderRadius: 999 }}
                      >
                        {skill}
                        <FaTimes
                          style={{ marginLeft: 8, cursor: "pointer" }}
                          onClick={() => {
                            const arr = skillsText
                              .split(",")
                              .map((x) => x.trim())
                              .filter(Boolean);
                            arr.splice(index, 1);
                            setSkillsText(arr.join(", "));
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </Col>

              {/* CLEAR BUTTON */}
              <Col md={4} style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outline-secondary"
                  onClick={clearAll}
                  style={{ borderRadius: 12 }}
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </Form>
        </motion.div>

        {/* JOB RESULTS */}
        {loading ? (
          <h5 className="text-center mt-3">Loading jobs...</h5>
        ) : errorMsg ? (
          <div className="text-center text-danger my-4">{errorMsg}</div>
        ) : filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center w-100 mt-5"
          >
            <h5>No matching jobs found</h5>
            <p style={{ color: "#666" }}>Try adjusting your filters.</p>
          </motion.div>
        ) : (
          <Row className="g-4">
            {filteredJobs.map((job) => (
              <Col md={6} lg={4} key={job._id}>
                <JobCard job={job} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}
