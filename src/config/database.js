/**
 * Database Connection Module
 * 
 * Creates and exports a MySQL connection pool using mysql2/promise.
 * The pool manages multiple connections efficiently and handles reconnection.
 * 
 * Usage:
 *   const db = require('./config/database');
 *   const [rows] = await db.query('SELECT * FROM USER WHERE email = ?', [email]);
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
 * Creates the database if it doesn't exist
 */
async function testConnection() {
  try {
    // Log the connection details being used (without password)
    console.log('\n📋 Database Configuration:');
    console.log(`   Host: ${config.db.host}`);
    console.log(`   Port: ${config.db.port}`);
    console.log(`   User: ${config.db.user}`);
    console.log(`   Database: ${config.db.database}`);
    console.log(`   Password: ${config.db.password ? '***' : '(empty)'}\n`);
    
    // First, try to connect without specifying a database
    // This allows us to create the database if it doesn't exist
    const tempConnection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      multipleStatements: true,
    });

    // Check if database exists, create if it doesn't
    // Query all databases and check if our target database exists
    // Use backticks for database name to handle special characters like hyphens
    const [databases] = await tempConnection.execute('SHOW DATABASES');
    
    // Filter to find our target database
    const dbExists = databases.some(db => db.Database === config.db.database);

    if (!dbExists) {
      console.log(`📦 Database '${config.db.database}' not found. Creating it...`);
      // Escape database name with backticks for special characters (like hyphens)
      const dbNameEscaped = config.db.database.replace(/`/g, '``'); // Escape backticks in name
      await tempConnection.execute(`CREATE DATABASE \`${dbNameEscaped}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✅ Database '${config.db.database}' created successfully`);
    } else {
      console.log(`✅ Database '${config.db.database}' already exists`);
    }

    await tempConnection.end();

    // Now test the actual pool connection
    const connection = await pool.getConnection();
    console.log('✅ Database connection established');
    console.log(`📊 Connected to database: ${config.db.database} on ${config.db.host}:${config.db.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your .env file exists in the project root');
    console.error('   2. Verify MySQL is running (XAMPP Control Panel)');
    console.error('   3. Ensure database credentials are correct in .env');
    console.error('   4. Check that the database user has CREATE DATABASE privileges');
    console.error('   5. Restart the server after changing .env file');
    console.error(`\n   Current config: ${config.db.user}@${config.db.host}:${config.db.port}/${config.db.database}`);
    return false;
  }
}

module.exports = {
  pool,
  query,
  testConnection,
};

