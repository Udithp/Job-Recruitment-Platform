// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    api
      .get("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const updatedUser = res.data.user || res.data;

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // If backend refreshes token (optional)
        if (res.data.token) {
          setToken(res.data.token);
          localStorage.setItem("token", res.data.token);
        }
      })
      .catch(() => {
        // ❌ Invalid or expired token
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
  }, [token]);

  const login = (userData, newToken) => {
    setUser(userData);
    setToken(newToken);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, setUser, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
