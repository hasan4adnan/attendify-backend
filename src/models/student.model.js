/**
 * Student Model
 * 
 * Data access layer for the `STUDENT` table.
 * Contains all database queries related to student operations.
 * 
 * Usage:
 *   const studentModel = require('./models/student.model');
 *   const student = await studentModel.createStudent(studentData);
 */

const db = require('../config/database');

/**
 * Create a new student in the database
 * 
 * @param {Object} studentData - Student data object
 * @param {string} studentData.name - Student's name
 * @param {string} studentData.surname - Student's surname
 * @param {string} studentData.student_number - Student number (unique)
 * @param {string} studentData.department - Department (optional)
 * @param {string} studentData.face_embedding - Face embedding data (optional)
 * @param {string} studentData.photo_path - Photo file path (optional)
 * @param {number} studentData.created_by - User ID who created this student (optional)
 * @returns {Promise<Object>} Created student object with student_id
 */
async function createStudent(studentData) {
  const sql = `
    INSERT INTO STUDENT (name, surname, student_number, department, face_embedding, photo_path, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  
  const params = [
    studentData.name,
    studentData.surname,
    studentData.student_number,
    studentData.department || null,
    studentData.face_embedding || null,
    studentData.photo_path || null,
    studentData.created_by || null,
  ];
  
  const [result] = await db.pool.execute(sql, params);
  
  return {
    student_id: result.insertId,
    name: studentData.name,
    surname: studentData.surname,
    student_number: studentData.student_number,
    department: studentData.department || null,
    face_embedding: studentData.face_embedding || null,
    photo_path: studentData.photo_path || null,
    created_by: studentData.created_by || null,
  };
}

/**
 * Find a student by student number
 * 
 * @param {string} studentNumber - Student number
 * @returns {Promise<Object|null>} Student object or null if not found
 */
async function findStudentByStudentNumber(studentNumber) {
  const sql = `
    SELECT student_id, name, surname, student_number, department, face_embedding, photo_path, created_by, created_at
    FROM STUDENT
    WHERE student_number = ?
  `;
  
  const rows = await db.query(sql, [studentNumber]);
  return rows[0] || null;
}


/**
 * Find a student by student_id
 * 
 * @param {number} studentId - Student ID
 * @returns {Promise<Object|null>} Student object or null if not found
 */
async function findStudentById(studentId) {
  const sql = `
    SELECT student_id, name, surname, student_number, department, face_embedding, photo_path, created_by, created_at
    FROM STUDENT
    WHERE student_id = ?
  `;
  
  const rows = await db.query(sql, [studentId]);
  return rows[0] || null;
}

/**
 * Get all students with pagination and search
 * 
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} search - Search query (optional) - searches name, surname, student_number, department
 * @returns {Promise<Object>} Object with students array and pagination info
 */
async function getAllStudents(page = 1, limit = 10, search = '') {
  // Ensure page and limit are integers
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;
  
  let countSql = 'SELECT COUNT(*) as total FROM STUDENT';
  let sql = `
    SELECT student_id, name, surname, student_number, department, face_embedding, photo_path, created_by, created_at
    FROM STUDENT
  `;
  const params = [];
  const countParams = [];
  
  // Add search filter if provided
  if (search && search.trim() !== '') {
    const searchParam = `%${search.trim()}%`;
    const searchCondition = ` WHERE name LIKE ? OR surname LIKE ? OR student_number LIKE ? OR department LIKE ?`;
    sql += searchCondition;
    countSql += searchCondition;
    
    params.push(searchParam, searchParam, searchParam, searchParam);
    countParams.push(searchParam, searchParam, searchParam, searchParam);
  }
  
  // Add ORDER BY, LIMIT, and OFFSET
  // Use template literals for LIMIT and OFFSET since they're safe integers
  sql += ` ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;
  
  // Get total count
  const [countResult] = await db.pool.execute(countSql, countParams);
  const total = countResult[0].total;
  
  // Get students
  const [rows] = await db.pool.execute(sql, params);
  
  return {
    students: rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Update student information
 * 
 * @param {number} studentId - Student ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated student object
 */
async function updateStudent(studentId, updateData) {
  const allowedFields = ['name', 'surname', 'student_number', 'department', 'face_embedding', 'photo_path', 'created_by'];
  const updates = [];
  const values = [];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(updateData[field]);
    }
  }
  
  if (updates.length === 0) {
    return findStudentById(studentId);
  }
  
  values.push(studentId);
  const sql = `
    UPDATE STUDENT
    SET ${updates.join(', ')}
    WHERE student_id = ?
  `;
  
  await db.pool.execute(sql, values);
  return findStudentById(studentId);
}

/**
 * Delete a student by student_id
 * 
 * @param {number} studentId - Student ID
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
async function deleteStudent(studentId) {
  const sql = `
    DELETE FROM STUDENT
    WHERE student_id = ?
  `;
  
  const [result] = await db.pool.execute(sql, [studentId]);
  return result.affectedRows > 0;
}

/**
 * Validate that courses exist in the COURSE table
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

/**
 * Add courses to a student (add/remove pattern - only adds new courses, skips existing)
 * 
 * This function efficiently adds courses to a student without removing existing ones.
 * It checks if the association already exists before inserting, preventing duplicates.
 * It also validates that all courses exist in the COURSE table before inserting.
 * 
 * @param {number} studentId - Student ID
 * @param {Array<number>} courseIds - Array of course IDs to add
 * @returns {Promise<void>}
 * @throws {Error} If any course IDs don't exist in the COURSE table
 */
