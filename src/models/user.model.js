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
 * @returns {Promise<Object>} Created user object with user_id
 */
async function createUser(userData) {
  const sql = `
    INSERT INTO user (name, surname, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
  
  const params = [
    userData.name,
    userData.surname,
    userData.email,
    userData.password_hash,
    userData.role || 'instructor',
  ];
  
  const [result] = await db.pool.execute(sql, params);
  
  return {
    user_id: result.insertId,
    name: userData.name,
    surname: userData.surname,
    email: userData.email,
    role: userData.role || 'instructor',
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
    SELECT user_id, name, surname, email, password_hash, role, created_at
    FROM user
    WHERE email = ?
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
    SELECT user_id, name, surname, email, password_hash, role, created_at
    FROM user
    WHERE user_id = ?
  `;
  
  const rows = await db.query(sql, [userId]);
  return rows[0] || null;
}

/**
 * Update user information (for future use)
 * 
 * @param {number} userId - User ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated user object
 */
async function updateUser(userId, updateData) {
  // Placeholder for future implementation
  throw new Error('updateUser not implemented');
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
};

