// src/pages/PostJob.jsx
import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import {
  Container,
  Form,
  Button,
  Card,
  Image,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Row,
  Col,
  InputGroup,
  Alert,
} from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

function SmallPreview({ src, size = 110, alt = "logo", className = "" }) {
  // Renders an <Image /> with a fallback if the image fails to load.
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(!!src);

  useEffect(() => {
    setFailed(false);
    setLoading(!!src);
  }, [src]);

  // If src starts with http/https leave it, otherwise allow relative path (browser will request backend domain)
  const effectiveSrc = src || "/uploads/default-company.png";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #e6e6e6",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className={className}
    >
      {loading && !failed ? (
        <Image
          src={effectiveSrc}
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => {
            setFailed(true);
            setLoading(false);
          }}
        />
      ) : failed ? (
        <div style={{ padding: 8, textAlign: "center", color: "#999", fontSize: 12 }}>
          No image
        </div>
      ) : (
        <Image
          src={effectiveSrc}
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
          alt={alt}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

/* Drag & Drop area component (self-contained) */
function DragDropArea({
  onFileSelected,
  fileName,
  onChooseClick,
  dragOver,
  setDragOver,
  hint = "Click or drop company logo here",
}) {
  return (
    <div
      onClick={onChooseClick}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer?.files;
        if (files && files.length) onFileSelected(files[0]);
      }}
      style={{
        border: dragOver ? "2px dashed #0b5cff" : "2px dashed rgba(0,0,0,0.12)",
        borderRadius: 8,
        padding: 12,
        cursor: "pointer",
        minHeight: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        background: "rgba(255,255,255,0.02)",
      }}
      title={hint}
    >
      <div style={{ fontWeight: 600, color: "#333" }}>
        {fileName || hint}
        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
          PNG / JPG / SVG recommended — 2MB max (server-side rules apply)
        </div>
      </div>

      <div>
        <Button size="sm" variant="outline-primary" onClick={(e) => { e.stopPropagation(); onChooseClick(); }}>
          Choose
        </Button>
      </div>
    </div>
  );
}

