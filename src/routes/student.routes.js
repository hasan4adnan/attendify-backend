/**
 * Student Routes
 * 
 * Defines all student-related API endpoints.
 * 
 * Routes:
 *   POST   /api/students - Create a new student
 *   GET    /api/students - Get all students (with pagination)
 *   GET    /api/students/:id - Get a student by ID
 *   PUT    /api/students/:id - Update a student
 *   DELETE /api/students/:id - Delete a student
 * 
 * Usage:
 *   const studentRoutes = require('./routes/student.routes');
 *   app.use('/api/students', studentRoutes);
 */

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { validateCreateStudent, validateUpdateStudent } = require('../validators/student.validator');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * POST /api/students
 * Create a new student
 * Protected route - requires authentication
 */
router.post('/', authMiddleware, validateCreateStudent, studentController.createStudent);

/**
 * GET /api/students
 * Get all students with pagination
 * Query params: page, limit
 * Protected route - requires authentication
 */
router.get('/', authMiddleware, studentController.getAllStudents);

/**
 * GET /api/students/:id
 * Get a student by ID
 * Protected route - requires authentication
 */
router.get('/:id', authMiddleware, studentController.getStudentById);

/**
 * PUT /api/students/:id
 * Update a student
 * Protected route - requires authentication
 */
router.put('/:id', authMiddleware, validateUpdateStudent, studentController.updateStudent);

/**
 * DELETE /api/students/:id
 * Delete a student
 * Protected route - requires authentication
 */
router.delete('/:id', authMiddleware, studentController.deleteStudent);

module.exports = router;






