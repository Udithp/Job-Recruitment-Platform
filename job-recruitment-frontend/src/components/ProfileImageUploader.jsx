// src/components/ProfileImageUploader.jsx
import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import api from "../api/api";
import { FiCamera } from "react-icons/fi";

export default function ProfileImageUploader({ onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleChangeFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      setUploading(true);

      const res = await api.post("/api/upload/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (onUploaded) onUploaded(res.data.url);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: "relative", width: "fit-content", marginTop: 10 }}>
      {/* HIDDEN INPUT */}
      <input
        type="file"
        id="profileUploadInput"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChangeFile}
      />

      {/* CAMERA BUTTON */}
      <label
        htmlFor="profileUploadInput"
        style={{
          cursor: "pointer",
          position: "absolute",
          bottom: -5,
          right: -5,
          background: "#007bff",
          width: 35,
          height: 35,
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
          border: "2px solid white",
          transition: "0.25s",
        }}
        className="camera-hover"
      >
        {uploading ? (
          <Spinner size="sm" />
        ) : (
          <FiCamera size={18} color="white" />
        )}
      </label>

      {/* SMALL STYLING HINT */}
      <style>
        {`
          .camera-hover:hover {
            transform: scale(1.08);
            background: #0056d6;
          }
        `}
      </style>
    </div>
  );
}
