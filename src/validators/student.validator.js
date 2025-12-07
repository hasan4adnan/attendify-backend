/**
 * Student Request Validators
 * 
 * Validates request bodies for student endpoints using express-validator.
 * 
 * Usage:
 *   const { validateCreateStudent, validateUpdateStudent } = require('./validators/student.validator');
 *   router.post('/students', validateCreateStudent, studentController.createStudent);
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
 * Create student request validation rules
 * 
 * Validates: name, surname, studentNumber, department, faceEmbedding, photoPath, createdBy, courseIds
 */
const validateCreateStudent = [
  body('universityId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('University ID must be a positive integer'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('surname')
    .trim()
    .notEmpty()
    .withMessage('Surname is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Surname must be between 2 and 100 characters'),
  body('studentNumber')
    .trim()
    .notEmpty()
    .withMessage('Student number is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Student number must be between 3 and 50 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Department must be less than 255 characters'),
  body('faceEmbedding')
    .optional({ nullable: true })
    .custom((value) => {
      if (value !== null && value !== undefined && typeof value !== 'string') {
        throw new Error('Face embedding must be a string or null');
      }
      return true;
    }),
  body('photoPath')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Photo path must be less than 500 characters'),
  body('createdBy')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Created by must be a positive integer'),
  body('courseIds')
    .optional()
    .isArray()
    .withMessage('Course IDs must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        const allNumbers = value.every(id => typeof id === 'number' && id > 0);
        if (!allNumbers) {
          throw new Error('All course IDs must be positive numbers');
        }
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Update student request validation rules
 * 
 * Validates: name, surname, studentNumber, department, faceEmbedding, photoPath, createdBy, courseIds (all optional)
 */
const validateUpdateStudent = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('surname')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Surname cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Surname must be between 2 and 100 characters'),
  body('universityId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('University ID must be a positive integer'),
  body('studentNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Student number cannot be empty')
    .isLength({ min: 3, max: 50 })
    .withMessage('Student number must be between 3 and 50 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Department must be less than 255 characters'),
  body('faceEmbedding')
    .optional({ nullable: true })
    .custom((value) => {
      if (value !== null && value !== undefined && typeof value !== 'string') {
        throw new Error('Face embedding must be a string or null');
      }
      return true;
    }),
  body('photoPath')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Photo path must be less than 500 characters'),
  body('createdBy')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Created by must be a positive integer'),
  body('courseIds')
    .optional()
    .isArray()
    .withMessage('Course IDs must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        const allNumbers = value.every(id => typeof id === 'number' && id > 0);
        if (!allNumbers) {
          throw new Error('All course IDs must be positive numbers');
        }
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  validateCreateStudent,
  validateUpdateStudent,
};

