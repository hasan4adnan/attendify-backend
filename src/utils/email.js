/**
 * Email Utility Functions
 * 
 * Handles sending emails (verification codes, password resets, etc.).
 * Currently a stub - implement with nodemailer or your preferred email service.
 * 
 * Usage:
 *   const email = require('./utils/email');
 *   await email.sendVerificationCode('user@example.com', '123456');
 */

const config = require('../config/env');

/**
 * Send a verification code via email
 * 
 * @param {string} to - Recipient email address
 * @param {string} code - Numeric verification code
 * @param {string} purpose - Purpose of verification (e.g., 'signup', 'reset_password')
 * @returns {Promise<void>}
 * 
 * TODO: Implement email sending
 *   - Set up nodemailer or another email service
 *   - Configure SMTP settings from config.email
 *   - Send email with verification code
 *   - Handle errors appropriately
 * 
 * Example email content:
 *   Subject: "Attendify - Email Verification"
 *   Body: "Your verification code is: 123456. This code expires in 15 minutes."
 */
async function sendVerificationCode(to, code, purpose = 'signup') {
  // TODO: Implement email sending
  // For now, just log to console (remove in production)
  console.log(`[EMAIL STUB] Sending verification code to ${to}: ${code} (purpose: ${purpose})`);
  
  // Example implementation with nodemailer:
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({ ... });
  // await transporter.sendMail({
  //   from: config.email.from,
  //   to: to,
  //   subject: 'Attendify - Email Verification',
  //   text: `Your verification code is: ${code}. This code expires in ${config.verification.ttlMinutes} minutes.`,
  // });
}

/**
 * Generate a random numeric verification code
 * 
 * @param {number} length - Length of the code (default from config)
 * @returns {string} Numeric verification code
 */
function generateVerificationCode(length = null) {
  const codeLength = length || config.verification.codeLength;
  return Array.from({ length: codeLength }, () => Math.floor(Math.random() * 10)).join('');
}

module.exports = {
  sendVerificationCode,
  generateVerificationCode,
};

