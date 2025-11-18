/**
 * Verification Service
 * 
 * Business logic layer for email verification operations.
 * Handles verification code generation, sending, and validation.
 * 
 * Usage:
 *   const verificationService = require('./services/verification.service');
 *   await verificationService.sendVerificationCode(userId, 'signup');
 */

const verificationModel = require('../models/userVerification.model');
const userModel = require('../models/user.model');
const hashUtil = require('../utils/hash');
const emailUtil = require('../utils/email');
const config = require('../config/env');

/**
 * Send a verification code to a user
 * 
 * @param {number} userId - User ID
 * @param {string} purpose - Purpose of verification ('signup', 'reset_password', 'mfa')
 * @returns {Promise<string>} The plain verification code (for development - return in response)
 */
async function sendVerificationCode(userId, purpose = 'signup') {
  // Get user to retrieve email
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Generate verification code
  const code = emailUtil.generateVerificationCode();
  
  // Hash the code
  const codeHash = await hashUtil.hashVerificationCode(code);
  
  // Optionally invalidate old active verifications for this user/purpose
  await verificationModel.invalidateActiveVerifications(userId, purpose);
  
  // Create verification record
  await verificationModel.createVerificationCode(userId, codeHash, purpose, 'email');
  
  // Send email (logs to console in development)
  await emailUtil.sendVerificationCode(user.email, code, purpose);
  
  // Return the plain code for development (remove in production)
  return code;
}

/**
 * Verify a verification code for a user
 * 
 * @param {number} userId - User ID
 * @param {string} code - Plain text verification code
 * @param {string} purpose - Purpose of verification ('signup', 'reset_password', 'mfa')
 * @returns {Promise<Object>} Verification record
 */
async function verifyCode(userId, code, purpose = 'signup') {
  // Find active verification for user and purpose
  const verification = await verificationModel.findActiveVerificationByUserAndPurpose(userId, purpose);
  
  if (!verification) {
    throw new Error('No active verification code found, or it has expired');
  }
  
  // Check if attempt count exceeds max
  if (verification.attempt_count >= config.verification.maxAttempts) {
    throw new Error('Too many verification attempts. Please request a new code.');
  }
  
  // Verify code hash
  const isValid = await hashUtil.verifyVerificationCode(code, verification.code_hash);
  
  if (!isValid) {
    // Increment attempt count
    await verificationModel.incrementAttemptCount(verification.verification_id);
    throw new Error('Invalid verification code');
  }
  
  // Mark as consumed
  await verificationModel.markVerificationAsConsumed(verification.verification_id);
  
  return verification;
}

module.exports = {
  sendVerificationCode,
  verifyCode,
};

