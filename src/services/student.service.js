/**
 * Student Service
 * 
 * Business logic layer for student operations.
 * Orchestrates student model and handles business rules.
 * 
 * Usage:
 *   const studentService = require('./services/student.service');
 *   const result = await studentService.createStudent({ first_name, last_name, student_number, email, courseIds });
 */

const studentModel = require('../models/student.model');

/**
 * Get face scan status from face_embedding
 * If face_embedding is null, status is "Not Verified"
 * If face_embedding exists, status is "Verified"
 */
function getFaceScanStatus(faceEmbedding) {
  if (!faceEmbedding || faceEmbedding === null || faceEmbedding === '') {
    return 'Not Verified';
  }
  return 'Verified';
}

/**
 * Create a new student
 * 
 * @param {Object} studentData - Student data
 * @param {string} studentData.name - Student's name
 * @param {string} studentData.surname - Student's surname
 * @param {string} studentData.studentNumber - Student number (unique)
 * @param {string} studentData.department - Department (optional)
 * @param {string} studentData.faceEmbedding - Face embedding data (optional)
 * @param {string} studentData.photoPath - Photo file path (optional)
 * @param {number} studentData.createdBy - User ID who created this student (optional)
 * @param {Array<number>} studentData.courseIds - Array of course IDs (optional)
 * @returns {Promise<Object>} Created student object
 */
async function createStudent(studentData) {
  const { name, surname, universityId, studentNumber, department, faceEmbedding, photoPath, createdBy, courseIds } = studentData;
  
  // If universityId is not provided, get it from the creator's university
  let finalUniversityId = universityId;
  if (!finalUniversityId && createdBy) {
    const userModel = require('../models/user.model');
    const creator = await userModel.findUserById(createdBy);
    if (creator && creator.university_id) {
      finalUniversityId = creator.university_id;
    }
  }
  
  // Check if student with student number already exists in the same university
  // Only check if we have a universityId (either provided or from creator)
  if (finalUniversityId) {
    const existingByNumberAndUniversityId = await studentModel.findStudentByStudentNumberAndUniversityId(finalUniversityId, studentNumber);
    if (existingByNumberAndUniversityId) {
      const error = new Error('Student with this student number in this university already exists');
      error.statusCode = 409;
      throw error;
    }
  }
  
  // Validate courses exist BEFORE creating the student
  if (courseIds && courseIds.length > 0) {
    const validation = await studentModel.validateCoursesExist(courseIds);
    if (!validation.isValid) {
      const error = new Error(`One or more courses do not exist: ${validation.missingCourseIds.join(', ')}`);
      error.statusCode = 404;
      error.missingCourseIds = validation.missingCourseIds;
      throw error;
    }
  }
  
  // Create student in database (only if validation passed)
  const newStudent = await studentModel.createStudent({
    name: name,
    surname: surname,
    university_id: finalUniversityId || null,
    student_number: studentNumber,
    department: department || null,
    face_embedding: faceEmbedding || null,
    photo_path: photoPath || null,
    created_by: createdBy || null,
  });
  
  // Associate student with courses if provided (validation already passed)
  if (courseIds && courseIds.length > 0) {
    await studentModel.addStudentToCourses(newStudent.student_id, courseIds);
  }
  
  // Fetch student with courses
  const courses = await studentModel.getStudentCourses(newStudent.student_id);
  
  // Get attendance status
  const attendance = await studentModel.getStudentAttendanceStatus(newStudent.student_id);
  
  // Derive face scan status from face_embedding
  const faceScanStatus = getFaceScanStatus(newStudent.face_embedding);
  
  return {
    student: {
      studentId: newStudent.student_id,
      name: newStudent.name,
      surname: newStudent.surname,
      universityId: newStudent.university_id,
      studentNumber: newStudent.student_number,
      department: newStudent.department,
      faceEmbedding: newStudent.face_embedding,
      photoPath: newStudent.photo_path,
      faceScanStatus: faceScanStatus,
      courses: courses,
      attendance: attendance,
      createdBy: newStudent.created_by,
      createdAt: newStudent.created_at,
    },
  };
}

/**
 * Get all students with pagination and search
 * 
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} search - Search query (optional) - searches first_name, last_name, student_number, email
 * @returns {Promise<Object>} Object with students array and pagination info
 */
