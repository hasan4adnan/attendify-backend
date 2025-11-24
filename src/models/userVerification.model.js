/**
 * User Verification Model
 * 
 * Data access layer for the `user_verification` table.
 * Handles verification code creation, lookup, and consumption.
 * 
 * Usage:
 *   const verificationModel = require('./models/userVerification.model');
 *   const verification = await verificationModel.createVerificationCode(userId, codeHash, 'signup');
 */

const db = require('../config/database');
const config = require('../config/env');

/**
 * Create a new verification code record
 * 
 * @param {number} userId - User ID (foreign key to user table)
 * @param {string} codeHash - Hashed verification code
 * @param {string} purpose - Purpose of verification ('signup', 'reset_password', 'mfa')
 * @param {string} deliveryChannel - How the code was sent ('email', 'sms')
 * @returns {Promise<Object>} Created verification record
 */
async function createVerificationCode(userId, codeHash, purpose, deliveryChannel = 'email') {
  const sql = `
    INSERT INTO USER_VERIFICATION 
    (user_id, purpose, code_hash, delivery_channel, expires_at, attempt_count, created_at)
    VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), 0, NOW())
  `;
  
  const params = [
    userId,
    purpose,
    codeHash,
    deliveryChannel,
    config.verification.ttlMinutes,
  ];
  
  const [result] = await db.pool.execute(sql, params);
  
  // Fetch the created record to return complete data
  const [rows] = await db.pool.execute(
    'SELECT * FROM USER_VERIFICATION WHERE verification_id = ?',
    [result.insertId]
  );
  
  return rows[0];
}

/**
 * Find an active (non-consumed, non-expired) verification code for a user and purpose
 * 
 * @param {number} userId - User ID
 * @param {string} purpose - Purpose of verification ('signup', 'reset_password', 'mfa')
 * @returns {Promise<Object|null>} Verification record or null if not found
 */
async function findActiveVerificationByUserAndPurpose(userId, purpose) {
  const sql = `
    SELECT verification_id, user_id, purpose, code_hash, delivery_channel, 
           expires_at, consumed_at, attempt_count, created_at
    FROM USER_VERIFICATION
    WHERE user_id = ? AND purpose = ? AND consumed_at IS NULL AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  const rows = await db.query(sql, [userId, purpose]);
  return rows[0] || null;
}

/**
 * Mark a verification code as consumed (used)
 * 
 * @param {number} verificationId - Verification ID
 * @returns {Promise<void>}
 */
async function markVerificationAsConsumed(verificationId) {
  const sql = `
    UPDATE USER_VERIFICATION 
    SET consumed_at = NOW() 
    WHERE verification_id = ?
  `;
  
  await db.pool.execute(sql, [verificationId]);
}

/**
 * Increment the attempt count for a verification code
 * 
 * @param {number} verificationId - Verification ID
 * @returns {Promise<void>}
 */
async function incrementAttemptCount(verificationId) {
  const sql = `
    UPDATE USER_VERIFICATION 
    SET attempt_count = attempt_count + 1 
    WHERE verification_id = ?
  `;
  
  await db.pool.execute(sql, [verificationId]);
}

/**
 * Invalidate all active verification codes for a user and purpose
 * (Optional: useful when generating a new code to invalidate old ones)
 * 
 * @param {number} userId - User ID
 * @param {string} purpose - Purpose of verification
 * @returns {Promise<void>}
 */
async function invalidateActiveVerifications(userId, purpose) {
  const sql = `
    UPDATE USER_VERIFICATION 
    SET consumed_at = NOW() 
    WHERE user_id = ? AND purpose = ? AND consumed_at IS NULL
  `;
  
  await db.pool.execute(sql, [userId, purpose]);
}

/**
 * Check if user has a consumed verification for a specific purpose
 * (Used to check if user has verified their email during signup)
 * 
 * @param {number} userId - User ID
 * @param {string} purpose - Purpose of verification ('signup', 'reset_password', 'mfa')
 * @returns {Promise<boolean>} True if user has consumed verification, false otherwise
 */
async function hasConsumedVerification(userId, purpose) {
  const sql = `
    SELECT verification_id
    FROM USER_VERIFICATION
    WHERE user_id = ? AND purpose = ? AND consumed_at IS NOT NULL
    LIMIT 1
  `;
  
  const rows = await db.query(sql, [userId, purpose]);
  return rows.length > 0;
}

module.exports = {
  createVerificationCode,
  findActiveVerificationByUserAndPurpose,
  markVerificationAsConsumed,
  incrementAttemptCount,
  invalidateActiveVerifications,
  hasConsumedVerification,
};

