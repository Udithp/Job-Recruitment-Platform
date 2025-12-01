// src/components/ApplicationsList.jsx
import React from "react";
import { ListGroup, Badge, Button, Image } from "react-bootstrap";
import dayjs from "dayjs";

export default function ApplicationsList({ applications = [], loading, onRefresh }) {
  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();

    if (s === "accepted") return <Badge bg="success">Accepted</Badge>;
    if (s === "rejected") return <Badge bg="danger">Rejected</Badge>;
    if (s === "under review" || s === "pending") return <Badge bg="warning">Under Review</Badge>;

    return <Badge bg="secondary">Applied</Badge>;
  };

  if (loading) return <div>Loading applications...</div>;
  if (!applications.length) return <div>No applications yet.</div>;

  return (
    <ListGroup variant="flush">
      {applications.map((app) => {
        // Handles both: job (populated) OR jobDetails (alternate)
        const job = app.job || app.jobDetails || {};
        const company = job.company || {};

        return (
          <ListGroup.Item
            key={app._id || app.applicationId}
            className="d-flex align-items-center justify-content-between"
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* Company Logo */}
              <Image
                src={company.logo || "/uploads/default-company.png"}
                width={48}
                height={48}
                rounded
                style={{
                  objectFit: "contain",
                  background: "#fff",
                  border: "1px solid #ddd",
                  padding: 4,
                }}
              />

              {/* Job Information */}
              <div>
                <div style={{ fontWeight: 700 }}>{job.title || "Unknown Role"}</div>

                <div style={{ color: "#666", fontSize: 13 }}>
                  {company.name || "Unknown Company"} •{" "}
                  {dayjs(app.appliedAt || app.createdAt).format("DD MMM YYYY")}
                </div>
              </div>
            </div>

            {/* Status + Refresh */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {getStatusBadge(app.status)}

              <Button
                size="sm"
                variant="outline-primary"
                onClick={async () => {
                  await onRefresh?.();
                }}
              >
                Refresh
              </Button>
            </div>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}