async function getAllStudents(page = 1, limit = 10, search = '') {
  const result = await studentModel.getAllStudents(page, limit, search);
  
  // Get courses and attendance for each student
  const studentsWithDetails = await Promise.all(
    result.students.map(async (student) => {
      const courses = await studentModel.getStudentCourses(student.student_id);
      const attendance = await studentModel.getStudentAttendanceStatus(student.student_id);
      
      // Format courses to show course codes in list view
      const courseCodes = courses.map(c => c.course_code).join(', ') || 'No courses selected';
      
      // Derive face scan status from face_embedding
      const faceScanStatus = getFaceScanStatus(student.face_embedding);
      
      return {
        studentId: student.student_id,
        name: student.name,
        surname: student.surname,
        universityId: student.university_id,
        studentNumber: student.student_number,
        department: student.department,
        faceEmbedding: student.face_embedding,
        photoPath: student.photo_path,
        faceScanStatus: faceScanStatus,
        courses: courseCodes, // Show course codes as comma-separated string for list view
        coursesFull: courses, // Keep full course objects for detailed view
        attendance: attendance,
        createdBy: student.created_by,
        createdAt: student.created_at,
      };
    })
  );
  
  return {
    students: studentsWithDetails,
    pagination: result.pagination,
  };
}

/**
 * Get a student by ID
 * 
 * @param {number} studentId - Student ID
 * @returns {Promise<Object>} Student object with courses
 */
async function getStudentById(studentId) {
  const student = await studentModel.findStudentById(studentId);
  
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }
  
  const courses = await studentModel.getStudentCourses(studentId);
  const attendance = await studentModel.getStudentAttendanceStatus(studentId);
  
  // Derive face scan status from face_embedding
  const faceScanStatus = getFaceScanStatus(student.face_embedding);
  
  return {
    student: {
      studentId: student.student_id,
      name: student.name,
      surname: student.surname,
      universityId: student.university_id,
      studentNumber: student.student_number,
      department: student.department,
      faceEmbedding: student.face_embedding,
      photoPath: student.photo_path,
      faceScanStatus: faceScanStatus,
      courses: courses,
      attendance: attendance,
      createdBy: student.created_by,
      createdAt: student.created_at,
    },
  };
}

/**
 * Update a student
 * 
 * @param {number} studentId - Student ID
 * @param {Object} updateData - Fields to update
 * @param {string} updateData.firstName - First name (optional)
 * @param {string} updateData.lastName - Last name (optional)
 * @param {string} updateData.studentNumber - Student number (optional)
 * @param {string} updateData.email - Email (optional)
 * @param {Array<number>} updateData.courseIds - Course IDs (optional)
 * @param {number} userId - Authenticated user ID (required - checks ownership)
 * @param {string} userRole - Authenticated user role (required - for authorization)
 * @returns {Promise<Object>} Updated student object
 */
async function updateStudent(studentId, updateData, userId, userRole) {
  const { name, surname, universityId, studentNumber, department, faceEmbedding, photoPath, createdBy, courseIds } = updateData;
  
  // Check if student exists
  const existingStudent = await studentModel.findStudentById(studentId);
  if (!existingStudent) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Authorization check: Only admins can update any student, instructors can only update students they created
  if (userRole !== 'admin' && existingStudent.created_by !== userId) {
    const error = new Error('You do not have permission to update this student');
    error.statusCode = 403;
    throw error;
  }
  
  // Prevent changing created_by (ownership) - users cannot transfer student ownership
  if (createdBy !== undefined && createdBy !== null && createdBy !== existingStudent.created_by) {
    if (userRole !== 'admin') {
      const error = new Error('You cannot change the student owner. You can only update students you created.');
      error.statusCode = 403;
      throw error;
    }
    // Admins can change ownership, but we still validate it
  }
  
  // Determine which university_id to use for uniqueness check
  // If universityId is being updated, use the new one; otherwise use existing
  const universityIdForCheck = universityId !== undefined ? universityId : existingStudent.university_id;
  
  // Check if student number is being updated and if it conflicts within the same university
  // Only check if we have a universityId to check against
  if (studentNumber && studentNumber !== existingStudent.student_number && universityIdForCheck) {
    const existingByNumber = await studentModel.findStudentByStudentNumberAndUniversityId(universityIdForCheck, studentNumber);
    if (existingByNumber) {
      const error = new Error('Student with this student number already exists in this university');
      error.statusCode = 409;
      throw error;
    }
  }
  
  // If universityId is being changed, check if student number conflicts in the new university
  if (universityId !== undefined && universityId !== existingStudent.university_id && studentNumber === existingStudent.student_number && universityId) {
    const existingByNumber = await studentModel.findStudentByStudentNumberAndUniversityId(universityId, studentNumber);
    if (existingByNumber) {
      const error = new Error('Student with this student number already exists in the target university');
      error.statusCode = 409;
      throw error;
    }
  }
  
  // Validate courses exist BEFORE updating the student (if courses are being updated)
  if (courseIds !== undefined && courseIds.length > 0) {
    const validation = await studentModel.validateCoursesExist(courseIds);
    if (!validation.isValid) {
      const error = new Error(`One or more courses do not exist: ${validation.missingCourseIds.join(', ')}`);
      error.statusCode = 404;
      error.missingCourseIds = validation.missingCourseIds;
      throw error;
    }
  }
  
  // Prepare update data
  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (surname !== undefined) updateFields.surname = surname;
  if (universityId !== undefined) updateFields.university_id = universityId;
  if (studentNumber !== undefined) updateFields.student_number = studentNumber;
  if (department !== undefined) updateFields.department = department;
  if (faceEmbedding !== undefined) updateFields.face_embedding = faceEmbedding;
  if (photoPath !== undefined) updateFields.photo_path = photoPath;
  if (createdBy !== undefined) updateFields.created_by = createdBy;
  
  // Update student (only if validation passed)
  const updatedStudent = await studentModel.updateStudent(studentId, updateFields);
  
  // Update course associations if provided (validation already passed)
  if (courseIds !== undefined) {
    await studentModel.replaceStudentCourses(studentId, courseIds);
  }
  
  // Fetch updated student with courses
  const courses = await studentModel.getStudentCourses(studentId);
  const attendance = await studentModel.getStudentAttendanceStatus(studentId);
  
  // Derive face scan status from face_embedding
  const faceScanStatus = getFaceScanStatus(updatedStudent.face_embedding);
  
  return {
    student: {
      studentId: updatedStudent.student_id,
      name: updatedStudent.name,
      surname: updatedStudent.surname,
      universityId: updatedStudent.university_id,
      studentNumber: updatedStudent.student_number,
      department: updatedStudent.department,
      faceEmbedding: updatedStudent.face_embedding,
      photoPath: updatedStudent.photo_path,
      faceScanStatus: faceScanStatus,
      courses: courses,
      attendance: attendance,
      createdBy: updatedStudent.created_by,
      createdAt: updatedStudent.created_at,
    },
  };
}

