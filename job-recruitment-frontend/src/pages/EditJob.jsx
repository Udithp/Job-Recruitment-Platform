// src/pages/EditJob.jsx
import React, { useEffect, useState } from "react";
import { Container, Form, Button, Card, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/api";

export default function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    skills: "",
    location: "",
    type: "Full-time",
  });
  const loadJob = async () => {
    try {
      const res = await api.get(`/api/jobs/${jobId}`);
      const job = res.data.job;

      setForm({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        skills: job.skills ? job.skills.join(", ") : "",
        location: job.location || "",
        type: job.type || "Full-time",
      });

      setLoading(false);
    } catch (err) {
      console.error("Load job error:", err);
      alert("Failed to load job");
      navigate("/employer-dashboard");
    }
  };


  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveJob = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/api/employer/jobs/${jobId}`, {
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        location: form.location,
        type: form.type,
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim())
          : [],
      });

      alert("Job updated successfully!");
      navigate("/employer-dashboard");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, []);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <Spinner animation="border" />
      </div>
    );

  return (
    <Container style={{ maxWidth: 700, marginTop: 40 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card style={{ padding: 25, borderRadius: 12 }}>
          <h3 className="mb-3">Edit Job</h3>

          <Form onSubmit={saveJob}>
            <Form.Group className="mb-3">
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Requirements</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Skills (comma separated)</Form.Label>
              <Form.Control
                name="skills"
                value={form.skills}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Job Type</Form.Label>
              <Form.Select
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Contract</option>
              </Form.Select>
            </Form.Group>

            <Button
              type="submit"
              disabled={saving}
              className="w-100"
              style={{ fontWeight: "bold" }}
            >
              {saving ? <Spinner animation="border" size="sm" /> : "Save Changes"}
            </Button>
          </Form>
        </Card>
      </motion.div>
    </Container>
  );
}