export default function PostJob() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // logged user company values (if employer)
  const loggedCompanyId = user?.companyId || "";
  const loggedCompanyName = user?.companyName || "";

  // form state
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    skills: "",
    type: "Full-time",
  });

  // UI & status
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false); // for background tasks & upload
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState("info"); // 'error' | 'success' | 'info'
  const [uploadProgress, setUploadProgress] = useState(null); // not used by axios here but reserved

  // refs for scroll-to-error
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const companyIdRef = useRef(null);
  const topRef = useRef(null);
  const fileInputRef = useRef(null);

  // small utility to scroll and focus first error field
  const scrollToRef = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      try {
        ref.current.querySelector("input, textarea, select")?.focus();
      } catch (e) {
        // ignore
      }
    }
  };

  // Display helper for messages
  const showMessage = (text, kind = "info") => {
    setMessage(text);
    setMessageKind(kind);
    // auto-dismiss success messages after short time
    if (kind === "success") {
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  // Smart setter for form fields
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Basic validation helpers
  const isValidTitle = (t) => t && t.trim().length >= 3;
  const isValidDescription = (d) => d && d.trim().length >= 10;

  // Clean image url to show proper preview (absolute or relative)
  const previewSrc = logoFile ? URL.createObjectURL(logoFile) : companyLogoUrl || "/uploads/default-company.png";

  // load company details if logged-in user is employer
  useEffect(() => {
    if (loggedCompanyId) {
      // auto-fill (but keep editable)
      setCompanyId((prev) => prev || loggedCompanyId);
      setCompanyName((prev) => prev || loggedCompanyName);
      // try to fetch company record to get logo if exists
      (async function fetchCompany() {
        try {
          setLoading(true);
          const res = await api.get(`/api/company/verify/${loggedCompanyId}`);
          if (res.data?.valid && res.data.company) {
            setCompanyLogoUrl(res.data.company.logo || "");
          }
        } catch (err) {
          // don't block user — just ignore error
          console.error("Unable to fetch company on load:", err);
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedCompanyId, loggedCompanyName]);

  // handle file selection (click or drop)
  const handleFileSelect = (file) => {
    if (!file) return;
    // basic validation: image type and size
    if (!file.type.startsWith("image/")) {
      showMessage("Please upload an image file (png, jpg, svg, etc.)", "error");
      return;
    }
    // optional size limit (2.5MB client side)
    const maxBytes = 2.5 * 1024 * 1024;
    if (file.size > maxBytes) {
      showMessage("File is too large (max 2.5MB). Please choose a smaller image.", "error");
      return;
    }
    setLogoFile(file);
    showMessage("", "info");
  };

  // upload logo to backend for the current companyId (companyId must be valid)
  const uploadLogo = async () => {
    // validations
    if (!companyId || !companyName) {
      showMessage("Please enter Company ID and Company Name before uploading.", "error");
      scrollToRef(companyIdRef);
      return;
    }

    const targetCompanyId = companyId.trim();

    if (!logoFile) {
      showMessage("Please select an image to upload.", "error");
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(null);

      const fd = new FormData();
      fd.append("logo", logoFile);

      // axios instance 'api' may have baseURL set; on upload we do not need progress if axios not configured
      const res = await api.post(`/api/company/upload-logo/${encodeURIComponent(targetCompanyId)}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        // If you want progress: onUploadProgress: (evt) => setUploadProgress(Math.round((evt.loaded * 100) / evt.total))
      });

      if (res.data?.logoUrl) {
        setCompanyLogoUrl(res.data.logoUrl);
        setLogoFile(null);
        showMessage("Company Logo Uploaded Successfully!", "success");
      } else {
        showMessage(res.data?.message || "Logo upload returned no URL", "error");
      }
    } catch (err) {
      console.error("Logo upload error:", err?.response ?? err);
      showMessage(err?.response?.data?.message || "Logo upload failed", "error");
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  // validation helper for job submit
  const validateBeforeSubmit = () => {
    if (!isValidTitle(form.title)) {
      showMessage("Please enter a valid Job Title (min 3 characters).", "error");
      scrollToRef(titleRef);
      return false;
    }
    if (!isValidDescription(form.description)) {
      showMessage("Please provide a detailed Description (min 10 characters).", "error");
      scrollToRef(descriptionRef);
      return false;
    }
    // company fields must match logged user
    if (loggedCompanyId) {
      if (!companyId || companyId.trim() !== loggedCompanyId) {
        showMessage("Company ID must match the one on your account.", "error");
        scrollToRef(companyIdRef);
        return false;
      }
      if (!companyName || companyName.trim() !== loggedCompanyName) {
        showMessage("Company Name must match the one on your account.", "error");
        scrollToRef(companyIdRef);
        return false;
      }
    } else {
      // if user is not an employer (unexpected) block
      showMessage("Only employers can post jobs. Please login as an employer.", "error");
      return false;
    }

    return true;
  };

  // submit job to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageKind("info");

    if (!validateBeforeSubmit()) return;

    try {
      setSubmitting(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        requirements: form.requirements?.trim() || "",
        location: form.location?.trim() || "",
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : [],
        type: form.type || "Full-time",
        companyName: companyName.trim(),
        // Important: companyLogo should be a path like "/uploads/xxx.png" (as saved by upload route)
        companyLogo: companyLogoUrl || "/uploads/default-company.png",
        companyId: companyId.trim(),
      };

      // Post to employer route
      const res = await api.post("/api/employer/jobs", payload);

      if (res?.data?.job) {
        showMessage("✅ Job Posted Successfully — redirecting to Jobs page...", "success");
        // After short delay go to /jobs
        setTimeout(() => navigate("/jobs"), 900);
      } else {
        showMessage(res?.data?.message || "Failed to post job", "error");
      }
    } catch (err) {
      console.error("Post job error:", err?.response ?? err);
      showMessage(err?.response?.data?.message || "Failed to post job", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // helper to autofill company ID/name from logged user
  const autofillFromAccount = async () => {
    if (!loggedCompanyId) {
      showMessage("Your account does not have a companyId to autofill.", "error");
      return;
    }

    setCompanyId(loggedCompanyId);
    setCompanyName(loggedCompanyName);
    showMessage("Company fields auto-filled from your account.", "info");

    // also try to fetch logo if not present
    try {
      setLoading(true);
      const res = await api.get(`/api/company/verify/${encodeURIComponent(loggedCompanyId)}`);
      if (res.data?.valid && res.data.company) {
        setCompanyLogoUrl(res.data.company.logo || "");
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // small helper to show tooltip wrapper easier
  const withTooltip = (text, tip) => (
    <OverlayTrigger overlay={<Tooltip id={`tip-${text}`}>{tip}</Tooltip>}>
      <span style={{ fontWeight: 600 }}>{text}</span>
    </OverlayTrigger>
  );

  const chooseFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // The actual component render
  return (
    <Container style={{ maxWidth: "980px", marginTop: "40px", marginBottom: "60px" }} ref={topRef}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <h2 className="mb-4">Post a Job</h2>

        {/* Status message (Alert) */}
        {message && (
          <Alert variant={messageKind === "error" ? "danger" : messageKind === "success" ? "success" : "info"}>
            <strong style={{ fontWeight: 600 }}>{message}</strong>
          </Alert>
        )}

        <Row>
          <Col md={6}>
            {/* Company Card */}
            <Card className="p-3 mb-3">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h5 style={{ margin: 0 }}>Verify Company</h5>
                <OverlayTrigger overlay={<Tooltip id="autofill">Autofill from your account</Tooltip>}>
                  <Button size="sm" variant="link" onClick={autofillFromAccount} disabled={!loggedCompanyId} style={{ textDecoration: "none" }}>
                    Auto-fill
                  </Button>
                </OverlayTrigger>
              </div>

              <Form.Group className="mb-3" ref={companyIdRef}>
                <Form.Label>{withTooltip("Enter Your Company ID", "Company ID must match your employer account (e.g. Meta@2395)")}</Form.Label>
                <Form.Control placeholder="e.g. Meta@2395" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
                <Form.Text className="text-muted">Type the ID exactly as in your employer record.</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{withTooltip("Enter Your Company Name", "Company Name must match your account")}</Form.Label>
                <Form.Control placeholder="e.g. Meta" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </Form.Group>

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                <SmallPreview src={previewSrc} size={110} alt={companyName || "Company logo"} />

                <div style={{ flex: 1 }}>
                  <DragDropArea
                    onFileSelected={handleFileSelect}
                    fileName={logoFile ? logoFile.name : ""}
                    onChooseClick={() => chooseFileClick()}
                    dragOver={dragOver}
                    setDragOver={setDragOver}
                    hint="Click or drop company logo here"
                  />

                  <Form.Control type="file" id="companyLogoFile" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => handleFileSelect(e.target.files?.[0])} />

                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <Button size="sm" variant="primary" onClick={uploadLogo} disabled={!logoFile || loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : "Upload Logo"}
                    </Button>

                    <OverlayTrigger overlay={<Tooltip id="previewTip">Preview only — logo must be uploaded to be saved permanently</Tooltip>}>
                      <Button size="sm" variant="outline-secondary" onClick={() => setCompanyLogoUrl(previewSrc)}>
                        Use Preview as Logo
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger overlay={<Tooltip id="remove">Remove selected file</Tooltip>}>
                      <Button size="sm" variant="danger" onClick={() => { setLogoFile(null); }}>
                        Clear
                      </Button>
                    </OverlayTrigger>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                <div style={{ color: "#666", fontSize: 13 }}>
                  Current Logo: <strong>{companyLogoUrl ? companyLogoUrl.replace("/uploads/", "") : "None"}</strong>
                </div>
                <div style={{ marginLeft: "auto", color: "#999", fontSize: 12 }}>Tip: Upload before posting</div>
              </div>
            </Card>
          </Col>

          <Col md={6}>
            {/* Job Form Card */}
            <Card className="p-3">
              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3" ref={titleRef}>
                  <Form.Label>{withTooltip("Job Title", "Short and descriptive (e.g. Frontend Developer)")}</Form.Label>
                  <Form.Control name="title" placeholder="Frontend Developer, HR Manager..." value={form.title} onChange={handleChange} disabled={submitting} />
                </Form.Group>

                <Form.Group className="mb-3" ref={descriptionRef}>
                  <Form.Label>{withTooltip("Description", "Describe responsibilities, expectations and outcomes")}</Form.Label>
                  <Form.Control name="description" as="textarea" rows={5} placeholder="Describe job responsibilities..." value={form.description} onChange={handleChange} disabled={submitting} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{withTooltip("Requirements", "Skills, experience and nice-to-have items")}</Form.Label>
                  <Form.Control name="requirements" as="textarea" rows={3} placeholder="Python, React, 2+ years experience..." value={form.requirements} onChange={handleChange} disabled={submitting} />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{withTooltip("Location", "City or remote")}</Form.Label>
                      <Form.Control name="location" placeholder="Bangalore, Hyderabad..." value={form.location} onChange={handleChange} disabled={submitting} />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{withTooltip("Job Type", "Full-time / Part-time / Internship / Contract")}</Form.Label>
                      <Form.Select name="type" value={form.type} onChange={handleChange} disabled={submitting}>
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Internship</option>
                        <option>Contract</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>{withTooltip("Skills (comma separated)", "e.g. React, Node.js, SQL")}</Form.Label>
                  <Form.Control name="skills" placeholder="React, Node.js, SQL..." value={form.skills} onChange={handleChange} disabled={submitting} />
                </Form.Group>

                <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button type="submit" variant="primary" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Spinner animation="border" size="sm" /> Posting...
                        </>
                      ) : (
                        "Post Job"
                      )}
                    </Button>

                    <Button variant="outline-secondary" onClick={() => { setForm({ title: "", description: "", requirements: "", location: "", skills: "", type: "Full-time" }); setMessage(""); }}>
                      Reset
                    </Button>
                  </div>

                  <div style={{ color: "#666", fontSize: 13 }}>
                    Posting as: <strong>{companyName || loggedCompanyName || "—"}</strong>
                  </div>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Loading overlay */}
        {loading && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
            <div style={{ textAlign: "center" }}>
              <Spinner animation="border" role="status" />
              <div style={{ marginTop: 10, fontWeight: 600 }}>Please wait…</div>
            </div>
          </div>
        )}
      </motion.div>

    
    </Container>
  );
}