/**
 * Delete a student
 * 
 * @param {number} studentId - Student ID
 * @param {number} userId - Authenticated user ID (required - checks ownership)
 * @param {string} userRole - Authenticated user role (required - for authorization)
 * @returns {Promise<Object>} Success message
 */
async function deleteStudent(studentId, userId, userRole) {
  const student = await studentModel.findStudentById(studentId);
  
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Authorization check: Only admins can delete any student, instructors can only delete students they created
  if (userRole !== 'admin' && student.created_by !== userId) {
    const error = new Error('You do not have permission to delete this student');
    error.statusCode = 403;
    throw error;
  }
  
  const deleted = await studentModel.deleteStudent(studentId);
  
  if (!deleted) {
    const error = new Error('Failed to delete student');
    error.statusCode = 500;
    throw error;
  }
  
  return { message: 'Student deleted successfully' };
}

/**
 * Get students created by a specific instructor
 * 
 * @param {number} instructorId - Instructor/User ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} search - Search query (optional)
 * @param {number} requestingUserId - Authenticated user ID (for authorization check)
 * @param {string} requestingUserRole - Authenticated user role (for authorization check)
 * @returns {Promise<Object>} Object with students array and pagination info
 */
async function getStudentsByInstructor(instructorId, page = 1, limit = 10, search = '', requestingUserId = null, requestingUserRole = null) {
  // Authorization check: Only admins can view students by any instructor
  // Instructors can only view students they created
  if (requestingUserRole !== 'admin' && requestingUserId !== instructorId) {
    const error = new Error('You do not have permission to view students for this instructor');
    error.statusCode = 403;
    throw error;
  }
  
  // Validate instructor exists
  const userModel = require('../models/user.model');
  const instructor = await userModel.findUserById(instructorId);
  if (!instructor) {
    const error = new Error('Instructor not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Get students by instructor ID
  const result = await studentModel.getStudentsByInstructor(instructorId, page, limit, search);
  
  // Enrich students with courses and face scan status
  const studentsWithDetails = await Promise.all(
    result.students.map(async (student) => {
      const courses = await studentModel.getStudentCourses(student.student_id);
      const faceScanStatus = getFaceScanStatus(student.face_embedding);
      
      return {
        studentId: student.student_id,
        name: student.name,
        surname: student.surname,
        universityId: student.university_id,
        studentNumber: student.student_number,
        department: student.department,
        faceEmbedding: student.face_embedding,
        faceScanStatus: faceScanStatus,
        photoPath: student.photo_path,
        createdBy: student.created_by,
        createdAt: student.created_at,
        courses: courses.map(course => ({
          courseId: course.course_id,
          courseName: course.course_name,
          courseCode: course.course_code,
        })),
      };
    })
  );
  
  return {
    students: studentsWithDetails,
    pagination: result.pagination,
    instructor: {
      instructorId: instructor.user_id,
      name: instructor.name,
      surname: instructor.surname,
      email: instructor.email,
      role: instructor.role,
    },
  };
}

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentsByInstructor,
  updateStudent,
  deleteStudent,
};

