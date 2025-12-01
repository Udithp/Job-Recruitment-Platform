// src/pages/Login.jsx

import React, { useState, useEffect, useContext } from "react";
import { Form, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import api from "../api/api";

export default function Login({ darkMode, toggleDarkMode }) {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Role: "jobseeker" or "employer"
  const [role, setRole] = useState("jobseeker");

  // Employer-specific fields
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        email,
        password,
        role,
        ...(role === "employer" && {
          companyId,
          companyName,
        }),
      };

      // Call backend
      const res = await api.post("/api/users/login", payload);
      const token = res.data?.token;
      if (token) {
        
        localStorage.setItem("token", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      // Save user in AuthContext (this is used by Navbar, dashboards, etc.)
      const userFromServer = res.data?.user;
      if (userFromServer) {
        setUser(userFromServer);
        // Persist user for page reloads (optional but convenient)
        try {
          localStorage.setItem("user", JSON.stringify(userFromServer));
        } catch (err) {
          // ignore localStorage errors (e.g., private mode)
        }
      }

      alert("Login Success!");
      navigate("/jobs");
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || "Invalid credentials!");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // ANIMATIONS (UNCHANGED)
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Set basic background color behind the canvas
    document.body.style.background = darkMode ? "black" : "white";

    // Create full-screen canvas
    const canvas = document.createElement("canvas");
    canvas.id = "login-bg";
    canvas.style.position = "fixed";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "0";
    canvas.style.pointerEvents = "none";

    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId;
    let shootingStarInterval;

    // -----------------------------------------------------------------------
    // DARK MODE STARFIELD ANIMATION
    // -----------------------------------------------------------------------
    function startStarfield() {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const layers = [
        { count: 140, speed: 1.4, size: 1.2 },
        { count: 120, speed: 2.1, size: 1.8 },
        { count: 90, speed: 3.0, size: 2.4 },
      ];

      const stars = [];

      layers.forEach((layer, index) => {
        for (let i = 0; i < layer.count; i++) {
          stars.push({
            x: Math.random() * canvas.width - cx,
            y: Math.random() * canvas.height - cy,
            z: Math.random() * canvas.width,
            layer: index,
          });
        }
      });

      const shootingStars = [];

      function createShootingStar() {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height / 2),
          len: Math.random() * 80 + 50,
          speed: Math.random() * 6 + 4,
          opacity: Math.random() * 0.7 + 0.3,
        });
      }

      shootingStarInterval = setInterval(createShootingStar, 1200);

      function drawStarfield() {
        const gradient = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          Math.max(canvas.width, canvas.height)
        );

        gradient.addColorStop(0, "#080d29");
        gradient.addColorStop(0.4, "#05071a");
        gradient.addColorStop(1, "#000000");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach((s) => {
          const layerSpeed = layers[s.layer].speed;

          s.z -= layerSpeed;
          if (s.z <= 1) {
            s.x = Math.random() * canvas.width - cx;
            s.y = Math.random() * canvas.height - cy;
            s.z = canvas.width;
          }

          const k = 140 / s.z;
          const px = s.x * k + cx;
          const py = s.y * k + cy;

          if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height)
            return;

          const baseSize = layers[s.layer].size;
          const size = (1 - s.z / canvas.width) * baseSize + 0.3;
          const brightness = 255 - (s.z / canvas.width) * 180;
          const color = `rgba(${brightness}, ${brightness}, 255, 0.9)`;

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });

        shootingStars.forEach((star, i) => {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,255,255,${star.opacity})`;
          ctx.lineWidth = 2;
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x - star.len, star.y + star.len / 3);
          ctx.stroke();

          star.x += star.speed;
          star.y += star.speed * 0.3;

          if (star.x > canvas.width || star.y > canvas.height) {
            shootingStars.splice(i, 1);
          }
        });

        animationId = requestAnimationFrame(drawStarfield);
      }

      drawStarfield();
    }

    function startBubbles() {
      const bubbles = [];
      const bubbleCount = 120;

      for (let i = 0; i < bubbleCount; i++) {
        const radius = Math.random() * 25 + 5;
        const speed = Math.random() * 0.7 + 0.2;
        const hue = Math.random() * 360;

        bubbles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: radius,
          dx: (Math.random() - 0.5) * speed,
          dy: (Math.random() - 0.5) * speed,
          color: `hsla(${hue}, 70%, 55%, 0.45)`,
        });
      }

      function drawBubbles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        bubbles.forEach((b) => {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          b.x += b.dx;
          b.y += b.dy;

          if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.dx *= -1;
          if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.dy *= -1;
        });

        animationId = requestAnimationFrame(drawBubbles);
      }

      drawBubbles();
    }

    // Choose animation based on darkMode
    darkMode ? startStarfield() : startBubbles();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationId);
      if (shootingStarInterval) clearInterval(shootingStarInterval);

      const el = document.getElementById("login-bg");
      if (el) el.remove();
    };
  }, [darkMode]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "transparent",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="shadow p-4 rounded-4"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: darkMode ? "rgba(10, 12, 28, 0.7)" : "white",
          backdropFilter: darkMode ? "blur(12px)" : "none",
          border: darkMode ? "1px solid rgba(0,255,255,0.35)" : "none",
          boxShadow: darkMode
            ? "0 0 25px rgba(0,255,255,0.35)"
            : "0 0 20px rgba(0,0,0,0.15)",
          borderRadius: "22px",
          zIndex: 10,
        }}
      >
        <h2 className="text-center fw-bold mb-3">
          <span style={{ color: "#007BFF" }}>Job</span>
          <span style={{ color: "#FF6600" }}>Recruit</span>
        </h2>

        <p
          className="text-center"
          style={{ color: darkMode ? "#d0d8ff" : "#666" }}
        >
          Welcome back! Please login
        </p>

        <Form onSubmit={handleSubmit}>
          {/* ROLE SELECT ---------------------------------------------------- */}
          <Form.Select
            className="mb-3"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="jobseeker">Job Seeker</option>
            <option value="employer">Employer</option>
          </Form.Select>

          {/* EMPLOYER FIELDS ------------------------------------------------ */}
          {role === "employer" && (
            <>
              <Form.Group className="mb-3">
                <Form.Control
                  placeholder="Enter Company ID"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Enter Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </Form.Group>
            </>
          )}

          {/* EMAIL ---------------------------------------------------------- */}
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          {/* PASSWORD ------------------------------------------------------- */}
          <Form.Group className="mb-3" style={{ position: "relative" }}>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#333",
                fontSize: "20px",
                zIndex: 20,
              }}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </Form.Group>

          {/* LOGIN BUTTON --------------------------------------------------- */}
          <Button
            type="submit"
            className="w-100 mb-3"
            disabled={loading}
            style={{ background: "#007BFF", border: "none" }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {/* GOOGLE PLACEHOLDER -------------------------------------------- */}
          <Button
            className="w-100 d-flex align-items-center justify-content-center"
            style={{
              background: "#fff",
              color: "#444",
              border: "1px solid #ccc",
            }}
            onClick={() => alert("Google Login Coming Soon")}
          >
            <FcGoogle size={24} className="me-2" /> Login with Google
          </Button>

          {/* REGISTER LINK -------------------------------------------------- */}
          <p
            className="text-center mt-3"
            style={{ color: darkMode ? "#fff" : "#000", fontWeight: 500 }}
          >
            Don’t have an account? {" "}
            <span
              onClick={() => navigate("/register")}
              style={{
                color: "#FF6600",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Register
            </span>
          </p>
        </Form>
      </motion.div>
    </div>
  );
}
