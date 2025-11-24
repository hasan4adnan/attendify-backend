/**
 * Express Application Setup
 * 
 * Configures Express app with middleware, routes, and error handling.
 * This is the main application file that sets up all Express middleware and routes.
 * 
 * Usage:
 *   const app = require('./app');
 *   app.listen(port);
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/env');

// Import routes
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const courseRoutes = require('./routes/course.routes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Attendify API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;

