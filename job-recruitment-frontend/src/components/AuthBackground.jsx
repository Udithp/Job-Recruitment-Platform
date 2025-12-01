import React, { createContext, useState, useEffect } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Fetch logged-in user details if token exists
  useEffect(() => {
    if (!token) return;

    api
      .get("/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data.user);

        // Always store refreshed token
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          setToken(res.data.token);
        }
      })
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
      });
  }, [token]);

  // Login handler
  const login = (userData, newToken) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
