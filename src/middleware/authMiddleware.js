/**
 * Authentication Middleware
 * 
 * Validates JWT tokens from Authorization header.
 * Attaches user information to req.user for use in protected routes.
 * 
 * Usage:
 *   const authMiddleware = require('./middleware/authMiddleware');
 *   router.get('/protected', authMiddleware, protectedController);
 */

const jwtUtil = require('../utils/jwt');
const userModel = require('../models/user.model');
const ApiError = require('../utils/ApiError');

/**
 * Authenticate request using JWT token
 * 
 * Extracts token from Authorization header, verifies it, and attaches user to req.user
 * 
 * Steps:
 *   1. Extract Authorization header from req.headers.authorization
 *   2. If no header, return 401 Unauthorized
 *   3. Extract token using jwtUtil.extractTokenFromHeader
 *   4. Verify token using jwtUtil.verifyToken
 *   5. Find user by ID from token payload (use userModel.findUserById)
 *   6. If user not found, return 401 Unauthorized
 *   7. Attach user to req.user
 *   8. Call next() to continue to next middleware/route handler
 */
async function authMiddleware(req, res, next) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new ApiError('Authorization header missing', 401));
    }
    
    // Extract token from "Bearer <token>" format
    const token = jwtUtil.extractTokenFromHeader(authHeader);
    if (!token) {
      return next(new ApiError('Invalid token format. Expected: Bearer <token>', 401));
    }
    
    // Verify token and get payload
    let payload;
    try {
      payload = jwtUtil.verifyToken(token);
    } catch (error) {
      // Handle JWT specific errors
      if (error.name === 'TokenExpiredError') {
        return next(new ApiError('Token expired', 401));
      }
      if (error.name === 'JsonWebTokenError') {
        return next(new ApiError('Invalid token', 401));
      }
      throw error; // Re-throw unexpected errors
    }
    
    // Find user by ID from token payload
    const user = await userModel.findUserById(payload.userId);
    if (!user) {
      return next(new ApiError('User not found', 401));
    }
    
    // Attach user to request object
    req.user = { 
      userId: user.user_id, 
      email: user.email, 
      role: user.role 
    };
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle unexpected errors
    next(error);
  }
}

module.exports = authMiddleware;

