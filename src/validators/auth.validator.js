/**
 * Authentication Request Validators
 * 
 * Validates request bodies for authentication endpoints using express-validator.
 * 
 * Usage:
 *   const { validateRegister, validateLogin, validateVerifyEmail } = require('./validators/auth.validator');
 *   router.post('/register', validateRegister, authController.register);
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
 * Register request validation rules
 * 
 * Validates: name, surname, email, password, confirmPassword, role
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('surname')
    .trim()
    .notEmpty()
    .withMessage('Surname is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Surname must be between 2 and 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('role')
    .optional()
    .isIn(['admin', 'instructor'])
    .withMessage('Role must be admin or instructor'),
  handleValidationErrors,
];

/**
 * Login request validation rules
 * 
 * Validates: email, password
 */
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * Verify email request validation rules
 * 
 * Validates: email, code
 */
const validateVerifyEmail = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('code')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Code must be exactly 6 digits')
    .isNumeric()
    .withMessage('Code must be numeric'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
};

