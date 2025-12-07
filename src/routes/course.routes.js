/**
 * Course Routes
 * 
 * Defines all course-related API endpoints.
 * 
 * Routes:
 *   POST   /api/courses - Create a new course
 *   GET    /api/courses - Get all courses (with pagination and filters)
 *   GET    /api/courses/:id - Get a course by ID
 *   PUT    /api/courses/:id - Update a course
 *   DELETE /api/courses/:id - Delete a course
 *   POST   /api/courses/:id/students - Enroll students in a course
 *   DELETE /api/courses/:id/students - Remove students from a course
 *   GET    /api/courses/:id/students - Get enrolled students for a course
 * 
 * Usage:
 *   const courseRoutes = require('./routes/course.routes');
 *   app.use('/api/courses', courseRoutes);
 */

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { validateCreateCourse, validateUpdateCourse } = require('../validators/course.validator');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * POST /api/courses
 * Create a new course
 * Protected route - requires authentication
 */
router.post('/', authMiddleware, validateCreateCourse, courseController.createCourse);

/**
 * GET /api/courses
 * Get all courses with pagination (shows only authenticated user's courses)
 * Query params: page, limit, search, academicYear, courseCategory
 * Protected route - requires authentication
 */
router.get('/', authMiddleware, courseController.getAllCourses);

/**
 * GET /api/courses/instructor/:instructorId
 * Get courses by instructor/admin ID
 * Query params: page, limit, search, academicYear, courseCategory
 * Protected route - requires authentication
 * Authorization: Admins can view any instructor's courses, instructors can only view their own
 */
router.get('/instructor/:instructorId', authMiddleware, courseController.getCoursesByInstructorId);

/**
 * GET /api/courses/:id
 * Get a course by ID
 * Protected route - requires authentication
 */
router.get('/:id', authMiddleware, courseController.getCourseById);

/**
 * PUT /api/courses/:id
 * Update a course
 * Protected route - requires authentication
 */
router.put('/:id', authMiddleware, validateUpdateCourse, courseController.updateCourse);

/**
 * DELETE /api/courses/:id
 * Delete a course
 * Protected route - requires authentication
 */
router.delete('/:id', authMiddleware, courseController.deleteCourse);

/**
 * POST /api/courses/:id/students
 * Enroll students in a course
 * Protected route - requires authentication
 */
router.post('/:id/students', authMiddleware, courseController.enrollStudents);

/**
 * DELETE /api/courses/:id/students
 * Remove students from a course
 * Protected route - requires authentication
 */
router.delete('/:id/students', authMiddleware, courseController.removeStudents);

/**
 * GET /api/courses/:id/students
 * Get enrolled students for a course
 * Protected route - requires authentication
 */
router.get('/:id/students', authMiddleware, courseController.getEnrolledStudents);

module.exports = router;

