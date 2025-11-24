/**
 * Application Entry Point
 * 
 * Starts the Express server and initializes database connection.
 * This is the main entry point that gets executed when you run: npm start or npm run dev
 */

const app = require('./app');
const config = require('./config/env');
const db = require('./config/database');

// Start server
const PORT = config.server.port;

/**
 * Validate email configuration
 */
function validateEmailConfig() {
  const emailConfig = config.email;
  const required = ['host', 'user', 'password', 'from'];
  const missing = required.filter(key => !emailConfig[key]);
  
  if (missing.length > 0) {
    console.warn('\n⚠️  Email configuration is incomplete:');
    missing.forEach(key => {
      console.warn(`   - EMAIL_${key.toUpperCase()} is not set`);
    });
    console.warn('   Email sending will be disabled until configured.');
    console.warn('   See EMAIL_SETUP_GUIDE.md for setup instructions.\n');
    return false;
  }
  
  // Mask password for display
  const maskedPassword = emailConfig.password.length > 4 ? 
    emailConfig.password.substring(0, 2) + '***' + emailConfig.password.substring(emailConfig.password.length - 2) : 
    '***';
  
  console.log('\n📧 Email Configuration:');
  console.log(`   Host: ${emailConfig.host}`);
  console.log(`   User: ${emailConfig.user}`);
  console.log(`   Password: ${maskedPassword}`);
  console.log(`   Port: ${emailConfig.port}`);
  console.log(`   From: ${emailConfig.from}`);
  console.log('   Status: ✅ Configured\n');
  
  return true;
}

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Validate email configuration
    validateEmailConfig();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Attendify Backend server running on port ${PORT}`);
      console.log(`📝 Environment: ${config.server.env}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
