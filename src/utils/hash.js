/**
 * Hashing Utility Functions
 * 
 * Handles password hashing and verification using bcrypt.
 * Also handles verification code hashing.
 * 
 * Usage:
 *   const hash = require('./utils/hash');
 *   const hashedPassword = await hash.password('myPassword123');
 *   const isValid = await hash.verifyPassword('myPassword123', hashedPassword);
 */

const bcrypt = require('bcrypt');

// Bcrypt salt rounds (higher = more secure but slower)
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * 
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * 
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password to compare against
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Hash a verification code (numeric code)
 * 
 * @param {string} code - Numeric verification code
 * @returns {Promise<string>} Hashed code
 */
async function hashVerificationCode(code) {
  return await bcrypt.hash(code, SALT_ROUNDS);
}

/**
 * Verify a verification code against a hash
 * 
 * @param {string} code - Plain text verification code
 * @param {string} hash - Hashed code to compare against
 * @returns {Promise<boolean>} True if code matches, false otherwise
 */
async function verifyVerificationCode(code, hash) {
  return await bcrypt.compare(code, hash);
}

module.exports = {
  hashPassword,
  verifyPassword,
  hashVerificationCode,
  verifyVerificationCode,
};

