// src/pages/Profile.jsx
import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Image,
  Spinner,
} from "react-bootstrap";
import JobseekerDashboard from "./JobseekerDashboard";


const safe = (v, fallback = "") => (v === undefined || v === null ? fallback : v);


const buildUrl = (p) => {
  if (!p) return "/default-profile.png";
  if (p.startsWith("http")) return p;

  // If stored as absolute-like '/user-uploads/filename'
  if (p.startsWith("/user-uploads/")) {
    return `http://localhost:5000${p}`;
  }

  // If backend accidentally stored '/uploads/filename' or 'uploads/filename'
  if (p.includes("/uploads/")) {
    // use the final filename and map to /user-uploads
    const file = p.split("/").pop();
    return `http://localhost:5000/user-uploads/${file}`;
  }

  // If backend returned the filesystem path 'public/uploads/...' or 'public\\uploads\\...'
  if (p.includes("public/uploads") || p.includes("public\\uploads")) {
    const file = p.split(/[/\\]/).pop();
    return `http://localhost:5000/user-uploads/${file}`;
  }

  // fallback: assume path is already correct on server
  return `http://localhost:5000${p}`;
};

export default function Profile() {
  const { user } = useContext(AuthContext);

  // FORM values
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    profileImage: "",
  });

  // jobseeker-specific
  const [marks, setMarks] = useState({});
  const [certificates, setCertificates] = useState({});

  // UI state
  const [statusMessage, setStatusMessage] = useState("");
  const [preview, setPreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [marksLoading, setMarksLoading] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // refs
  const fileInputRef = useRef(null);
  const certFileRef = useRef(null);
  const certTypeRef = useRef(null);


  useEffect(() => {
    let t;
    if (statusMessage) {
      t = setTimeout(() => {
        setStatusMessage("");
      }, 2500);
    }
    return () => clearTimeout(t);
  }, [statusMessage]);

  const notify = useCallback((msg) => {
    setStatusMessage(msg);
  }, []);


  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await api.get("/api/profile"); // <- CORRECT endpoint
      const u = res.data.user || res.data;

      setForm({
        name: safe(u.name),
        email: safe(u.email),
        bio: safe(u.bio),
        profileImage: safe(u.profileImage),
      });

      setMarks(u.marks || {});
      setCertificates(u.certificates || {});
    } catch (err) {
      console.error("Failed loading profile:", err);
      notify("Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  }, [notify]);

  const loadApplications = useCallback(async () => {
    try {
      await api.get("/api/jobseeker/applications");
    } catch (err) {
      // ignore
    }
  }, []);

  
  useEffect(() => {
    loadProfile();
    if (user?.role === "jobseeker") loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const onImageChange = () => {
    const f = fileInputRef.current?.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };


  const saveProfile = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("bio", form.bio || "");

      if (fileInputRef.current?.files?.[0]) {
        fd.append("profileImage", fileInputRef.current.files[0]);
      }

      // Correct endpoint here:
      await api.put("/api/profile", fd);
      notify("Profile updated");
      await loadProfile();
      setPreview(null);
      // clear file input visually (doesn't affect current file object)
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Save profile error:", err);
      notify("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const updateMarks = async () => {
    setMarksLoading(true);
    try {
      await api.put("/api/jobseeker/marks", marks);
      notify("Marks updated");
    } catch (err) {
      console.error("Update marks error:", err);
      notify("Failed to update marks");
    } finally {
      setMarksLoading(false);
    }
  };
  const uploadCertificate = async () => {
    const file = certFileRef.current?.files?.[0];
    if (!file) return notify("Select a file");

    setCertLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", certTypeRef.current.value);

      await api.post("/api/jobseeker/upload-certificate", fd);
      notify("Uploaded");
      await loadProfile();
      if (certFileRef.current) certFileRef.current.value = "";
    } catch (err) {
      console.error("Upload certificate error:", err);
      notify("Upload failed");
    } finally {
      setCertLoading(false);
    }
  };

  /* -----------------------------------------------------
     LOADING SCREEN
  ----------------------------------------------------- */
  if (!user || loadingProfile) {
    return (
      <Container className="py-5 text-center">
        <Spinner />
      </Container>
    );
  }

  /* -----------------------------------------------------
     UI - stable layout
     - no top-level animations that re-mount on state changes
     - image wrapper has fixed size (w-32 h-32)
  ----------------------------------------------------- */
  return (
    <div className="w-full overflow-hidden min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-2">
      {/* ---------------------------
         Notification (fixed: doesn't affect layout)
         --------------------------- */}
      {statusMessage && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <div
            className="bg-indigo-600 text-white shadow-lg px-5 py-2 rounded-lg"
            role="status"
            aria-live="polite"
          >
            {statusMessage}
          </div>
        </div>
      )}

      <Container style={{ maxWidth: 1100 }}>
        {/* Page header - plain container (no animation) */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Your Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your personal details & documents
          </p>
        </div>

        {/* Grid - stable layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          {/* LEFT: profile card (stable) */}
          <div>
            <div className="backdrop-blur-xl bg-white/6 rounded-3xl border border-white/10 shadow-xl p-6">
              <div className="flex flex-col items-center text-center">
                {/* fixed-size image wrapper prevents layout shift */}
                <div
                  className="relative"
                  style={{ width: 128, height: 128, minWidth: 128 }}
                >
                  <div
                    style={{
                      width: 128,
                      height: 128,
                      borderRadius: "9999px",
                      overflow: "hidden",
                      boxShadow:
                        "0 6px 18px rgba(15,23,42,0.08), inset 0 0 0 4px rgba(255,255,255,0.7)",
                    }}
                  >
                    <Image
                      src={preview || buildUrl(form.profileImage)}
                      alt="profile"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        // fallback to default image when server path fails
                        e.target.onerror = null;
                        e.target.src = "/default-profile.png";
                      }}
                    />
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      bottom: -4,
                      right: -4,
                    }}
                  >
                    <div className="bg-indigo-500 text-white px-3 py-1 text-xs rounded-full shadow">
                      {user.role}
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold mt-4">{form.name}</h2>
                <p className="text-gray-500 text-sm">{form.email}</p>

                <input
                  ref={fileInputRef}
                  onChange={onImageChange}
                  type="file"
                  accept="image/*"
                  className="mt-4 block w-full text-sm bg-white/10 rounded-xl p-2"
                />

                <Button
                  className="mt-4 w-full py-2 fw-semibold"
                  onClick={saveProfile}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal info */}
            <div className="backdrop-blur-xl bg-white/6 rounded-3xl border border-white/10 shadow-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Personal Information</h3>

              <Form>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        value={form.name}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control value={form.email} disabled />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.bio}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                  />
                </Form.Group>

                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? "Saving..." : "Update Information"}
                </Button>
              </Form>
            </div>

            {/* Jobseeker-specific sections */}
            {user.role === "jobseeker" && (
              <>
                {/* Marks */}
                <div className="backdrop-blur-xl bg-white/6 rounded-3xl border border-white/10 shadow-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Academic Marks</h3>

                  <Row>
                    <Col>
                      <Form.Control
                        placeholder="10th %"
                        value={marks.tenth || ""}
                        onChange={(e) =>
                          setMarks((prev) => ({ ...prev, tenth: e.target.value }))
                        }
                        className="mb-3"
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        placeholder="12th %"
                        value={marks.twelfth || ""}
                        onChange={(e) =>
                          setMarks((prev) => ({ ...prev, twelfth: e.target.value }))
                        }
                        className="mb-3"
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        placeholder="Degree %"
                        value={marks.degree || ""}
                        onChange={(e) =>
                          setMarks((prev) => ({ ...prev, degree: e.target.value }))
                        }
                        className="mb-3"
                      />
                    </Col>
                  </Row>

                  <Button onClick={updateMarks} disabled={marksLoading}>
                    {marksLoading ? "Saving..." : "Save Marks"}
                  </Button>
                </div>

                {/* Certificates / uploader */}
                <div className="backdrop-blur-xl bg-white/6 rounded-3xl border border-white/10 shadow-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Certificates</h3>

                  <Row className="align-items-center">
                    <Col md={4}>
                      <Form.Select ref={certTypeRef} className="mb-3" defaultValue="tenth">
                        <option value="tenth">10th</option>
                        <option value="twelfth">12th</option>
                        <option value="degree">Degree</option>
                        <option value="internship">Internship</option>
                        <option value="course">Course</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Col>

                    <Col md={5}>
                      <Form.Control ref={certFileRef} type="file" />
                    </Col>

                    <Col md={3}>
                      <Button onClick={uploadCertificate} disabled={certLoading}>
                        {certLoading ? "Uploading..." : "Upload"}
                      </Button>
                    </Col>
                  </Row>

                  <div className="mt-4 space-y-3">
                    {Object.keys(certificates).length === 0 ? (
                      <p className="text-gray-500">No certificates uploaded.</p>
                    ) : (
                      Object.entries(certificates).map(([type, url]) => (
                        <div
                          key={type}
                          className="p-3 bg-white/10 shadow-md rounded-xl border"
                        >
                          <strong className="capitalize">{type}</strong>
                          <div>
                            <a
                              href={buildUrl(url)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 text-sm"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Jobseeker dashboard (no animation wrapper) */}
        {user.role === "jobseeker" && (
          <div className="mt-12">
            <JobseekerDashboard />
          </div>
        )}
      </Container>
    </div>
  );
}
