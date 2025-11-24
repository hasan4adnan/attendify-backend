/**
 * Authentication Routes
 * 
 * Defines all authentication-related API endpoints.
 * 
 * Routes:
 *   POST /api/auth/register - Register a new user
 *   POST /api/auth/verify-email - Verify email with code
 *   POST /api/auth/resend-verification - Resend verification code
 *   POST /api/auth/login - Login with email and password
 * 
 * Usage:
 *   const authRoutes = require('./routes/auth.routes');
 *   app.use('/api/auth', authRoutes);
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin, validateVerifyEmail, validateResendVerification } = require('../validators/auth.validator');

/**
 * POST /api/auth/register
 * Register a new user and send verification code
 */
router.post('/register', validateRegister, authController.register);

/**
 * POST /api/auth/verify-email
 * Verify email address with verification code
 */
router.post('/verify-email', validateVerifyEmail, authController.verifyEmail);

/**
 * POST /api/auth/resend-verification
 * Resend verification code to user's email
 */
router.post('/resend-verification', validateResendVerification, authController.resendVerificationCode);

/**
 * POST /api/auth/login
 * Login with email and password, receive JWT token
 */
router.post('/login', validateLogin, authController.login);

module.exports = router;

