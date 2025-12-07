/**
 * Student Controller
 * 
 * Request/response handling layer for student endpoints.
 * Validates requests, calls services, and formats HTTP responses.
 * 
 * Usage:
 *   These functions are called by Express routes.
 *   They handle HTTP-specific concerns (status codes, response format).
 */

const studentService = require('../services/student.service');
const ApiError = require('../utils/ApiError');

/**
 * Create a new student
 * 
 * POST /api/students
 * 
 * Request body: { name, surname, studentNumber, department, faceEmbedding, photoPath, createdBy, courseIds }
 */
async function createStudent(req, res, next) {
  try {
    const { name, surname, universityId ,studentNumber, department, faceEmbedding, photoPath, createdBy, courseIds } = req.body;
    
    // Get created_by from authenticated user if not provided
    const userId = createdBy || (req.user ? req.user.userId : null);
    
    const result = await studentService.createStudent({
      name,
      universityId,
      surname,
      studentNumber,
      department,
      faceEmbedding,
      photoPath,
      createdBy: userId,
      courseIds: courseIds || [],
    });
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: result.student,
    });
  } catch (error) {
    // Handle duplicate student number (409)
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    // Handle missing courses (404)
    if (error.statusCode === 404 && error.missingCourseIds) {
      return res.status(404).json({
        success: false,
        message: error.message,
        missingCourseIds: error.missingCourseIds,
      });
    }
    next(error);
  }
}

/**
 * Get all students with pagination and search
 * 
 * GET /api/students
 * 
 * Query params: page, limit, search
 */
async function getAllStudents(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const result = await studentService.getAllStudents(page, limit, search);
    
    res.status(200).json({
      success: true,
      data: result.students,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a student by ID
 * 
 * GET /api/students/:id
 */
async function getStudentById(req, res, next) {
  try {
    const studentId = parseInt(req.params.id);
    
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID',
      });
    }
    
    const result = await studentService.getStudentById(studentId);
    
    res.status(200).json({
      success: true,
      data: result.student,
    });
  } catch (error) {
    // Handle not found (404)
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * Update a student
 * 
 * PUT /api/students/:id
 * 
 * Request body: { name, surname, studentNumber, department, faceEmbedding, photoPath, createdBy, courseIds }
 */
async function updateStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.id);
    const userId = req.user.userId; // Get from authenticated user
    const userRole = req.user.role; // Get from authenticated user
    
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID',
      });
    }
    
    const { name, surname, universityId, studentNumber, department, faceEmbedding, photoPath, createdBy, courseIds } = req.body;
    
    const result = await studentService.updateStudent(studentId, {
      name,
      surname,
      universityId,
      studentNumber,
      department,
      faceEmbedding,
      photoPath,
      createdBy,
      courseIds,
    }, userId, userRole);
    
    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: result.student,
    });
  } catch (error) {
    // Handle not found (404) - student not found or courses not found
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
        ...(error.missingCourseIds && { missingCourseIds: error.missingCourseIds }),
      });
    }
    // Handle forbidden (403) - user doesn't own the student
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    // Handle duplicate student number (409)
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
 * Delete a student
 * 
 * DELETE /api/students/:id
 */
async function deleteStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.id);
    const userId = req.user.userId; // Get from authenticated user
    const userRole = req.user.role; // Get from authenticated user
    
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID',
      });
    }
    
    const result = await studentService.deleteStudent(studentId, userId, userRole);
    
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
    // Handle forbidden (403) - user doesn't own the student
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * Get students created by a specific instructor
 * 
 * GET /api/students/instructor/:instructorId
 * 
 * Query params: page, limit, search
 */
async function getStudentsByInstructor(req, res, next) {
  try {
    const instructorId = parseInt(req.params.instructorId);
    const requestingUserId = req.user.userId;
    const requestingUserRole = req.user.role;
    
    if (isNaN(instructorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid instructor ID',
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const result = await studentService.getStudentsByInstructor(
      instructorId,
      page,
      limit,
      search,
      requestingUserId,
      requestingUserRole
    );
    
    res.status(200).json({
      success: true,
      data: result.students,
      instructor: result.instructor,
      pagination: result.pagination,
    });
  } catch (error) {
    // Handle not found (404)
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    // Handle forbidden (403)
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentsByInstructor,
  updateStudent,
  deleteStudent,
};

