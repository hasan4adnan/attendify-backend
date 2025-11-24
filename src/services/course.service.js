/**
 * Course Service
 * 
 * Business logic layer for course operations.
 * Orchestrates course model, schedule model, and handles business rules.
 * 
 * Usage:
 *   const courseService = require('./services/course.service');
 *   const result = await courseService.createCourse(courseData);
 */

const courseModel = require('../models/course.model');
const scheduleModel = require('../models/schedule.model');
const userModel = require('../models/user.model');
const studentModel = require('../models/student.model');

/**
 * Create a new course with schedule entries
 * 
 * @param {Object} courseData - Course data
 * @param {string} courseData.courseName - Course name
 * @param {string} courseData.courseCode - Course code (unique)
 * @param {string} courseData.description - Course description (optional)
 * @param {number} courseData.weeklyHours - Weekly hours
 * @param {string} courseData.academicYear - Academic year (optional)
 * @param {string} courseData.courseCategory - Course category (optional)
 * @param {number} courseData.instructorId - Instructor user ID (optional)
 * @param {string} courseData.roomNumber - Room number (optional)
 * @param {string} courseData.semester - Semester (optional)
 * @param {Array<Object>} courseData.schedule - Schedule entries (optional)
 * @param {Array<number>} courseData.studentIds - Student IDs to enroll (optional)
 * @returns {Promise<Object>} Created course object with schedule and enrolled students
 */
async function createCourse(courseData) {
  const { courseName, courseCode, description, weeklyHours, academicYear, courseCategory, instructorId, roomNumber, semester, schedule, studentIds } = courseData;
  
  // Check if course with course code already exists
  const existingByCode = await courseModel.findCourseByCode(courseCode);
  if (existingByCode) {
    const error = new Error('Course with this course code already exists');
    error.statusCode = 409;
    throw error;
  }
  
  // Validate instructor exists if provided
  if (instructorId) {
    const instructor = await userModel.findUserById(instructorId);
    if (!instructor) {
      const error = new Error('Instructor not found');
      error.statusCode = 404;
      throw error;
    }
    // Optionally check if user is an instructor or admin
    if (instructor.role !== 'instructor' && instructor.role !== 'admin') {
      const error = new Error('User is not an instructor');
      error.statusCode = 400;
      throw error;
    }
  }
  
  // Validate students exist BEFORE creating the course
  if (studentIds && studentIds.length > 0) {
    for (const studentId of studentIds) {
      const student = await studentModel.findStudentById(studentId);
      if (!student) {
        const error = new Error(`Student with ID ${studentId} not found`);
        error.statusCode = 404;
        throw error;
      }
    }
  }
  
  // Create course in database (only if validation passed)
  const newCourse = await courseModel.createCourse({
    course_name: courseName,
    course_code: courseCode,
    description: description || null,
    weekly_hours: weeklyHours,
    academic_year: academicYear || null,
    course_category: courseCategory || null,
    instructor_id: instructorId || null,
    room_number: roomNumber || null,
    semester: semester || null,
  });
  
  // Create schedule entries if provided
  let scheduleEntries = [];
  if (schedule && schedule.length > 0) {
    for (const entry of schedule) {
      const scheduleEntry = await scheduleModel.createScheduleEntry({
        course_id: newCourse.course_id,
        day: entry.day,
        start_time: entry.start_time,
        end_time: entry.end_time,
      });
      scheduleEntries.push(scheduleEntry);
    }
  }
  
  // Enroll students if provided (validation already passed)
  // Note: addStudentToCourses takes (studentId, courseIds), so we need to loop through students
  if (studentIds && studentIds.length > 0) {
    for (const studentId of studentIds) {
      await studentModel.addStudentToCourses(studentId, [newCourse.course_id]);
    }
  }
  
  // Fetch enrolled students
  const enrolledStudents = await getEnrolledStudents(newCourse.course_id);
  
  // Get instructor info if available
  let instructor = null;
  if (newCourse.instructor_id) {
    const instructorData = await userModel.findUserById(newCourse.instructor_id);
    if (instructorData) {
      instructor = {
        instructorId: instructorData.user_id,
        name: instructorData.name,
        surname: instructorData.surname,
        email: instructorData.email,
      };
    }
  }
  
  return {
    course: {
      courseId: newCourse.course_id,
      courseName: newCourse.course_name,
      courseCode: newCourse.course_code,
      description: newCourse.description,
      weeklyHours: newCourse.weekly_hours,
      academicYear: newCourse.academic_year,
      courseCategory: newCourse.course_category,
      instructorId: newCourse.instructor_id,
      instructor: instructor,
      roomNumber: newCourse.room_number,
      semester: newCourse.semester,
      schedule: scheduleEntries,
      enrolledStudents: enrolledStudents,
    },
  };
}

