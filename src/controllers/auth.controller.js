/**
 * Authentication Controller
 * 
 * Request/response handling layer for authentication endpoints.
 * Validates requests, calls services, and formats HTTP responses.
 * 
 * Usage:
 *   These functions are called by Express routes.
 *   They handle HTTP-specific concerns (status codes, response format).
 */

const authService = require('../services/auth.service');
const ApiError = require('../utils/ApiError');

/**
 * Register a new user
 * 
 * POST /api/auth/register
 * 
 * Request body: { name, surname, email, password, confirmPassword, role }
 */
async function register(req, res, next) {
  try {
    const { name, surname, email, password, confirmPassword, role } = req.body;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }
    
    const result = await authService.register({
      name,
      surname,
      email,
      password,
      role: role || 'instructor',
    });
    
    res.status(201).json({
      message: 'User registered. Please verify your email.',
      userId: result.user.userId,
      verificationCode: result.verificationCode, // Remove in production - only for development
    });
  } catch (error) {
    // Handle duplicate email (409)
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * Verify email with verification code
 * 
 * POST /api/auth/verify-email
 * 
 * Request body: { email, code }
 */
async function verifyEmail(req, res, next) {
  try {
    const { email, code } = req.body;
    
    const result = await authService.verifyEmail(email, code);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    // Handle specific verification errors
    if (error.message.includes('No active verification code') || 
        error.message.includes('expired')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    if (error.message.includes('Too many verification attempts')) {
      return res.status(429).json({
        success: false,
        message: error.message,
      });
    }
    
    if (error.message.includes('Invalid verification code')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    next(error);
  }
}

/**
 * Login with email and password
 * 
 * POST /api/auth/login
 * 
 * Request body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login(email, password);
    
    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    // Handle invalid credentials or unverified email
    if (error.statusCode === 401 || error.statusCode === 403) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
};

