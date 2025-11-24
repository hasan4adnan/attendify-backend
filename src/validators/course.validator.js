/**
 * Course Request Validators
 * 
 * Validates request bodies for course endpoints using express-validator.
 * 
 * Usage:
 *   const { validateCreateCourse, validateUpdateCourse } = require('./validators/course.validator');
 *   router.post('/courses', validateCreateCourse, courseController.createCourse);
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
 * Validate schedule entry
 */
const validateScheduleEntry = (entry, index) => {
  return [
    body(`schedule.${index}.day`)
      .trim()
      .notEmpty()
      .withMessage(`Schedule entry ${index + 1}: Day is required`)
      .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
      .withMessage(`Schedule entry ${index + 1}: Day must be a valid day of the week`),
    body(`schedule.${index}.start_time`)
      .trim()
      .notEmpty()
      .withMessage(`Schedule entry ${index + 1}: Start time is required`)
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage(`Schedule entry ${index + 1}: Start time must be in HH:MM format`),
    body(`schedule.${index}.end_time`)
      .trim()
      .notEmpty()
      .withMessage(`Schedule entry ${index + 1}: End time is required`)
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage(`Schedule entry ${index + 1}: End time must be in HH:MM format`),
  ];
};

/**
 * Create course request validation rules
 * 
 * Validates: courseName, courseCode, description, weeklyHours, academicYear, courseCategory, instructorId, roomNumber, semester, schedule
 */
const validateCreateCourse = [
  body('courseName')
    .trim()
    .notEmpty()
    .withMessage('Course name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Course name must be between 2 and 255 characters'),
  body('courseCode')
    .trim()
    .notEmpty()
    .withMessage('Course code is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Course code must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('weeklyHours')
    .notEmpty()
    .withMessage('Weekly hours is required')
    .isFloat({ min: 0, max: 168 })
    .withMessage('Weekly hours must be a number between 0 and 168'),
  body('academicYear')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Academic year must be less than 50 characters'),
  body('courseCategory')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Course category must be less than 100 characters'),
  body('instructorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Instructor ID must be a positive integer'),
  body('roomNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Room number must be less than 50 characters'),
  body('semester')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Semester must be less than 50 characters'),
  body('schedule')
    .optional()
    .isArray()
    .withMessage('Schedule must be an array')
    .custom((schedule) => {
      if (schedule && schedule.length > 0) {
        for (let i = 0; i < schedule.length; i++) {
          const entry = schedule[i];
          if (!entry.day || !entry.start_time || !entry.end_time) {
            throw new Error(`Schedule entry ${i + 1}: day, start_time, and end_time are required`);
          }
          if (!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(entry.day)) {
            throw new Error(`Schedule entry ${i + 1}: day must be a valid day of the week`);
          }
          if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(entry.start_time)) {
            throw new Error(`Schedule entry ${i + 1}: start_time must be in HH:MM format`);
          }
          if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(entry.end_time)) {
            throw new Error(`Schedule entry ${i + 1}: end_time must be in HH:MM format`);
          }
          // Validate that end time is after start time
          const [startHour, startMin] = entry.start_time.split(':').map(Number);
          const [endHour, endMin] = entry.end_time.split(':').map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;
          if (endMinutes <= startMinutes) {
            throw new Error(`Schedule entry ${i + 1}: end time must be after start time`);
          }
        }
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Update course request validation rules
 * 
 * Validates: courseName, courseCode, description, weeklyHours, academicYear, courseCategory, instructorId, roomNumber, semester, schedule (all optional)
 */
const validateUpdateCourse = [
  body('courseName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Course name cannot be empty')
    .isLength({ min: 2, max: 255 })
    .withMessage('Course name must be between 2 and 255 characters'),
  body('courseCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Course code cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Course code must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('weeklyHours')
    .optional()
    .isFloat({ min: 0, max: 168 })
    .withMessage('Weekly hours must be a number between 0 and 168'),
  body('academicYear')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Academic year must be less than 50 characters'),
  body('courseCategory')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Course category must be less than 100 characters'),
  body('instructorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Instructor ID must be a positive integer'),
  body('roomNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Room number must be less than 50 characters'),
  body('semester')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Semester must be less than 50 characters'),
  body('schedule')
    .optional()
    .isArray()
    .withMessage('Schedule must be an array')
    .custom((schedule) => {
      if (schedule && schedule.length > 0) {
        for (let i = 0; i < schedule.length; i++) {
          const entry = schedule[i];
          if (!entry.day || !entry.start_time || !entry.end_time) {
            throw new Error(`Schedule entry ${i + 1}: day, start_time, and end_time are required`);
          }
          if (!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(entry.day)) {
            throw new Error(`Schedule entry ${i + 1}: day must be a valid day of the week`);
          }
          if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(entry.start_time)) {
            throw new Error(`Schedule entry ${i + 1}: start_time must be in HH:MM format`);
          }
          if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(entry.end_time)) {
            throw new Error(`Schedule entry ${i + 1}: end_time must be in HH:MM format`);
          }
          // Validate that end time is after start time
          const [startHour, startMin] = entry.start_time.split(':').map(Number);
          const [endHour, endMin] = entry.end_time.split(':').map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;
          if (endMinutes <= startMinutes) {
            throw new Error(`Schedule entry ${i + 1}: end time must be after start time`);
          }
        }
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  validateCreateCourse,
  validateUpdateCourse,
};

