/**
 * User Model
 * 
 * Data access layer for the `user` table.
 * Contains all database queries related to user operations.
 * 
 * Usage:
 *   const userModel = require('./models/user.model');
 *   const user = await userModel.findUserByEmail('user@example.com');
 */

const db = require('../config/database');

/**
 * Create a new user in the database
 * 
 * @param {Object} userData - User data object
 * @param {string} userData.name - User's first name
 * @param {string} userData.surname - User's last name
 * @param {string} userData.email - User's email (unique)
 * @param {string} userData.password_hash - Hashed password
 * @param {string} userData.role - User role (e.g., 'admin', 'instructor')
 * @param {number} userData.university_id - University ID (optional)
 * @returns {Promise<Object>} Created user object with user_id
 */
async function createUser(userData) {
  const sql = `
    INSERT INTO USER (name, surname, email, password_hash, role, university_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;
  
  const params = [
    userData.name,
    userData.surname,
    userData.email,
    userData.password_hash,
    userData.role || 'instructor',
    userData.university_id || null,
  ];
  
  const [result] = await db.pool.execute(sql, params);
  
  return {
    user_id: result.insertId,
    name: userData.name,
    surname: userData.surname,
    email: userData.email,
    role: userData.role || 'instructor',
    university_id: userData.university_id || null,
  };
}

/**
 * Find a user by email address
 * 
 * @param {string} email - User's email address
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function findUserByEmail(email) {
  const sql = `
    SELECT u.user_id, u.name, u.surname, u.email, u.password_hash, u.role, u.university_id, u.created_at,
           un.university_name
    FROM USER u
    LEFT JOIN UNIVERSITY un ON u.university_id = un.id
    WHERE u.email = ?
  `;
  
  const rows = await db.query(sql, [email]);
  return rows[0] || null;
}

/**
 * Find a user by user_id
 * 
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function findUserById(userId) {
  const sql = `
    SELECT u.user_id, u.name, u.surname, u.email, u.password_hash, u.role, u.university_id, u.created_at,
           un.university_name
    FROM USER u
    LEFT JOIN UNIVERSITY un ON u.university_id = un.id
    WHERE u.user_id = ?
  `;
  
  const rows = await db.query(sql, [userId]);
  return rows[0] || null;
}

/**
 * Update user information
 * 
 * @param {number} userId - User ID
 * @param {Object} updateData - Fields to update
 * @param {string} updateData.name - First name (optional)
 * @param {string} updateData.surname - Last name (optional)
 * @param {string} updateData.email - Email (optional)
 * @param {string} updateData.role - Role (optional)
 * @param {number} updateData.university_id - University ID (optional)
 * @param {string} updateData.password_hash - Hashed password (optional)
 * @returns {Promise<Object>} Updated user object
 */
async function updateUser(userId, updateData) {
  const allowedFields = ['name', 'surname', 'email', 'role', 'university_id', 'password_hash'];
  const updates = [];
  const values = [];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(updateData[field]);
    }
  }
  
  if (updates.length === 0) {
    return findUserById(userId);
  }
  
  values.push(userId);
  const sql = `
    UPDATE USER
    SET ${updates.join(', ')}
    WHERE user_id = ?
  `;
  
  await db.pool.execute(sql, values);
  return findUserById(userId);
}

/**
 * Find a university by ID
 * 
 * @param {number} universityId - University ID
 * @returns {Promise<Object|null>} University object or null if not found
 */
async function findUniversityById(universityId) {
  const sql = `
    SELECT id, university_name
    FROM UNIVERSITY
    WHERE id = ?
  `;
  
  const rows = await db.query(sql, [universityId]);
  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  findUniversityById,
};

