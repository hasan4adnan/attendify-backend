/**
 * Settings Service
 * 
 * Business logic layer for user settings operations.
 * Handles profile updates and password changes.
 * 
 * Usage:
 *   const settingsService = require('./services/settings.service');
 *   const result = await settingsService.updateProfile(userId, profileData);
 */

const userModel = require('../models/user.model');
const hashUtil = require('../utils/hash');

/**
 * Update user profile
 * 
 * @param {number} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.name - First name (optional)
 * @param {string} profileData.surname - Last name (optional)
 * @param {string} profileData.email - Email (optional)
 * @param {string} profileData.role - Role (optional)
 * @param {number} profileData.universityId - University ID (optional)
 * @returns {Promise<Object>} Updated user object
 */
async function updateProfile(userId, profileData) {
  const { name, surname, email, role, universityId } = profileData;
  
  // Check if user exists
  const existingUser = await userModel.findUserById(userId);
  if (!existingUser) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if email is being updated and if it conflicts
  if (email && email !== existingUser.email) {
    const existingByEmail = await userModel.findUserByEmail(email);
    if (existingByEmail) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }
  }
  
  // Validate university exists if provided
  if (universityId !== undefined && universityId !== null) {
    const university = await userModel.findUniversityById(universityId);
    if (!university) {
      const error = new Error('University not found');
      error.statusCode = 404;
      throw error;
    }
  }
  
  // Prepare update data
  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (surname !== undefined) updateFields.surname = surname;
  if (email !== undefined) updateFields.email = email;
  if (role !== undefined) updateFields.role = role;
  if (universityId !== undefined) updateFields.university_id = universityId;
  
  // Update user
  const updatedUser = await userModel.updateUser(userId, updateFields);
  
  return {
    user: {
      userId: updatedUser.user_id,
      name: updatedUser.name,
      surname: updatedUser.surname,
      email: updatedUser.email,
      role: updatedUser.role,
      universityId: updatedUser.university_id || null,
      universityName: updatedUser.university_name || null,
      createdAt: updatedUser.created_at,
    },
  };
}

/**
 * Update user password
 * 
 * @param {number} userId - User ID
 * @param {string} currentPassword - Current password (plain text)
 * @param {string} newPassword - New password (plain text)
 * @returns {Promise<Object>} Success message
 */
async function updatePassword(userId, currentPassword, newPassword) {
  // Check if user exists
  const user = await userModel.findUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Verify current password
  const isPasswordValid = await hashUtil.verifyPassword(currentPassword, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 401;
    throw error;
  }
  
  // Hash new password
  const newPasswordHash = await hashUtil.hashPassword(newPassword);
  
  // Update password
  await userModel.updateUser(userId, {
    password_hash: newPasswordHash,
  });
  
  return {
    message: 'Password updated successfully',
  };
}

module.exports = {
  updateProfile,
  updatePassword,
};


