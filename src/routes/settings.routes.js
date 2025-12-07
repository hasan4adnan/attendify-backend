/**
 * Settings Routes
 * 
 * Defines all settings-related API endpoints.
 * 
 * Routes:
 *   PUT /api/settings/profile - Update user profile
 *   PUT /api/settings/password - Update user password
 * 
 * Usage:
 *   const settingsRoutes = require('./routes/settings.routes');
 *   app.use('/api/settings', settingsRoutes);
 */

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { validateUpdateProfile, validateUpdatePassword } = require('../validators/settings.validator');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * PUT /api/settings/profile
 * Update user profile
 * Protected route - requires authentication
 */
router.put('/profile', authMiddleware, validateUpdateProfile, settingsController.updateProfile);

/**
 * PUT /api/settings/password
 * Update user password
 * Protected route - requires authentication
 */
router.put('/password', authMiddleware, validateUpdatePassword, settingsController.updatePassword);

module.exports = router;


