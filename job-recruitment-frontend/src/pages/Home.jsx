// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home({ darkMode, toggleDarkMode }) {
  const [jobsCount, setJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [searchCompany, setSearchCompany] = useState("");

  // ================== COUNTER ANIMATION ==================
  useEffect(() => {
    const jobsTarget = 1200;
    const appsTarget = 8400;
    const duration = 2000;
    const intervalTime = 20;

    let jobsCurrent = 0;
    let appsCurrent = 0;

    const jobsIncrement = Math.ceil(jobsTarget / (duration / intervalTime));
    const appsIncrement = Math.ceil(appsTarget / (duration / intervalTime));

    const interval = setInterval(() => {
      jobsCurrent += jobsIncrement;
      appsCurrent += appsIncrement;

      if (jobsCurrent >= jobsTarget) jobsCurrent = jobsTarget;
      if (appsCurrent >= appsTarget) appsCurrent = appsTarget;

      setJobsCount(jobsCurrent);
      setApplicationsCount(appsCurrent);

      if (jobsCurrent === jobsTarget && appsCurrent === appsTarget) {
        clearInterval(interval);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  // ================== BODY BACKGROUND (THEME) ==================
  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#050509" : "#ffffff";
    document.body.style.color = darkMode ? "#f5f5f5" : "#000000";

    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, [darkMode]);

  // ================== BACKGROUND CANVAS: STARFIELD (DARK) + BUBBLES (LIGHT) ==================
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.id = "background-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.background = "transparent";

    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId;

    // ---------- DARK MODE: Galaxy Starfield ----------
    function startStarfield() {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const STAR_COUNT = 260;
      const stars = [];

      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas.width - cx,
          y: Math.random() * canvas.height - cy,
          z: Math.random() * canvas.width,
        });
      }

      function drawStarfield() {
        const gradient = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          Math.max(canvas.width, canvas.height)
        );
        gradient.addColorStop(0, "#05071a");
        gradient.addColorStop(0.4, "#020315");
        gradient.addColorStop(1, "#000000");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let s of stars) {
          s.z -= 3;
          if (s.z <= 1) {
            s.x = Math.random() * canvas.width - cx;
            s.y = Math.random() * canvas.height - cy;
            s.z = canvas.width;
          }

          const k = 140 / s.z;
          const px = s.x * k + cx;
          const py = s.y * k + cy;

          if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) {
            continue;
          }

          const size = (1 - s.z / canvas.width) * 2.4 + 0.3;
          const brightness = 255 - (s.z / canvas.width) * 180;
          const color = `rgba(${brightness}, ${brightness}, 255, 0.9)`;

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }

        animationId = requestAnimationFrame(drawStarfield);
      }

      drawStarfield();
    }

    // ---------- LIGHT MODE: Soft Bubbles (your original idea) ----------
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
          ctx.closePath();

          b.x += b.dx;
          b.y += b.dy;

          if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.dx *= -1;
          if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.dy *= -1;
        });

        animationId = requestAnimationFrame(drawBubbles);
      }

      drawBubbles();
    }

    if (darkMode) {
      startStarfield();
    } else {
      startBubbles();
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [darkMode]);

  // ================== COMPANY DATA ==================
  const companies = [
    { name: "Google",logo:"/assets/google.png", desc: "Leading global tech innovator. Builds search, AI and cloud products." },
    { name: "Microsoft", logo:"/assets/Microsoft.png", desc: "World leader in software, cloud, AI and enterprise solutions." },
    { name: "Amazon", logo: "/assets/Amazon.png", desc: "E-commerce and cloud giant powering millions of businesses." },
    { name: "Meta", logo: "/assets/Meta.png", desc: "Builders of Facebook, Instagram and next-gen AR/VR technologies." },
    { name: "J.P.Morgan", logo: "/assets/J.P.Morgan.png", desc: "Leader in financial services and tech-driven solutions." },
    { name: "Oracle", logo: "/assets/Orcale.png", desc: "World's leading enterprise database and cloud infrastructure provider." },
    { name: "nVIDIA", logo: "/assets/nVIDIA.png", desc: "Pioneering accelerated computing with GPUs powering AI and gaming." },
    { name: "Meesho", logo: "/assets/Meesho.png", desc: "India's leading social commerce platform empowering small businesses." },
    { name: "Accenture", logo: "/assets/Accenture.png", desc: "Global consulting and technology services company." },
    { name: "Infosys", logo: "/assets/Infosys.png", desc: "India’s top IT service company delivering digital transformation." },
    { name: "Wipro", logo: "/assets/wipro.png", desc: "Tech consulting leader focusing on cloud, data, and AI." },
    { name: "TCS", logo: "/assets/Tata consultancy services.png", desc: "One of the world’s largest IT service and consulting firms." },
    { name: "IBM", logo: "/assets/IBM.png", desc: "Enterprise AI, quantum computing and cloud technology pioneer." },
    { name: "Hp", logo: "/assets/Hp.png", desc: "Global leader in personal computers, printers, and innovative computing solutions." },
    { name: "HCL", logo: "/assets/HCL.png", desc: "Leading global IT services and digital transformation partner." },
    { name: "Cognizant", logo: "/assets/Cognizant.png", desc: "Global IT services and digital transformation partner." },
    { name: "BlackRock", logo: "/assets/Blackrock.png", desc: "World's largest asset manager powering investing globally." },
    { name: "Tech Mahindra", logo: "/assets/Tech Mahindra.png", desc: "Global leader in digital transformation, consulting, and IT services." },
    { name: "Capgemini", logo: "/assets/capgemini.png", desc: "Global leader in consulting, technology services, and digital transformation." },
    { name: "Flipkart", logo: "/assets/Flipkart.png", desc: "Global e-commerce and technology platform." },
    { name: "Sonata Software", logo: "/assets/Sonata software.png", desc: "Global IT services and digital transformation partner." },
  ];

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchCompany.toLowerCase())
  );

  // ================== EXTRA DATA FOR PRO SECTIONS ==================
  const featuredJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "Google",
      location: "Bangalore, India",
      type: "Full-time",
      salary: "₹32–40 LPA",
      skills: ["React", "TypeScript", "System Design"],
    },
    {
      id: 2,
      title: "Data Scientist",
      company: "Amazon",
      location: "Hyderabad, India",
      type: "Hybrid",
      salary: "₹28–35 LPA",
      skills: ["Python", "ML", "AWS"],
    },
    {
      id: 3,
      title: "Cloud DevOps Engineer",
      company: "Microsoft",
      location: "Remote (India)",
      type: "Remote",
      salary: "₹25–33 LPA",
      skills: ["Azure", "Docker", "Kubernetes"],
    },
    {
      id: 4,
      title: "AI Engineer",
      company: "nVIDIA",
      location: "Pune, India",
      type: "Full-time",
      salary: "₹30–42 LPA",
      skills: ["Deep Learning", "PyTorch", "LLMs"],
    },
  ];

  const jobCategories = [
    { label: "Software Development", openings: "430+", icon: "💻" },
    { label: "Data Science & AI", openings: "210+", icon: "🧠" },
    { label: "Cloud & DevOps", openings: "160+", icon: "☁️" },
    { label: "Business Analysis", openings: "140+", icon: "📊" },
    { label: "UI/UX & Product", openings: "90+", icon: "🎨" },
    { label: "Testing & QA", openings: "120+", icon: "🧪" },
  ];

  const steps = [
    {
      title: "Create Your Profile",
      desc: "Add your experience, skills, and career preferences so we can match you with perfect roles.",
      icon: "🧑‍💻",
    },
    {
      title: "Explore Curated Jobs",
      desc: "Browse roles from top product and service companies tailored to your interests.",
      icon: "🔍",
    },
    {
      title: "Apply & Track",
      desc: "Apply in a click, upload your resume, and track your applications in real-time.",
      icon: "🚀",
    },
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Software Engineer @ Google",
      quote:
        "JobRecruit helped me move from a Tier-3 company to a top product-based role. The curated jobs and easy tracking made all the difference.",
    },
    {
      name: "Priya Verma",
      role: "Data Scientist @ Amazon",
      quote:
        "The platform's focus on skills over just keywords matched me with jobs I genuinely enjoyed applying to.",
    },
    {
      name: "Arjun Mehta",
      role: "Cloud Engineer @ Microsoft",
      quote:
        "I loved the smooth application flow and the clarity in job descriptions. It feels built for modern tech careers.",
    },
  ];

  // ================== RENDER ==================
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      {/* Header logo */}
      <Link
        to="/"
        style={{
          position: "fixed",
          top: "20px",
          left: "30px",
          zIndex: 10,
          fontWeight: 900,
          fontSize: "1.8rem",
          textDecoration: "none",
        }}
      >
        <span style={{ color: "#007BFF" }}>Job</span>
        <span style={{ color: "#FF6600" }}>Recruit</span>
      </Link>

      {/* Login / Signup + Dark Mode Toggle */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "30px",
          zIndex: 10,
          display: "flex",
          gap: "12px",
        }}
      >
        <Button
          as={Link}
          to="/login"
          style={{
            background: "#fff",
            border: "2px solid #000",
            color: "#000",
          }}
        >
          Login
        </Button>
        <Button
          as={Link}
          to="/register"
          style={{ background: "#000", color: "#fff" }}
        >
          Signup
        </Button>

        {/* pill-style toggle matching navbar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={toggleDarkMode}
          className={`theme-toggle ${
            darkMode ? "theme-toggle-dark" : "theme-toggle-light"
          }`}
        >
          <div className="theme-toggle-thumb">
            {darkMode ? "🌙" : "☀️"}
          </div>
        </motion.div>
      </div>

      <Container
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: "100px",
          paddingBottom: "60px",
          color: darkMode ? "#f5f5f5" : "#000",
        }}
      >
        {/* ================== HERO SECTION ================== */}
        <Row className="align-items-center mb-5">
          <Col md={7}>
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              style={{
                fontWeight: 900,
                fontSize: "3rem",
                lineHeight: "1.2",
                color: darkMode ? "#ffffff" : "#000000",
                textShadow: darkMode ? "0 0 12px #0ff" : "none",
              }}
            >
              Find your next{" "}
              <span
                style={{ color: darkMode ? "#0ff" : "#007BFF" }}
              >
                career move
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                fontSize: "1.6rem",
                color: darkMode ? "#e5e5e5" : "#444",
                marginBottom: "30px",
                maxWidth: "600px",
                lineHeight: 1.5,
                textShadow: darkMode
                  ? "0 0 8px rgba(255,255,255,0.3)"
                  : "none",
              }}
            >
              Explore thousands of job opportunities, apply seamlessly,
              and manage your professional profile in one powerful dashboard.
            </motion.p>

            <div
              style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
            >
              <Button
                as={Link}
                to="/jobs"
                style={{
                  background: darkMode ? "#0ff" : "#007BFF",
                  color: darkMode ? "#000" : "#fff",
                  fontWeight: 600,
                  padding: "10px 25px",
                  borderRadius: "12px",
                  boxShadow: darkMode ? "0 0 15px #0ff" : "none",
                  border: "none",
                }}
              >
                Browse Jobs
              </Button>

              <Button
                as={Link}
                to="/learn"
                style={{
                  background: darkMode ? "#111" : "#e6e6e6",
                  color: darkMode ? "#fff" : "#000",
                  border: darkMode
                    ? "1px solid #0ff"
                    : "1px solid #ccc",
                  fontWeight: 500,
                  padding: "10px 25px",
                  borderRadius: "12px",
                  boxShadow: darkMode ? "0 0 12px #0ff" : "none",
                }}
              >
                Learn More
              </Button>
            </div>
          </Col>

          {/* Quick stats */}
          <Col md={5}>
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              style={{
                background: darkMode ? "#222" : "#e6e6e6",
                borderRadius: "25px",
                padding: "35px 25px",
                border: darkMode ? "1px solid #0ff" : "1px solid #ccc",
                boxShadow: darkMode
                  ? "0 0 20px #0ff"
                  : "0 0 10px rgba(0,0,0,0.15)",
              }}
            >
              <h5
                style={{
                  fontWeight: 900,
                  color: darkMode ? "#0ff" : "#000",
                  fontSize: "1.1rem",
                }}
              >
                Quick Stats
              </h5>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: "20px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: "2rem",
                      color: darkMode ? "#0ff" : "#000",
                    }}
                  >
                    {jobsCount.toLocaleString()}
                  </div>
                  <div
                    style={{
                      color: darkMode ? "#fff" : "#000",
                      fontSize: "1rem",
                    }}
                  >
                    Jobs posted
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: "2rem",
                      color: darkMode ? "#0ff" : "#000",
                    }}
                  >
                    {applicationsCount.toLocaleString()}
                  </div>
                  <div
                    style={{
                      color: darkMode ? "#fff" : "#000",
                      fontSize: "1rem",
                    }}
                  >
                    Applications
                  </div>
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>

        {/* ================== COMPANIES GRID ================== */}
        <div
          style={{
            background: darkMode
              ? "rgba(255,255,255,0.05)"
              : "rgba(255,255,255,0.55)",
            backdropFilter: "blur(6px)",
            borderRadius: "20px",
            padding: "40px 30px",
            marginTop: "40px",
          }}
        >
          <h2
            style={{
              fontWeight: 800,
              textAlign: "center",
              marginBottom: "30px",
              color: darkMode ? "#fff" : "#000",
            }}
          >
            Job Openings in Top Companies
          </h2>

          <Form.Control
            type="text"
            placeholder="Search company..."
            value={searchCompany}
            onChange={(e) => setSearchCompany(e.target.value)}
            style={{
              marginBottom: "30px",
              maxWidth: "300px",
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: 20,
            }}
          />

          <Row>
            {filteredCompanies.map((company, index) => (
              <Col md={2} key={index} style={{ marginBottom: "35px" }}>
                <motion.div
                  whileHover={{
                    scale: 1.08,
                    boxShadow: darkMode
                      ? "0 0 20px #0ff"
                      : "0 0 20px rgba(0,123,255,0.6)",
                  }}
                  style={{
                    background: darkMode ? "#222" : "#fff",
                    padding: "20px",
                    borderRadius: "16px",
                    textAlign: "center",
                    boxShadow: "0 0 10px rgba(0,0,0,0.15)",
                    transition: "all 0.3s",
                  }}
                >
                  <img
                    src={company.logo}
                    alt={company.name}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      marginBottom: 12,
                     display:"block",
                     marginLeft:"auto",
                     marginRight:"auto",
                     objectFit:"contain"
                    }}
                  />
                  <h6
                    style={{
                      fontWeight: 800,
                      color: darkMode ? "#fff" : "#000",
                    }}
                  >
                    {company.name}
                  </h6>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: darkMode ? "#ddd" : "#444",
                      marginBottom: "12px",
                    }}
                  >
                    {company.desc}
                  </p>

                  <Button
                    as={Link}
                    to="/jobs"
                    style={{
                      background: "#000",
                      color: "#fff",
                      padding: "6px 16px",
                      borderRadius: 8,
                      border: "none",
                    }}
                  >
                    View Jobs
                  </Button>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>

        {/* ================== FEATURED JOBS ================== */}
        <section style={{ marginTop: "60px" }}>
          <h2
            style={{
              fontWeight: 800,
              marginBottom: "25px",
              color: darkMode ? "#fff" : "#000",
            }}
          >
            Featured Opportunities
          </h2>
          <p
            style={{
              maxWidth: "520px",
              color: darkMode ? "#ddd" : "#555",
              marginBottom: "25px",
            }}
          >
            Handpicked roles from world-class companies, tailored for ambitious
            developers, analysts, data scientists, and engineers.
          </p>
          <Row>
            {featuredJobs.map((job) => (
              <Col md={3} key={job.id} style={{ marginBottom: "25px" }}>
                <motion.div
                  whileHover={{
                    y: -5,
                    boxShadow: darkMode
                      ? "0 0 20px rgba(0,255,255,0.4)"
                      : "0 8px 20px rgba(0,0,0,0.15)",
                  }}
                  style={{
                    background: darkMode ? "#151515" : "#ffffff",
                    borderRadius: "18px",
                    padding: "18px",
                    border: darkMode
                      ? "1px solid rgba(0,255,255,0.25)"
                      : "1px solid #ddd",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: darkMode ? "#0ff" : "#007BFF",
                        marginBottom: 6,
                        textTransform: "uppercase",
                      }}
                    >
                      {job.company}
                    </div>
                    <h5
                      style={{
                        fontWeight: 800,
                        marginBottom: 6,
                        color: darkMode ? "#fff" : "#000",
                      }}
                    >
                      {job.title}
                    </h5>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        marginBottom: 4,
                        color: darkMode ? "#ccc" : "#555",
                      }}
                    >
                      📍 {job.location}
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        marginBottom: 8,
                        color: darkMode ? "#ccc" : "#555",
                      }}
                    >
                      💼 {job.type} · 💰 {job.salary}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginTop: "8px",
                        marginBottom: "10px",
                      }}
                    >
                      {job.skills.map((s, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            borderRadius: 999,
                            border: darkMode
                              ? "1px solid rgba(0,255,255,0.5)"
                              : "1px solid rgba(0,123,255,0.4)",
                            color: darkMode ? "#0ff" : "#0056b3",
                            background: darkMode
                              ? "rgba(0,255,255,0.06)"
                              : "rgba(0,123,255,0.06)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    as={Link}
                    to="/jobs"
                    size="sm"
                    style={{
                      marginTop: "8px",
                      background: darkMode ? "#0ff" : "#000",
                      color: darkMode ? "#000" : "#fff",
                      borderRadius: 12,
                      border: "none",
                      fontWeight: 600,
                    }}
                  >
                    View & Apply
                  </Button>
                </motion.div>
              </Col>
            ))}
          </Row>
        </section>

        {/* ================== JOB CATEGORIES ================== */}
        <section style={{ marginTop: "60px" }}>
          <Row className="align-items-center">
            <Col md={5}>
              <h2
                style={{
                  fontWeight: 800,
                  marginBottom: "18px",
                  color: darkMode ? "#fff" : "#000",
                }}
              >
                Explore roles by{" "}
                <span style={{ color: darkMode ? "#0ff" : "#007BFF" }}>
                  job category
                </span>
              </h2>
              <p
                style={{
                  color: darkMode ? "#ddd" : "#555",
                  marginBottom: "18px",
                }}
              >
                Whether you're a fresher or an experienced professional,
                discover opportunities aligned with your skills and interests.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: 0,
                  marginBottom: 0,
                  color: darkMode ? "#ccc" : "#444",
                }}
              >
                <li>✅ Curated tech roles from trusted companies</li>
                <li>✅ Clear skill requirements & role expectations</li>
                <li>✅ Filter by location, experience, and salary</li>
              </ul>
            </Col>
            <Col md={7}>
              <Row>
                {jobCategories.map((cat, idx) => (
                  <Col md={4} key={idx} style={{ marginBottom: "18px" }}>
                    <motion.div
                      whileHover={{
                        y: -3,
                        boxShadow: darkMode
                          ? "0 0 15px rgba(0,255,255,0.3)"
                          : "0 8px 18px rgba(0,0,0,0.1)",
                      }}
                      style={{
                        background: darkMode ? "#151515" : "#ffffff",
                        borderRadius: 16,
                        padding: "14px 14px",
                        border: darkMode
                          ? "1px solid rgba(0,255,255,0.2)"
                          : "1px solid #ddd",
                        minHeight: "110px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.4rem",
                          marginBottom: 4,
                        }}
                      >
                        {cat.icon}
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: darkMode ? "#fff" : "#000",
                        }}
                      >
                        {cat.label}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: "0.85rem",
                          color: darkMode ? "#ccc" : "#555",
                        }}
                      >
                        {cat.openings} open roles
                      </div>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </section>

    
        <section style={{ marginTop: "70px" }}>
          <h2
            style={{
              fontWeight: 800,
              marginBottom: "10px",
              textAlign: "center",
              color: darkMode ? "#fff" : "#000",
            }}
          >
            How JobRecruit Works
          </h2>
          <p
            style={{
              textAlign: "center",
              maxWidth: "620px",
              margin: "0 auto 35px auto",
              color: darkMode ? "#ddd" : "#555",
            }}
          >
            We’ve simplified the job search journey into three powerful steps
            so you can spend more time preparing and less time searching.
          </p>
          <Row>
            {steps.map((step, index) => (
              <Col md={4} key={index} style={{ marginBottom: "20px" }}>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    background: darkMode ? "#151515" : "#ffffff",
                    borderRadius: 18,
                    padding: "20px",
                    textAlign: "center",
                    border: darkMode
                      ? "1px solid rgba(0,255,255,0.25)"
                      : "1px solid #ddd",
                    minHeight: "190px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      marginBottom: 10,
                    }}
                  >
                    {step.icon}
                  </div>
                  <h5
                    style={{
                      fontWeight: 800,
                      marginBottom: 8,
                      color: darkMode ? "#fff" : "#000",
                    }}
                  >
                    {step.title}
                  </h5>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: darkMode ? "#ccc" : "#555",
                    }}
                  >
                    {step.desc}
                  </p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </section>

        {/* ================== TESTIMONIALS ================== */}
        <section style={{ marginTop: "70px" }}>
          <h2
            style={{
              fontWeight: 800,
              textAlign: "center",
              marginBottom: "10px",
              color: darkMode ? "#fff" : "#000",
            }}
          >
            Trusted by ambitious professionals
          </h2>
          <p
            style={{
              textAlign: "center",
              maxWidth: "620px",
              margin: "0 auto 35px auto",
              color: darkMode ? "#ddd" : "#555",
            }}
          >
            Hear from candidates who used JobRecruit to land their dream roles
            at leading companies.
          </p>
          <Row>
            {testimonials.map((t, index) => (
              <Col md={4} key={index} style={{ marginBottom: "25px" }}>
                <motion.div
                  whileHover={{
                    y: -4,
                    boxShadow: darkMode
                      ? "0 0 20px rgba(0,255,255,0.3)"
                      : "0 10px 24px rgba(0,0,0,0.15)",
                  }}
                  style={{
                    background: darkMode ? "#151515" : "#ffffff",
                    borderRadius: 20,
                    padding: "20px",
                    border: darkMode
                      ? "1px solid rgba(0,255,255,0.25)"
                      : "1px solid #eee",
                    height: "100%",
                  }}
                >
                  <p
                    style={{
                      fontStyle: "italic",
                      fontSize: "0.95rem",
                      color: darkMode ? "#ddd" : "#555",
                      marginBottom: "14px",
                    }}
                  >
                    “{t.quote}”
                  </p>
                  <div
                    style={{
                      fontWeight: 800,
                      color: darkMode ? "#fff" : "#000",
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: darkMode ? "#aaa" : "#666",
                    }}
                  >
                    {t.role}
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </section>

        {/* ================== FINAL CALL TO ACTION ================== */}
        <section style={{ marginTop: "70px" }}>
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            style={{
              borderRadius: 24,
              padding: "28px 24px",
              background: darkMode
                ? "linear-gradient(135deg, #020617, #0f172a)"
                : "linear-gradient(135deg, #e0f2ff, #fdf2ff)",
              border: darkMode
                ? "1px solid rgba(56,189,248,0.4)"
                : "1px solid rgba(37,99,235,0.35)",
              boxShadow: darkMode
                ? "0 0 25px rgba(56,189,248,0.4)"
                : "0 10px 25px rgba(15,23,42,0.18)",
            }}
          >
            <Row className="align-items-center">
              <Col md={8}>
                <h3
                  style={{
                    fontWeight: 900,
                    marginBottom: 10,
                    color: darkMode ? "#e0f2fe" : "#111827",
                  }}
                >
                  Ready to unlock your next big career move?
                </h3>
                <p
                  style={{
                    marginBottom: 0,
                    maxWidth: "520px",
                    color: darkMode ? "#bae6fd" : "#1f2937",
                  }}
                >
                  Join thousands of professionals using JobRecruit to discover
                  high-quality roles, build a standout profile, and apply with
                  confidence.
                </p>
              </Col>
              <Col
                md={4}
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "12px",
                }}
              >
                <Button
                  as={Link}
                  to="/register"
                  style={{
                    background: darkMode ? "#0ff" : "#111827",
                    color: darkMode ? "#000" : "#f9fafb",
                    fontWeight: 700,
                    padding: "10px 24px",
                    borderRadius: 14,
                    border: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Create Free Account
                </Button>
              </Col>
            </Row>
          </motion.div>
        </section>
      </Container>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "30px 10px",
          marginTop: "60px",
          color: "#bbb",
          fontSize: "0.9rem",
          borderTop: "1px solid #444",
        }}
      >
        © {new Date().getFullYear()} JobRecruit — All Rights Reserved.
      </div>

      {/* Scroll to top button */}
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          background: "#000",
          color: "#fff",
          borderRadius: "50%",
          width: "55px",
          height: "55px",
          fontSize: "1.4rem",
          zIndex: 20,
          border: "none",
        }}
      >
        ↑
      </Button>

      {/* Decorative bar */}
      <div
        style={{
          width: "80px",
          height: "4px",
          background: "#000",
          margin: "20px auto 40px auto",
          borderRadius: "10px",
        }}
      />
    </div>
  );
}
