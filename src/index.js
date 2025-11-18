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

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

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
