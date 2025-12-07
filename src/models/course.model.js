/**
 * Course Model
 * 
 * Data access layer for the `COURSE` table.
 * Contains all database queries related to course operations.
 * 
 * COURSE Table Structure:
 * - course_id (PK)
 * - course_name
 * - course_code
 * - description
 * - weekly_hours
 * - academic_year
 * - course_category
 * - instructor_id (FK → user.user_id)
 * - room_number (optional)
 * - semester (optional)
 * 
 * Usage:
 *   const courseModel = require('./models/course.model');
 *   const course = await courseModel.createCourse(courseData);
 */

const db = require('../config/database');

/**
 * Create a new course in the database
 * 
 * @param {Object} courseData - Course data object
 * @param {string} courseData.course_name - Course name
 * @param {string} courseData.course_code - Course code (unique)
 * @param {string} courseData.description - Course description (optional)
 * @param {number} courseData.weekly_hours - Weekly hours (optional)
 * @param {string} courseData.academic_year - Academic year (optional)
 * @param {string} courseData.course_category - Course category (optional)
 * @param {number} courseData.instructor_id - Instructor user ID (optional)
 * @param {string} courseData.room_number - Room number (optional)
 * @param {string} courseData.semester - Semester (optional)
 * @returns {Promise<Object>} Created course object with course_id
 */
