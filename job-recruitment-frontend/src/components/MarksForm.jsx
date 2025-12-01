// src/components/MarksForm.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import api from "../api/api";

export default function MarksForm({ profile = {}, onUpdated }) {
  const [tenth, setTenth] = useState("");
  const [twelfth, setTwelfth] = useState("");
  const [degree, setDegree] = useState("");
  const [saving, setSaving] = useState(false);

  // load marks on profile change
  useEffect(() => {
    const m = profile?.marks || {};
    setTenth(m.tenth || "");
    setTwelfth(m.twelfth || "");
    setDegree(m.degree || "");
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/api/jobseeker/marks", {
        tenth,
        twelfth,
        degree,
      });

      if (onUpdated) onUpdated();
      alert("✅ Marks saved successfully");
    } catch (err) {
      console.error("Save marks error:", err);
      alert(err?.response?.data?.message || "❌ Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={4} className="mb-2">
          <Form.Label>10th (%)</Form.Label>
          <Form.Control
            value={tenth}
            onChange={(e) => setTenth(e.target.value)}
            placeholder="Eg. 85"
          />
        </Col>

        <Col md={4} className="mb-2">
          <Form.Label>12th (%)</Form.Label>
          <Form.Control
            value={twelfth}
            onChange={(e) => setTwelfth(e.target.value)}
            placeholder="Eg. 87"
          />
        </Col>

        <Col md={4} className="mb-2">
          <Form.Label>Degree (%)</Form.Label>
          <Form.Control
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            placeholder="Eg. 72"
          />
        </Col>
      </Row>

      <div className="mt-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Marks"}
        </Button>
      </div>
    </Form>
  );
}
