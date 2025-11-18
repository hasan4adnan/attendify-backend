/**
 * API Error Class
 * 
 * Custom error class for API errors with status codes.
 * Extends native Error class to include HTTP status code.
 * 
 * Usage:
 *   const ApiError = require('./utils/ApiError');
 *   throw new ApiError('User not found', 404);
 */

class ApiError extends Error {
  /**
   * Create an API error
   * 
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;