/**
 * Get all courses with pagination and optional filters
 * 
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} search - Search query (optional)
 * @param {number} instructorId - Filter by instructor (optional)
 * @param {string} academicYear - Filter by academic year (optional)
 * @param {string} courseCategory - Filter by category (optional)
 * @returns {Promise<Object>} Object with courses array and pagination info
 */
async function getAllCourses(page = 1, limit = 10, search = '', instructorId = null, academicYear = null, courseCategory = null) {
  const result = await courseModel.getAllCourses(page, limit, search, instructorId, academicYear, courseCategory);
  
  // Enrich courses with schedule and enrolled students count
  const coursesWithDetails = await Promise.all(
    result.courses.map(async (course) => {
      const schedule = await scheduleModel.getScheduleByCourseId(course.course_id);
      const enrolledStudents = await getEnrolledStudents(course.course_id);
      
      // Get instructor info if available
      let instructor = null;
      if (course.instructor_id) {
        const instructorData = await userModel.findUserById(course.instructor_id);
        if (instructorData) {
          instructor = {
            instructorId: instructorData.user_id,
            name: instructorData.name,
            surname: instructorData.surname,
            email: instructorData.email,
          };
        }
      }
      
      return {
        courseId: course.course_id,
        courseName: course.course_name,
        courseCode: course.course_code,
        description: course.description,
        weeklyHours: course.weekly_hours,
        academicYear: course.academic_year,
        courseCategory: course.course_category,
        instructorId: course.instructor_id,
        instructor: instructor,
        roomNumber: course.room_number,
        semester: course.semester,
        schedule: schedule,
        enrolledStudentsCount: enrolledStudents.length,
      };
    })
  );
  
  return {
    courses: coursesWithDetails,
    pagination: result.pagination,
  };
}

/**
 * Get a course by ID with full details
 * 
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Course object with schedule and enrolled students
 */
async function getCourseById(courseId) {
  const course = await courseModel.findCourseById(courseId);
  
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }
  
  const schedule = await scheduleModel.getScheduleByCourseId(courseId);
  const enrolledStudents = await getEnrolledStudents(courseId);
  
  // Get instructor info if available
  let instructor = null;
  if (course.instructor_id) {
    const instructorData = await userModel.findUserById(course.instructor_id);
    if (instructorData) {
      instructor = {
        instructorId: instructorData.user_id,
        name: instructorData.name,
        surname: instructorData.surname,
        email: instructorData.email,
      };
    }
  }
  
  return {
    course: {
      courseId: course.course_id,
      courseName: course.course_name,
      courseCode: course.course_code,
      description: course.description,
      weeklyHours: course.weekly_hours,
      academicYear: course.academic_year,
      courseCategory: course.course_category,
      instructorId: course.instructor_id,
      instructor: instructor,
      roomNumber: course.room_number,
      semester: course.semester,
      schedule: schedule,
      enrolledStudents: enrolledStudents,
    },
  };
}

/**
 * Update a course with schedule entries
 * 
 * @param {number} courseId - Course ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated course object
 */
async function updateCourse(courseId, updateData) {
  const { courseName, courseCode, description, weeklyHours, academicYear, courseCategory, instructorId, roomNumber, semester, schedule } = updateData;
  
  // Check if course exists
  const existingCourse = await courseModel.findCourseById(courseId);
  if (!existingCourse) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if course code is being updated and if it conflicts
  if (courseCode && courseCode !== existingCourse.course_code) {
    const existingByCode = await courseModel.findCourseByCode(courseCode);
    if (existingByCode) {
      const error = new Error('Course with this course code already exists');
      error.statusCode = 409;
      throw error;
    }
  }
  
  // Validate instructor exists if provided
  if (instructorId !== undefined && instructorId !== null) {
    const instructor = await userModel.findUserById(instructorId);
    if (!instructor) {
      const error = new Error('Instructor not found');
      error.statusCode = 404;
      throw error;
    }
    if (instructor.role !== 'instructor' && instructor.role !== 'admin') {
      const error = new Error('User is not an instructor');
      error.statusCode = 400;
      throw error;
    }
  }
  
  // Prepare update data
  const updateFields = {};
  if (courseName !== undefined) updateFields.course_name = courseName;
  if (courseCode !== undefined) updateFields.course_code = courseCode;
  if (description !== undefined) updateFields.description = description;
  if (weeklyHours !== undefined) updateFields.weekly_hours = weeklyHours;
  if (academicYear !== undefined) updateFields.academic_year = academicYear;
  if (courseCategory !== undefined) updateFields.course_category = courseCategory;
  if (instructorId !== undefined) updateFields.instructor_id = instructorId;
  if (roomNumber !== undefined) updateFields.room_number = roomNumber;
  if (semester !== undefined) updateFields.semester = semester;
  
  // Update course
  const updatedCourse = await courseModel.updateCourse(courseId, updateFields);
  
  // Update schedule if provided
  let scheduleEntries = [];
  if (schedule !== undefined) {
    if (schedule && schedule.length > 0) {
      scheduleEntries = await scheduleModel.replaceScheduleForCourse(courseId, schedule);
    } else {
      // Empty array means delete all schedule entries
      await scheduleModel.deleteScheduleByCourseId(courseId);
    }
  } else {
    // If schedule not provided, fetch existing schedule
    scheduleEntries = await scheduleModel.getScheduleByCourseId(courseId);
  }
  
  // Fetch enrolled students
  const enrolledStudents = await getEnrolledStudents(courseId);
  
  // Get instructor info if available
  let instructor = null;
  if (updatedCourse.instructor_id) {
    const instructorData = await userModel.findUserById(updatedCourse.instructor_id);
    if (instructorData) {
      instructor = {
        instructorId: instructorData.user_id,
        name: instructorData.name,
        surname: instructorData.surname,
        email: instructorData.email,
      };
    }
  }
  
  return {
    course: {
      courseId: updatedCourse.course_id,
      courseName: updatedCourse.course_name,
      courseCode: updatedCourse.course_code,
      description: updatedCourse.description,
      weeklyHours: updatedCourse.weekly_hours,
      academicYear: updatedCourse.academic_year,
      courseCategory: updatedCourse.course_category,
      instructorId: updatedCourse.instructor_id,
      instructor: instructor,
      roomNumber: updatedCourse.room_number,
      semester: updatedCourse.semester,
      schedule: scheduleEntries,
      enrolledStudents: enrolledStudents,
    },
  };
}

