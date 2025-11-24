/**
 * Authentication Service
 * 
 * Business logic layer for authentication operations.
 * Orchestrates user model, verification service, and utility functions.
 * 
 * Usage:
 *   const authService = require('./services/auth.service');
 *   const result = await authService.register({ name, surname, email, password, role });
 */

const userModel = require('../models/user.model');
const verificationService = require('./verification.service');
const hashUtil = require('../utils/hash');
const jwtUtil = require('../utils/jwt');
const emailUtil = require('../utils/email');

/**
 * Register a new user
 * 
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's first name
 * @param {string} userData.surname - User's last name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - Plain text password
 * @param {string} userData.role - User role ('admin', 'instructor')
 * @returns {Promise<Object>} Created user object and verification code
 */
async function register(userData) {
  // Check if user with email already exists
  const existingUser = await userModel.findUserByEmail(userData.email);
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }
  
  // Hash the password
  const passwordHash = await hashUtil.hashPassword(userData.password);
  
  // Create user in database
  const newUser = await userModel.createUser({
    name: userData.name,
    surname: userData.surname,
    email: userData.email,
    password_hash: passwordHash,
    role: userData.role || 'instructor',
  });
  
  // Generate and send verification code
  const verificationCode = await verificationService.sendVerificationCode(newUser.user_id, 'signup');
  
  return {
    user: {
      userId: newUser.user_id,
      name: newUser.name,
      surname: newUser.surname,
      email: newUser.email,
      role: newUser.role,
    },
    verificationCode, // Return code for development (remove in production)
  };
}

/**
 * Login a user with email and password
 * 
 * @param {string} email - User's email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} User object and JWT token
 */
async function login(email, password) {
  // Find user by email
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }
  
  // Verify password
  const isPasswordValid = await hashUtil.verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }
  
  // Check if user has verified their email (has consumed signup verification)
  const verificationModel = require('../models/userVerification.model');
  const hasVerified = await verificationModel.hasConsumedVerification(user.user_id, 'signup');
  if (!hasVerified) {
    const error = new Error('Email not verified. Please verify your email before logging in.');
    error.statusCode = 403;
    throw error;
  }
  
  // Generate JWT token
  const token = jwtUtil.generateToken({
    userId: user.user_id,
    email: user.email,
    role: user.role,
  });
  
  // Send login notification email (non-blocking)
  try {
    const loginTime = new Date().toLocaleString();
    await emailUtil.sendLoginNotificationEmail(
      user.email, 
      `${user.name} ${user.surname}`.trim() || user.name,
      loginTime
    );
  } catch (error) {
    // Log error but don't fail login if email fails
    console.error('Failed to send login notification email:', error);
  }
  
  return {
    user: {
      id: user.user_id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

/**
 * Verify email with verification code
 * 
 * @param {string} email - User's email
 * @param {string} code - Verification code
 * @returns {Promise<Object>} Success message
 * 
 * Note: For now, we assume verification is enough. Later you might add a `verified` column to user table.
 */
async function verifyEmail(email, code) {
  // Find user by email
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Verify code using verificationService
  await verificationService.verifyCode(user.user_id, code, 'signup');
  
  // User is now verified (consumed verification record exists)
  // If you add a verified column to user table later, update it here:
  // await userModel.updateUser(user.user_id, { verified: true });
  
  // Send welcome email after successful verification
  try {
    await emailUtil.sendWelcomeEmail(user.email, `${user.name} ${user.surname}`.trim() || user.name);
  } catch (error) {
    // Log error but don't fail verification if email fails
    console.error('Failed to send welcome email:', error);
  }
  
  return { message: 'Email successfully verified.' };
}

/**
 * Resend verification code to user's email
 * 
 * @param {string} email - User's email
 * @returns {Promise<Object>} Success message and verification code (for development)
 */
async function resendVerificationCode(email) {
  // Find user by email
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if user is already verified
  const verificationModel = require('../models/userVerification.model');
  const hasVerified = await verificationModel.hasConsumedVerification(user.user_id, 'signup');
  if (hasVerified) {
    const error = new Error('Email is already verified');
    error.statusCode = 400;
    throw error;
  }
  
  // Send new verification code
  const verificationCode = await verificationService.sendVerificationCode(user.user_id, 'signup');
  
  return {
    message: 'Verification code has been sent to your email.',
    verificationCode, // Return code for development (remove in production)
  };
}

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationCode,
};

