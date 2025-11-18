/**
 * JWT Utility Functions
 * 
 * Handles JWT token generation and verification.
 * Used for authentication middleware and login responses.
 * 
 * Usage:
 *   const jwt = require('./utils/jwt');
 *   const token = jwt.generateToken({ userId: 1, email: 'user@example.com' });
 *   const payload = jwt.verifyToken(token);
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate a JWT token for a user
 * 
 * @param {Object} payload - User data to encode in token (e.g., { userId, email, role })
 * @returns {string} JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

/**
 * Verify and decode a JWT token
 * 
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

/**
 * Extract token from Authorization header
 * 
 * @param {string} authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns {string|null} Extracted token or null if invalid format
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null;
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
}

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
};