async function createCourse(courseData) {
  const sql = `
    INSERT INTO COURSE (course_name, course_code, description, weekly_hours, academic_year, course_category, instructor_id, room_number, semester)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    courseData.course_name,
    courseData.course_code,
    courseData.description || null,
    courseData.weekly_hours || null,
    courseData.academic_year || null,
    courseData.course_category || null,
    courseData.instructor_id || null,
    courseData.room_number || null,
    courseData.semester || null,
  ];
  
  const [result] = await db.pool.execute(sql, params);
  
  return {
    course_id: result.insertId,
    course_name: courseData.course_name,
    course_code: courseData.course_code,
    description: courseData.description || null,
    weekly_hours: courseData.weekly_hours || null,
    academic_year: courseData.academic_year || null,
    course_category: courseData.course_category || null,
    instructor_id: courseData.instructor_id || null,
    room_number: courseData.room_number || null,
    semester: courseData.semester || null,
  };
}

/**
 * Find a course by course_id
 * 
 * @param {number} courseId - Course ID
 * @returns {Promise<Object|null>} Course object or null if not found
 */
async function findCourseById(courseId) {
  const sql = `
    SELECT course_id, course_name, course_code, description, weekly_hours, academic_year, course_category, instructor_id, room_number, semester
    FROM COURSE
    WHERE course_id = ?
  `;
  
  const rows = await db.query(sql, [courseId]);
  return rows[0] || null;
}

/**
 * Find a course by course_code and university_id
 * Course code uniqueness is scoped by university - same code can exist for different universities
 * 
 * @param {string} courseCode - Course code
 * @param {number|null} universityId - University ID (from instructor's university_id). If null, checks globally (backward compatibility)
 * @returns {Promise<Object|null>} Course object or null if not found
 */
async function findCourseByCode(courseCode, universityId) {
  let sql, params;
  
  if (universityId !== null && universityId !== undefined) {
    // Check within specific university
    sql = `
      SELECT c.course_id, c.course_name, c.course_code, c.description, c.weekly_hours, 
             c.academic_year, c.course_category, c.instructor_id, c.room_number, c.semester
      FROM COURSE c
      INNER JOIN USER u ON c.instructor_id = u.user_id
      WHERE c.course_code = ? AND u.university_id = ?
    `;
    params = [courseCode, universityId];
  } else {
    // Backward compatibility: check globally (should ideally not be used)
    sql = `
      SELECT course_id, course_name, course_code, description, weekly_hours, academic_year, course_category, instructor_id, room_number, semester
      FROM COURSE
      WHERE course_code = ?
    `;
    params = [courseCode];
  }
  
  const rows = await db.query(sql, params);
  return rows[0] || null;
}

/**
 * Get all courses with pagination and optional filters
 * 
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} search - Search query (optional) - searches course_name, course_code, description
 * @param {number} instructorId - Filter by instructor_id (optional)
 * @param {string} academicYear - Filter by academic_year (optional)
 * @param {string} courseCategory - Filter by course_category (optional)
 * @returns {Promise<Object>} Object with courses array and pagination info
 */
async function getAllCourses(page = 1, limit = 10, search = '', instructorId = null, academicYear = null, courseCategory = null) {
  // Ensure page and limit are integers
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;
  
  let countSql = 'SELECT COUNT(*) as total FROM COURSE';
  let sql = `
    SELECT course_id, course_name, course_code, description, weekly_hours, academic_year, course_category, instructor_id, room_number, semester
    FROM COURSE
  `;
  const params = [];
  const countParams = [];
  const conditions = [];
  
  // Add search filter if provided
  if (search && search.trim() !== '') {
    const searchParam = `%${search.trim()}%`;
    conditions.push(`(course_name LIKE ? OR course_code LIKE ? OR description LIKE ?)`);
    params.push(searchParam, searchParam, searchParam);
    countParams.push(searchParam, searchParam, searchParam);
  }
  
  // Add instructor filter if provided
  if (instructorId !== null && instructorId !== undefined) {
    conditions.push(`instructor_id = ?`);
    params.push(instructorId);
    countParams.push(instructorId);
  }
  
  // Add academic year filter if provided
  if (academicYear && academicYear.trim() !== '') {
    conditions.push(`academic_year = ?`);
    params.push(academicYear.trim());
    countParams.push(academicYear.trim());
  }
  
  // Add category filter if provided
  if (courseCategory && courseCategory.trim() !== '') {
    conditions.push(`course_category = ?`);
    params.push(courseCategory.trim());
    countParams.push(courseCategory.trim());
  }
  
  // Add WHERE clause if there are conditions
  if (conditions.length > 0) {
    const whereClause = ` WHERE ${conditions.join(' AND ')}`;
    sql += whereClause;
    countSql += whereClause;
  }
  
  // Add ORDER BY, LIMIT, and OFFSET
  sql += ` ORDER BY course_name ASC LIMIT ${limitNum} OFFSET ${offset}`;
  
  // Get total count
  const [countResult] = await db.pool.execute(countSql, countParams);
  const total = countResult[0].total;
  
  // Get courses
  const [rows] = await db.pool.execute(sql, params);
  
  return {
    courses: rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Update course information
 * 
 * @param {number} courseId - Course ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated course object
 */
async function updateCourse(courseId, updateData) {
  const allowedFields = ['course_name', 'course_code', 'description', 'weekly_hours', 'academic_year', 'course_category', 'instructor_id', 'room_number', 'semester'];
  const updates = [];
  const values = [];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(updateData[field]);
    }
  }
  
  if (updates.length === 0) {
    return findCourseById(courseId);
  }
  
  values.push(courseId);
  const sql = `
    UPDATE COURSE
    SET ${updates.join(', ')}
    WHERE course_id = ?
  `;
  
  await db.pool.execute(sql, values);
  return findCourseById(courseId);
}

/**
 * Delete a course by course_id
 * 
 * @param {number} courseId - Course ID
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
async function deleteCourse(courseId) {
  const sql = `
    DELETE FROM COURSE
    WHERE course_id = ?
  `;
  
  const [result] = await db.pool.execute(sql, [courseId]);
  return result.affectedRows > 0;
}

/**
 * Get courses by instructor_id
 * 
 * @param {number} instructorId - Instructor user ID
 * @returns {Promise<Array>} Array of course objects
 */
async function getCoursesByInstructor(instructorId) {
  const sql = `
    SELECT course_id, course_name, course_code, description, weekly_hours, academic_year, course_category, instructor_id, room_number, semester
    FROM COURSE
    WHERE instructor_id = ?
    ORDER BY course_name ASC
  `;
  
  const rows = await db.query(sql, [instructorId]);
  return rows;
}

/**
 * Validate that courses exist in the COURSE table
 * This is a helper function used by student model
 * 
 * @param {Array<number>} courseIds - Array of course IDs to validate
 * @returns {Promise<Object>} Object with isValid flag and missing course IDs
 */
async function validateCoursesExist(courseIds) {
  if (!courseIds || courseIds.length === 0) {
    return { isValid: true, missingCourseIds: [] };
  }
  
  // Build placeholders for IN clause
  const placeholders = courseIds.map(() => '?').join(',');
  const sql = `
    SELECT course_id
    FROM COURSE
    WHERE course_id IN (${placeholders})
  `;
  
  const [rows] = await db.pool.execute(sql, courseIds);
  const existingCourseIds = rows.map(row => row.course_id);
  const missingCourseIds = courseIds.filter(id => !existingCourseIds.includes(id));
  
  return {
    isValid: missingCourseIds.length === 0,
    missingCourseIds: missingCourseIds,
  };
}

module.exports = {
  createCourse,
  findCourseById,
  findCourseByCode,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getCoursesByInstructor,
  validateCoursesExist,
};

