/**
 * Course Controller
 * 
 * Request/response handling layer for course endpoints.
 * Validates requests, calls services, and formats HTTP responses.
 * 
 * Usage:
 *   These functions are called by Express routes.
 *   They handle HTTP-specific concerns (status codes, response format).
 */

const courseService = require('../services/course.service');
const ApiError = require('../utils/ApiError');

/**
 * Create a new course
 * 
 * POST /api/courses
 * 
 * Request body: { courseName, courseCode, description, weeklyHours, academicYear, courseCategory, instructorId, roomNumber, semester, schedule, studentIds }
 */
async function createCourse(req, res, next) {
  try {
    const { courseName, courseCode, description, weeklyHours, academicYear, courseCategory, instructorId, roomNumber, semester, schedule, studentIds } = req.body;
    
    const result = await courseService.createCourse({
      courseName,
      courseCode,
      description,
      weeklyHours,
      academicYear,
      courseCategory,
      instructorId,
      roomNumber,
      semester,
      schedule: schedule || [],
      studentIds: studentIds || [],
    });
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: result.course,
    });
  } catch (error) {
    // Handle duplicate course code (409)
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
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
 * Get all courses with pagination and filters
 * 
 * GET /api/courses
 * 
 * Query params: page, limit, search, instructorId, academicYear, courseCategory
 */
async function getAllCourses(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const instructorId = req.query.instructorId ? parseInt(req.query.instructorId) : null;
    const academicYear = req.query.academicYear || null;
    const courseCategory = req.query.courseCategory || null;
    
    const result = await courseService.getAllCourses(page, limit, search, instructorId, academicYear, courseCategory);
    
    res.status(200).json({
      success: true,
      data: result.courses,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a course by ID
 * 
 * GET /api/courses/:id
 */
async function getCourseById(req, res, next) {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }
    
    const result = await courseService.getCourseById(courseId);
    
    res.status(200).json({
      success: true,
      data: result.course,
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
 * Update a course
 * 
 * PUT /api/courses/:id
 * 
 * Request body: { courseName, courseCode, description, weeklyHours, academicYear, courseCategory, instructorId, roomNumber, semester, schedule }
 */
async function updateCourse(req, res, next) {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }
    
    const { courseName, courseCode, description, weeklyHours, academicYear, courseCategory, instructorId, roomNumber, semester, schedule } = req.body;
    
    const result = await courseService.updateCourse(courseId, {
      courseName,
      courseCode,
      description,
      weeklyHours,
      academicYear,
      courseCategory,
      instructorId,
      roomNumber,
      semester,
      schedule,
    });
    
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: result.course,
    });
  } catch (error) {
    // Handle not found (404)
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    // Handle duplicate course code (409)
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
 * Delete a course
 * 
 * DELETE /api/courses/:id
 */
async function deleteCourse(req, res, next) {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }
    
    const result = await courseService.deleteCourse(courseId);
    
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
    next(error);
  }
}

/**
 * Enroll students in a course
 * 
 * POST /api/courses/:id/students
 * 
 * Request body: { studentIds: [1, 2, 3] }
 */
async function enrollStudents(req, res, next) {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }
    
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'studentIds array is required',
      });
    }
    
    const result = await courseService.enrollStudents(courseId, studentIds);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.enrolledStudents,
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
 * Remove students from a course
 * 
 * DELETE /api/courses/:id/students
 * 
 * Request body: { studentIds: [1, 2, 3] }
 */
async function removeStudents(req, res, next) {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }
    
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'studentIds array is required',
      });
    }
    
    const result = await courseService.removeStudents(courseId, studentIds);
    
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
    next(error);
  }
}

/**
 * Get enrolled students for a course
 * 
 * GET /api/courses/:id/students
 */
async function getEnrolledStudents(req, res, next) {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }
    
    const students = await courseService.getEnrolledStudents(courseId);
    
    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudents,
  removeStudents,
  getEnrolledStudents,
};

