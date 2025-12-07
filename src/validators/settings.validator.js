/**
 * Settings Request Validators
 * 
 * Validates request bodies for settings endpoints using express-validator.
 * 
 * Usage:
 *   const { validateUpdateProfile, validateUpdatePassword } = require('./validators/settings.validator');
 *   router.put('/profile', validateUpdateProfile, settingsController.updateProfile);
 */

const { body, validationResult } = require('express-validator');

/**
 * Validation result handler middleware
 * Extracts validation errors and passes them to error handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Update profile request validation rules
 * 
 * Validates: name, surname, email, role, universityId (all optional)
 */
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('surname')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Surname cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Surname must be between 2 and 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'instructor'])
    .withMessage('Role must be admin or instructor'),
  body('universityId')
    .optional()
    .custom((value) => {
      if (value !== null && value !== undefined) {
        if (!Number.isInteger(value) || value < 1) {
          throw new Error('University ID must be a positive integer or null');
        }
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Update password request validation rules
 * 
 * Validates: currentPassword, newPassword, confirmNewPassword
 */
const validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  validateUpdateProfile,
  validateUpdatePassword,
};


