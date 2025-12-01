// utils/token.js
import jwt from 'jsonwebtoken';

const isValidJwt = (token) => {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => p.trim() !== "");
};

/**
 * Generate a JWT token for a given payload.
 * @param {Object} payload - Data to encode in the token (e.g., { userId: ... })
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be a valid object');
  }

  // -------------------------------------------
  // SAFETY FIX 🔥 Prevent generating bad tokens
  // -------------------------------------------
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

  if (!isValidJwt(token)) {
    console.error("❌ Generated JWT is malformed!");
    throw new Error("Failed to generate a valid JWT.");
  }

  return token;
};

/**
 * Verify a JWT token.
 * @param {string} token - JWT token string
 * @returns {Object|null} Decoded payload if valid, otherwise null
 */
export const verifyToken = (token) => {
  if (!token || typeof token !== 'string') return null;


  if (!isValidJwt(token)) {
    console.warn("⚠️ Skipping malformed JWT:", token);
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    return null;
  }
};
