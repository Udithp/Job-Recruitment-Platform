import React, { useState, useContext, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import api from "../api/api";

export default function Register({ darkMode }) {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("jobseeker");

  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------------- HANDLE REGISTER ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === "employer" && (!companyId || !companyName)) {
        alert("❌ Company ID and Company Name are required");
        setLoading(false);
        return;
      }

      const payload = {
        name,
        email,
        password,
        role,
        companyId: role === "employer" ? companyId : undefined,
        companyName: role === "employer" ? companyName : undefined,
      };

      const res = await api.post("/api/users/register", payload);

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      alert("🎉 Registration Successful!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DARK/LIGHT MODE ANIMATION ----------------
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.id = "register-bg";
    canvas.style.position = "fixed";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "0";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId;

    /* DARK MODE STARFIELD (same as login) */
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
      setInterval(createShootingStar, 1200);

      function draw() {
        ctx.fillStyle = "#000";
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

        animationId = requestAnimationFrame(draw);
      }

      draw();
    }

    /* LIGHT MODE BUBBLES (same as before) */
    function startBubbles() {
      const bubbles = [];
      for (let i = 0; i < 120; i++) {
        bubbles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 18 + 6,
          dx: (Math.random() - 0.5) * 0.6,
          dy: (Math.random() - 0.5) * 0.6,
          color: "rgba(0,0,0,0.25)",
        });
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bubbles.forEach((b) => {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = b.color;
          ctx.stroke();
          b.x += b.dx;
          b.y += b.dy;
          if (b.x < 0 || b.x > canvas.width) b.dx *= -1;
          if (b.y < 0 || b.y > canvas.height) b.dy *= -1;
        });

        animationId = requestAnimationFrame(draw);
      }

      draw();
    }

    darkMode ? startStarfield() : startBubbles();

    return () => {
      cancelAnimationFrame(animationId);
      const el = document.getElementById("register-bg");
      if (el) el.remove();
    };
  }, [darkMode]);

  // ---------------- UI ----------------
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        paddingTop: "40px",
        background: "transparent",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="shadow p-4 rounded-4"
        style={{ width: "100%", maxWidth: "450px", zIndex: 10 }}
      >
        <h2 className="text-center fw-bold mb-3">
          <span style={{ color: "#007BFF" }}>Job</span>
          <span style={{ color: "#FF6600" }}>Recruit</span>
        </h2>

        <p className="text-center  mb-4"style={{color:darkMode ? "#e0e0e0":"#333",fontweight:500}}>Create your account</p>

        <Form onSubmit={handleSubmit}>

          {/* NAME */}
          <Form.Group className="mb-3">
            <Form.Control
              placeholder="Full Name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          {/* EMAIL */}
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          {/* PASSWORD */}
          <Form.Group className="mb-3" style={{ position: "relative" }}>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "22px",
                color: darkMode ? "#00FFFF" : "#333",
                zIndex: 20,
              }}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </Form.Group>

          {/* ROLE */}
          <Form.Select
            className="mb-3"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="jobseeker">Job Seeker</option>
            <option value="employer">Employer</option>
          </Form.Select>

          {/* EMPLOYER FIELDS */}
          {role === "employer" && (
            <>
              <Form.Group className="mb-3">
                <Form.Control
                  placeholder="Enter Unique Company ID"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </Form.Group>
            </>
          )}

          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </Button>

          <p
            className="text-center mt-3"
            style={{
              color:darkMode ? "#e0e0e0":"#000",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Already have an account?{" "}
            <span
              style={{
                color: "#FF6600",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </Form>
      </motion.div>
    </div>
  );
}
