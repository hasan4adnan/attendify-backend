/**
 * Environment Configuration Module
 * 
 * Centralizes all environment variables and provides typed access to configuration.
 * Loads variables from .env file using dotenv.
 * 
 * Usage:
 *   const config = require('./config/env');
 *   const dbHost = config.db.host;
 */

require('dotenv').config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  // Database configuration
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ATTENDIFY',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Verification code configuration
  verification: {
    codeLength: parseInt(process.env.VERIFICATION_CODE_LENGTH) || 6,
    ttlMinutes: parseInt(process.env.VERIFICATION_CODE_TTL_MINUTES) || 15,
    maxAttempts: parseInt(process.env.MAX_VERIFICATION_ATTEMPTS) || 5,
  },

  // Email configuration (for future implementation)
  email: {
    // serviceProvider: process.env.EMAIL_SERVICE_PROVIDER,
    // host: process.env.EMAIL_HOST,
    // port: parseInt(process.env.EMAIL_PORT) || 587,
    // user: process.env.EMAIL_USER,
    // password: process.env.EMAIL_PASSWORD,
    // from: process.env.EMAIL_FROM || 'noreply@attendify.com',
  },
};