async function addStudentToCourses(studentId, courseIds) {
  if (!courseIds || courseIds.length === 0) {
    return;
  }
  
  // Validate that all courses exist
  const validation = await validateCoursesExist(courseIds);
  if (!validation.isValid) {
    const error = new Error(`One or more courses do not exist: ${validation.missingCourseIds.join(', ')}`);
    error.statusCode = 404;
    error.missingCourseIds = validation.missingCourseIds;
    throw error;
  }
  
  // Get existing course associations to avoid duplicates
  const existingCourses = await getStudentCourses(studentId);
  const existingCourseIds = existingCourses.map(c => c.course_id);
  
  // Filter out courses that already exist
  const newCourseIds = courseIds.filter(courseId => !existingCourseIds.includes(courseId));
  
  if (newCourseIds.length === 0) {
    return; // All courses already exist, nothing to add
  }
  
  // Insert only new course associations
  const sql = `
    INSERT INTO STUDENT_COURSE (student_id, course_id, created_at)
    VALUES (?, ?, NOW())
  `;
  
  for (const courseId of newCourseIds) {
    await db.pool.execute(sql, [studentId, courseId]);
  }
}

/**
 * Remove courses from a student
 * 
 * @param {number} studentId - Student ID
 * @param {Array<number>} courseIds - Array of course IDs to remove
 * @returns {Promise<void>}
 */
async function removeStudentFromCourses(studentId, courseIds) {
  if (!courseIds || courseIds.length === 0) {
    return;
  }
  
  // Build placeholders for IN clause
  const placeholders = courseIds.map(() => '?').join(',');
  const sql = `
    DELETE FROM STUDENT_COURSE
    WHERE student_id = ? AND course_id IN (${placeholders})
  `;
  
  await db.pool.execute(sql, [studentId, ...courseIds]);
}

/**
 * Replace all course associations for a student (legacy function - kept for backward compatibility)
 * 
 * @param {number} studentId - Student ID
 * @param {Array<number>} courseIds - Array of course IDs (complete list to replace existing)
 * @returns {Promise<void>}
 * @throws {Error} If any course IDs don't exist in the COURSE table
 */
async function replaceStudentCourses(studentId, courseIds) {
  // Validate courses exist before removing existing associations
  if (courseIds && courseIds.length > 0) {
    const validation = await validateCoursesExist(courseIds);
    if (!validation.isValid) {
      const error = new Error(`One or more courses do not exist: ${validation.missingCourseIds.join(', ')}`);
      error.statusCode = 404;
      error.missingCourseIds = validation.missingCourseIds;
      throw error;
    }
  }
  
  // Remove all existing associations
  await db.pool.execute('DELETE FROM STUDENT_COURSE WHERE student_id = ?', [studentId]);
  
  // Insert new associations directly (no need to validate again or check for duplicates)
  if (courseIds && courseIds.length > 0) {
    const sql = `
      INSERT INTO STUDENT_COURSE (student_id, course_id, created_at)
      VALUES (?, ?, NOW())
    `;
    
    for (const courseId of courseIds) {
      await db.pool.execute(sql, [studentId, courseId]);
    }
  }
}

/**
 * Get courses for a student
 * 
 * @param {number} studentId - Student ID
 * @returns {Promise<Array>} Array of course objects
 */
async function getStudentCourses(studentId) {
  const sql = `
    SELECT c.course_id, c.course_name, c.course_code, sc.created_at
    FROM COURSE c
    INNER JOIN STUDENT_COURSE sc ON c.course_id = sc.course_id
    WHERE sc.student_id = ?
    ORDER BY c.course_name
  `;
  
  const rows = await db.query(sql, [studentId]);
  return rows;
}

/**
 * Get attendance status for a student
 * Returns "No Class Today" if no active session, or attendance info if session exists
 * 
 * @param {number} studentId - Student ID
 * @returns {Promise<Object>} Attendance status object
 */
async function getStudentAttendanceStatus(studentId) {
  // Check if there's an active session today
  const today = new Date().toISOString().split('T')[0];
  
  // Check if there's a session today (assuming SESSION table exists)
  const sessionSql = `
    SELECT session_id, session_date, course_id
    FROM SESSION
    WHERE DATE(session_date) = ?
    ORDER BY session_date DESC
    LIMIT 1
  `;
  
  try {
    const [sessions] = await db.pool.execute(sessionSql, [today]);
    
    if (sessions.length === 0) {
      return {
        status: 'No Class Today',
        message: 'No class scheduled for today',
      };
    }
    
    // Check if student has attendance record for this session
    const attendanceSql = `
      SELECT attendance_id, status, marked_at
      FROM ATTENDANCE
      WHERE student_id = ? AND session_id = ?
      LIMIT 1
    `;
    
    const [attendance] = await db.pool.execute(attendanceSql, [studentId, sessions[0].session_id]);
    
    if (attendance.length === 0) {
      return {
        status: 'Not Marked',
        message: 'Attendance not yet marked',
        sessionId: sessions[0].session_id,
      };
    }
    
    return {
      status: attendance[0].status || 'Present',
      message: `Attendance: ${attendance[0].status || 'Present'}`,
      markedAt: attendance[0].marked_at,
      sessionId: sessions[0].session_id,
    };
  } catch (error) {
    // If SESSION or ATTENDANCE tables don't exist, return default
    return {
      status: 'No Class Today',
      message: 'No class scheduled for today',
    };
  }
}

module.exports = {
  createStudent,
  findStudentByStudentNumber,
  findStudentById,
  getAllStudents,
  updateStudent,
  deleteStudent,
  validateCoursesExist,
  addStudentToCourses,
  removeStudentFromCourses,
  replaceStudentCourses,
  getStudentCourses,
  getStudentAttendanceStatus,
};

