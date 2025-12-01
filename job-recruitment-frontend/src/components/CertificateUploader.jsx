// src/components/CertificateUploader.jsx
import React, { useState } from "react";
import { Form, Button, Row, Col, Image, Spinner } from "react-bootstrap";
import api from "../api/api";
import { FiUploadCloud } from "react-icons/fi";

export default function CertificateUploader({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("other");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");

  // Handle file + preview
  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);

    if (f && f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(""); // PDF no preview image
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!file) return alert("❌ Please select a file");

    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);

      const res = await api.post(
        "/api/jobseeker/upload-certificate",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("✅ Certificate uploaded successfully!");

      if (onUploaded) onUploaded(res.data);

      setFile(null);
      setPreview("");

    } catch (err) {
      console.error("Upload error:", err);
      alert(err?.response?.data?.message || "❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form onSubmit={submit}>
        {/* TOP SELECT + FILE INPUT */}
        <Row className="align-items-center">
          <Col md={5} className="mb-3">
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 15,
              }}
            >
              <option value="tenth">10th Marksheet</option>
              <option value="twelfth">12th Marksheet</option>
              <option value="degree">Degree Certificate</option>
              <option value="internship">Internship Certificate</option>
              <option value="course">Course Certificate</option>
              <option value="other">Other</option>
            </Form.Select>
          </Col>

          <Col md={7} className="mb-3">
            <div
              style={{
                border: "2px dashed #007bff",
                padding: 16,
                borderRadius: 12,
                textAlign: "center",
                cursor: "pointer",
                transition: "0.3s",
              }}
              onClick={() => document.getElementById("certificateInput").click()}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#eef5ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <FiUploadCloud size={22} color="#007bff" />

              <div style={{ fontSize: 14, marginTop: 6 }}>
                {file ? file.name : "Choose or drag file here"}
              </div>

              <input
                id="certificateInput"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFile}
                style={{ display: "none" }}
              />
            </div>
          </Col>
        </Row>

        {/* PREVIEW CARD */}
        {preview && (
          <div
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 12,
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(255,255,255,0.2)",
              width: "fit-content",
            }}
          >
            <strong style={{ fontSize: 14 }}>Preview:</strong>
            <Image
              src={preview}
              thumbnail
              style={{
                maxHeight: 160,
                marginTop: 6,
                borderRadius: 10,
              }}
            />
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="mt-3">
          <Button
            type="submit"
            disabled={loading}
            style={{ borderRadius: 10, padding: "8px 18px" }}
          >
            {loading ? <Spinner size="sm" /> : "Upload Certificate"}
          </Button>
        </div>
      </Form>
    </>
  );
}
