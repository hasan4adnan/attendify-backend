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
    const userId = req.user.userId; // Get from authenticated user
    // Note: instructorId from body is ignored - course is always created for the authenticated user
    const { courseName, courseCode, description, weeklyHours, academicYear, courseCategory, roomNumber, semester, schedule, studentIds } = req.body;
    
    const result = await courseService.createCourse({
      courseName,
      courseCode,
      description,
      weeklyHours,
      academicYear,
      courseCategory,
      roomNumber,
      semester,
      schedule: schedule || [],
      studentIds: studentIds || [],
      createdBy: userId, // Always set to authenticated user - courses are owned by creator
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
    const userId = req.user.userId; // Get from authenticated user
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const academicYear = req.query.academicYear || null;
    const courseCategory = req.query.courseCategory || null;
    
    // Users can only see their own courses, so we pass userId
    const result = await courseService.getAllCourses(page, limit, search, null, academicYear, courseCategory, userId);
    
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
 * Get courses by instructor ID
 * 
 * GET /api/courses/instructor/:instructorId
 * 
 * Query params: page, limit, search, academicYear, courseCategory
 */
async function getCoursesByInstructorId(req, res, next) {
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
    const academicYear = req.query.academicYear || null;
    const courseCategory = req.query.courseCategory || null;
    
    const result = await courseService.getCoursesByInstructorId(
      instructorId,
      page,
      limit,
      search,
      academicYear,
      courseCategory,
      requestingUserId,
      requestingUserRole
    );
    
    res.status(200).json({
      success: true,
      data: result.courses,
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

/**
 * Get a course by ID
 * 
 * GET /api/courses/:id
 */
async function getCourseById(req, res, next) {
  try {
    const userId = req.user.userId; // Get from authenticated user
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }
    
    const result = await courseService.getCourseById(courseId, userId);
    
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
    // Handle forbidden (403) - user doesn't own the course
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
 * Update a course
 * 
 * PUT /api/courses/:id
 * 
 * Request body: { courseName, courseCode, description, weeklyHours, academicYear, courseCategory, instructorId, roomNumber, semester, schedule }
 */
async function updateCourse(req, res, next) {
  try {
    const userId = req.user.userId; // Get from authenticated user
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
    }, userId);
    
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
    // Handle forbidden (403) - user doesn't own the course
    if (error.statusCode === 403) {
      return res.status(403).json({
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
    const userId = req.user.userId; // Get from authenticated user
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }
    
    const result = await courseService.deleteCourse(courseId, userId);
    
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
    const userId = req.user.userId; // Get from authenticated user
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
    
    const result = await courseService.enrollStudents(courseId, studentIds, userId);
    
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
    // Handle forbidden (403) - user doesn't own the course
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
 * Remove students from a course
 * 
 * DELETE /api/courses/:id/students
 * 
 * Request body: { studentIds: [1, 2, 3] }
 */
async function removeStudents(req, res, next) {
  try {
    const userId = req.user.userId; // Get from authenticated user
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
    
    const result = await courseService.removeStudents(courseId, studentIds, userId);
    
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
    // Handle forbidden (403) - user doesn't own the course
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
 * Get enrolled students for a course
 * 
 * GET /api/courses/:id/students
 */
async function getEnrolledStudents(req, res, next) {
  try {
    const userId = req.user.userId; // Get from authenticated user
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }
    
    const students = await courseService.getEnrolledStudents(courseId, userId);
    
    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    // Handle not found (404)
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    // Handle forbidden (403) - user doesn't own the course
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
  createCourse,
  getAllCourses,
  getCourseById,
  getCoursesByInstructorId,
  updateCourse,
  deleteCourse,
  enrollStudents,
  removeStudents,
  getEnrolledStudents,
};

