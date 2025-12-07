/**
 * Settings Controller
 * 
 * Request/response handling layer for settings endpoints.
 * Validates requests, calls services, and formats HTTP responses.
 * 
 * Usage:
 *   These functions are called by Express routes.
 *   They handle HTTP-specific concerns (status codes, response format).
 */

const settingsService = require('../services/settings.service');
const ApiError = require('../utils/ApiError');

/**
 * Update user profile
 * 
 * PUT /api/settings/profile
 * 
 * Request body: { name, surname, email, role, universityId } (all optional)
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.userId; // Get from authenticated user
    const { name, surname, email, role, universityId } = req.body;
    
    const result = await settingsService.updateProfile(userId, {
      name,
      surname,
      email,
      role,
      universityId,
    });
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result.user,
    });
  } catch (error) {
    // Handle not found (404)
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
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
 * Update user password
 * 
 * PUT /api/settings/password
 * 
 * Request body: { currentPassword, newPassword, confirmNewPassword }
 */
async function updatePassword(req, res, next) {
  try {
    const userId = req.user.userId; // Get from authenticated user
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    
    // Double-check passwords match (validator should catch this, but extra safety)
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }
    
    const result = await settingsService.updatePassword(userId, currentPassword, newPassword);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    // Handle not found (404)
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    // Handle incorrect current password (401)
    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

module.exports = {
  updateProfile,
  updatePassword,
};


