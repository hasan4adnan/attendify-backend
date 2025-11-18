/**
 * Global Error Handler Middleware
 * 
 * Catches all errors and formats them into consistent API error responses.
 * Should be the last middleware in the Express app.
 * 
 * Usage:
 *   const errorHandler = require('./middleware/errorHandler');
 *   app.use(errorHandler);
 */

const ApiError = require('../utils/ApiError');
const config = require('../config/env');

/**
 * Global error handler middleware
 * 
 * Formats errors into consistent JSON responses.
 * Handles ApiError instances and unexpected errors.
 * 
 * TODO: Implement error handler
 *   1. If error is ApiError instance, use its status and message
 *   2. If error is validation error, format appropriately
 *   3. If error is database error, log it but return generic message in production
 *   4. Log errors in development, hide details in production
 *   5. Return JSON response with { success: false, message, ...errors? }
 */
function errorHandler(err, req, res, next) {
  // TODO: Implement error handler
  // If error is ApiError, use its status and message
  // Otherwise, default to 500
  
  let statusCode = 500;
  let message = 'Internal server error';
  
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Log error in development
  if (config.server.env === 'development') {
    console.error('Error:', err);
  }
  
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(config.server.env === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;

