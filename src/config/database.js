/**
 * Database Connection Module
 * 
 * Creates and exports a MySQL connection pool using mysql2/promise.
 * The pool manages multiple connections efficiently and handles reconnection.
 * 
 * Usage:
 *   const db = require('./config/database');
 *   const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
 */

const mysql = require('mysql2/promise');
const config = require('./env');

// Create connection pool
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Execute a SQL query with parameters
 * Helper function for easier query execution in models
 * 
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params || []);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Test database connection
 * Call this on server startup to verify database connectivity
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection established');
    console.log(`📊 Connected to database: ${config.db.database} on ${config.db.host}:${config.db.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   Please check your .env file and ensure MySQL is running in XAMPP');
    return false;
  }
}

module.exports = {
  pool,
  query,
  testConnection,
};

