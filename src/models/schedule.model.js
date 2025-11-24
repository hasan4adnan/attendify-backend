/**
 * Schedule Model
 * 
 * Data access layer for the `COURSE_SCHEDULE` table.
 * Contains all database queries related to course schedule operations.
 * 
 * COURSE_SCHEDULE Table Structure:
 * - schedule_id (PK)
 * - course_id (FK → COURSE.course_id)
 * - day (e.g., 'Monday', 'Tuesday', etc.)
 * - start_time (TIME)
 * - end_time (TIME)
 * - created_at (DATETIME)
 * 
 * Usage:
 *   const scheduleModel = require('./models/schedule.model');
 *   const schedule = await scheduleModel.createScheduleEntry(scheduleData);
 */

const db = require('../config/database');

/**
 * Create a new schedule entry for a course
 * 
 * @param {Object} scheduleData - Schedule data object
 * @param {number} scheduleData.course_id - Course ID
 * @param {string} scheduleData.day - Day of week (e.g., 'Monday', 'Tuesday')
 * @param {string} scheduleData.start_time - Start time (HH:MM format)
 * @param {string} scheduleData.end_time - End time (HH:MM format)
 * @returns {Promise<Object>} Created schedule entry object
 */
async function createScheduleEntry(scheduleData) {
  const sql = `
    INSERT INTO COURSE_SCHEDULE (course_id, day, start_time, end_time, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;
  
  const params = [
    scheduleData.course_id,
    scheduleData.day,
    scheduleData.start_time,
    scheduleData.end_time,
  ];
  
  const [result] = await db.pool.execute(sql, params);
  
  return {
    schedule_id: result.insertId,
    course_id: scheduleData.course_id,
    day: scheduleData.day,
    start_time: scheduleData.start_time,
    end_time: scheduleData.end_time,
  };
}

/**
 * Get all schedule entries for a course
 * 
 * @param {number} courseId - Course ID
 * @returns {Promise<Array>} Array of schedule entry objects
 */
async function getScheduleByCourseId(courseId) {
  const sql = `
    SELECT schedule_id, course_id, day, start_time, end_time, created_at
    FROM COURSE_SCHEDULE
    WHERE course_id = ?
    ORDER BY 
      FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
      start_time ASC
  `;
  
  const rows = await db.query(sql, [courseId]);
  return rows;
}

/**
 * Get a schedule entry by ID
 * 
 * @param {number} scheduleId - Schedule entry ID
 * @returns {Promise<Object|null>} Schedule entry object or null if not found
 */
async function findScheduleById(scheduleId) {
  const sql = `
    SELECT schedule_id, course_id, day, start_time, end_time, created_at
    FROM COURSE_SCHEDULE
    WHERE schedule_id = ?
  `;
  
  const rows = await db.query(sql, [scheduleId]);
  return rows[0] || null;
}

/**
 * Update a schedule entry
 * 
 * @param {number} scheduleId - Schedule entry ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated schedule entry object
 */
async function updateScheduleEntry(scheduleId, updateData) {
  const allowedFields = ['day', 'start_time', 'end_time'];
  const updates = [];
  const values = [];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(updateData[field]);
    }
  }
  
  if (updates.length === 0) {
    return findScheduleById(scheduleId);
  }
  
  values.push(scheduleId);
  const sql = `
    UPDATE COURSE_SCHEDULE
    SET ${updates.join(', ')}
    WHERE schedule_id = ?
  `;
  
  await db.pool.execute(sql, values);
  return findScheduleById(scheduleId);
}

/**
 * Delete a schedule entry by ID
 * 
 * @param {number} scheduleId - Schedule entry ID
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
async function deleteScheduleEntry(scheduleId) {
  const sql = `
    DELETE FROM COURSE_SCHEDULE
    WHERE schedule_id = ?
  `;
  
  const [result] = await db.pool.execute(sql, [scheduleId]);
  return result.affectedRows > 0;
}

/**
 * Delete all schedule entries for a course
 * 
 * @param {number} courseId - Course ID
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
async function deleteScheduleByCourseId(courseId) {
  const sql = `
    DELETE FROM COURSE_SCHEDULE
    WHERE course_id = ?
  `;
  
  const [result] = await db.pool.execute(sql, [courseId]);
  return result.affectedRows > 0;
}

/**
 * Replace all schedule entries for a course
 * Deletes existing entries and creates new ones
 * 
 * @param {number} courseId - Course ID
 * @param {Array<Object>} scheduleEntries - Array of schedule entry objects
 * @returns {Promise<Array>} Array of created schedule entries
 */
async function replaceScheduleForCourse(courseId, scheduleEntries) {
  // Delete all existing schedule entries for this course
  await deleteScheduleByCourseId(courseId);
  
  // Create new schedule entries
  const createdEntries = [];
  if (scheduleEntries && scheduleEntries.length > 0) {
    for (const entry of scheduleEntries) {
      const created = await createScheduleEntry({
        course_id: courseId,
        day: entry.day,
        start_time: entry.start_time,
        end_time: entry.end_time,
      });
      createdEntries.push(created);
    }
  }
  
  return createdEntries;
}

module.exports = {
  createScheduleEntry,
  getScheduleByCourseId,
  findScheduleById,
  updateScheduleEntry,
  deleteScheduleEntry,
  deleteScheduleByCourseId,
  replaceScheduleForCourse,
};

