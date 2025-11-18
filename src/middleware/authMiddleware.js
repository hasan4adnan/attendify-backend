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
 * TODO: Implement authentication middleware
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
    // TODO: Implement authentication middleware
    // const authHeader = req.headers.authorization;
    // if (!authHeader) {
    //   return next(new ApiError('Authorization header missing', 401));
    // }
    // const token = jwtUtil.extractTokenFromHeader(authHeader);
    // if (!token) {
    //   return next(new ApiError('Invalid token format', 401));
    // }
    // const payload = jwtUtil.verifyToken(token);
    // const user = await userModel.findUserById(payload.userId);
    // if (!user) {
    //   return next(new ApiError('User not found', 401));
    // }
    // req.user = { userId: user.user_id, email: user.email, role: user.role };
    // next();
    
    // Stub for now
    next(new ApiError('authMiddleware not implemented', 501));
  } catch (error) {
    // TODO: Handle JWT errors (expired, invalid, etc.)
    // If error is jwt.JsonWebTokenError or jwt.TokenExpiredError, return 401
    // Otherwise, pass to error handler
    next(error);
  }
}

module.exports = authMiddleware;