/**
 * Delete a course
 * 
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Success message
 */
async function deleteCourse(courseId) {
  const course = await courseModel.findCourseById(courseId);
  
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Delete schedule entries (cascade should handle this, but being explicit)
  await scheduleModel.deleteScheduleByCourseId(courseId);
  
  // Delete course (cascade will delete student enrollments)
  const deleted = await courseModel.deleteCourse(courseId);
  
  if (!deleted) {
    const error = new Error('Failed to delete course');
    error.statusCode = 500;
    throw error;
  }
  
  return { message: 'Course deleted successfully' };
}

/**
 * Get enrolled students for a course
 * 
 * @param {number} courseId - Course ID
 * @returns {Promise<Array>} Array of enrolled student objects
 */
async function getEnrolledStudents(courseId) {
  // This uses the existing STUDENT_COURSE relationship
  // We need to query students enrolled in this course
  const sql = `
    SELECT s.student_id, s.name, s.surname, s.student_number, s.department, sc.created_at
    FROM STUDENT s
    INNER JOIN STUDENT_COURSE sc ON s.student_id = sc.student_id
    WHERE sc.course_id = ?
    ORDER BY s.name, s.surname
  `;
  
  const db = require('../config/database');
  const rows = await db.query(sql, [courseId]);
  
  return rows.map(row => ({
    studentId: row.student_id,
    name: row.name,
    surname: row.surname,
    studentNumber: row.student_number,
    department: row.department,
    enrolledAt: row.created_at,
  }));
}

/**
 * Enroll students in a course
 * 
 * @param {number} courseId - Course ID
 * @param {Array<number>} studentIds - Array of student IDs to enroll
 * @returns {Promise<Object>} Success message and enrolled students
 */
async function enrollStudents(courseId, studentIds) {
  // Validate course exists
  const course = await courseModel.findCourseById(courseId);
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Validate students exist
  if (studentIds && studentIds.length > 0) {
    for (const studentId of studentIds) {
      const student = await studentModel.findStudentById(studentId);
      if (!student) {
        const error = new Error(`Student with ID ${studentId} not found`);
        error.statusCode = 404;
        throw error;
      }
    }
  }
  
  // Enroll students (validation already passed)
  // Note: addStudentToCourses takes (studentId, courseIds), so we need to loop through students
  if (studentIds && studentIds.length > 0) {
    for (const studentId of studentIds) {
      await studentModel.addStudentToCourses(studentId, [courseId]);
    }
  }
  
  const enrolledStudents = await getEnrolledStudents(courseId);
  
  return {
    message: 'Students enrolled successfully',
    enrolledStudents: enrolledStudents,
  };
}

/**
 * Remove students from a course
 * 
 * @param {number} courseId - Course ID
 * @param {Array<number>} studentIds - Array of student IDs to remove
 * @returns {Promise<Object>} Success message
 */
async function removeStudents(courseId, studentIds) {
  // Validate course exists
  const course = await courseModel.findCourseById(courseId);
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Remove students (need to call for each student)
  if (studentIds && studentIds.length > 0) {
    for (const studentId of studentIds) {
      await studentModel.removeStudentFromCourses(studentId, [courseId]);
    }
  }
  
  return { message: 'Students removed from course successfully' };
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

