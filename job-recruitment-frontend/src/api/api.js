// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});


const isValidJwt = (token) => {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => p.trim() !== "");
};

// Attach token automatically
api.interceptors.request.use((config) => {
  let token = localStorage.getItem("token");

  if (token && !isValidJwt(token)) {
    console.warn("⚠️ Invalid token detected → removing it");
    localStorage.removeItem("token");
    token = null;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["x-access-token"] = token;
  }


  const isFormData =
    config.data instanceof FormData ||
    config.headers["Content-Type"] === "multipart/form-data";

  if (!isFormData) {
    config.headers["Content-Type"] = "application/json";
  }
  // ------------------------------------------------------

  return config;
});

// Global response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("Token expired → Auto logout");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
