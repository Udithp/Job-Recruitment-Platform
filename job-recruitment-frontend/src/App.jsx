// src/App.jsx
import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

import AppNavbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import ApplyJob from "./pages/ApplyJob";
import PostJob from "./pages/PostJob";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditJob from "./pages/EditJob";
import EmployerDashboard from "./pages/EmployerDashboard";
import JobseekerDashboard from "./pages/JobseekerDashboard";  // ✅ ADDED THIS

// ⭐ Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" />;

  return children;
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Restore saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.remove("light-mode");
    } else {
      setDarkMode(false);
      document.body.classList.add("light-mode");

      if (!savedTheme) {
        localStorage.setItem("theme", "light");
      }
    }
  }, []);

  // Toggle theme
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;

      if (next) {
        document.body.classList.remove("light-mode");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.add("light-mode");
        localStorage.setItem("theme", "light");
      }

      return next;
    });
  };

  return (
    <AuthProvider>
      {/* NAVBAR */}
      <AppNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* ROUTES START */}
      <Routes>
        <Route
          path="/"
          element={<Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        />

        {/* PUBLIC JOB PAGES */}
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/jobs/:id/apply" element={<ApplyJob />} />

        <Route path="/edit-job/:jobId" element={<EditJob />} />

        {/* LOGIN + REGISTER */}
        <Route
          path="/login"
          element={<Login darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        />
        <Route
          path="/register"
          element={<Register darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        />

        {/* POST JOB — EMPLOYER ONLY */}
        <Route
          path="/post-job"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PostJob />
            </ProtectedRoute>
          }
        />

        {/* EMPLOYER DASHBOARD */}
        <Route
          path="/employer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerDashboard darkMode={darkMode} />
            </ProtectedRoute>
          }
        />

        {/* ✅ JOBSEEKER DASHBOARD (THE MISSING ROUTE) */}
        <Route
          path="/jobseeker-dashboard"
          element={
            <ProtectedRoute allowedRoles={["jobseeker"]}>
              <JobseekerDashboard darkMode={darkMode} />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
      {/* ROUTES END */}
    </AuthProvider>
  );
}
