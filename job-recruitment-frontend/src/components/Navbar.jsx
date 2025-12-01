// src/components/Navbar.jsx
import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Navbar as BSNavbar, Nav, Container, Button } from "react-bootstrap";
import { motion } from "framer-motion";

export default function AppNavbar({ darkMode, toggleDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setExpanded(false);
  };

  const buildProfileUrl = (img) => {
    if (!img) return "/default-profile.png";
    if (img.startsWith("http")) return img;

    if (img.includes("public/uploads")) {
      const file = img.split("/").pop();
      return `http://localhost:5000/user-uploads/${file}`;
    }

    if (img.includes("/uploads")) {
      const file = img.split("/").pop();
      return `http://localhost:5000/uploads/${file}`;
    }

    return `http://localhost:5000${img}`;
  };

  const activeStyle = {
    background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: 600,
  };

  const defaultStyle = {
    color: darkMode ? "#fff" : "#000",
    padding: "8px 18px",
    borderRadius: "8px",
    textDecoration: "none",
  };

  return (
    <BSNavbar
      expand="lg"
      expanded={expanded}
      className={`py-3 ${darkMode ? "bg-dark" : "bg-light"}`}
      variant={darkMode ? "dark" : "light"}
      fixed="top"
    >
      <Container>

        {/* BRAND */}
        <BSNavbar.Brand as={Link} to="/" className="fw-bold">
          <span style={{ color: "#007BFF" }}>Job</span>
          <span style={{ color: "#FF6600" }}>Recruit</span>
        </BSNavbar.Brand>

        <BSNavbar.Toggle onClick={() => setExpanded(!expanded)} />

        <BSNavbar.Collapse id="main-nav">

          {/* LEFT LINKS */}
          <Nav className="me-auto">
            {user && user.role === "employer" && (
              <NavLink
                to="/post-job"
                className="nav-link"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
                onClick={() => setExpanded(false)}
              >
                Post Job
              </NavLink>
            )}
          </Nav>

          {/* RIGHT LINKS */}
          <Nav className="ms-auto align-items-center">

            {!user ? (
              <>
                <NavLink
                  to="/login"
                  className="nav-link"
                  style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
                  onClick={() => setExpanded(false)}
                >
                  Login
                </NavLink>

                <NavLink
                  to="/register"
                  className="nav-link"
                  style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
                  onClick={() => setExpanded(false)}
                >
                  Register
                </NavLink>
              </>
            ) : (
              <>
                {/* PROFILE IMAGE */}
                <NavLink
                  to="/profile"
                  className="nav-link d-flex align-items-center gap-2"
                  style={{ textDecoration: "none" }}
                  onClick={() => setExpanded(false)}
                >
                  <motion.img
                    src={buildProfileUrl(user.profileImage)}
                    alt="profile"
                    onError={(e) => (e.target.src = "/default-profile.png")}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #4f46e5",
                    }}
                    whileHover={{ scale: 1.1 }}
                  />

                  <span
                    style={{
                      fontWeight: 600,
                      color: darkMode ? "#fff" : "#000",
                      fontSize: "0.95rem",
                    }}
                  >
                    {user.name}
                  </span>
                </NavLink>

                {/* LOGOUT */}
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    variant={darkMode ? "outline-light" : "dark"}
                    className="ms-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </motion.div>
              </>
            )}

            {/* DARK / LIGHT SWITCH */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={toggleDarkMode}
              className={`theme-toggle ${
                darkMode ? "theme-toggle-dark" : "theme-toggle-light"
              } ms-3`}
              style={{ cursor: "pointer" }}
            >
              <div className="theme-toggle-thumb">
                <span className={darkMode ? "moon" : "sun"}>
                  {darkMode ? "🌙" : "☀️"}
                </span>
              </div>
            </motion.div>

          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
