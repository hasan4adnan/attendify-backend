/**
 * Environment Configuration Module
 *
 * Loads environment variables from .env file in the project root.
 * Uses __dirname to resolve the path relative to this file location,
 * ensuring correct loading regardless of the working directory.
 *
 * Path resolution:
 *   __dirname → src/config
 *   ../.. → project root
 *   .env → project root/.env
 */

const path = require("path");
const fs = require("fs");

// Hard-resolve the .env path relative to this file's location
// This ensures correct loading regardless of where node is run from
// __dirname is: src/config/
// Going up two levels: ../../ gets us to the project root
const projectRoot = path.resolve(__dirname, "../..");
const envPath = path.resolve(projectRoot, ".env");

// Load environment variables with explicit path
// Using absolute path ensures OneDrive and other path issues are avoided
const result = require("dotenv").config({ 
  path: envPath,
  encoding: 'utf8'
});

// Enhanced error handling and logging
if (result.error) {
  // Check if file exists to provide better error message
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env file not found!");
    console.error("   Expected location:", envPath);
    console.error("   Project root:", projectRoot);
    console.error("   Current working directory:", process.cwd());
    console.error("   __dirname:", __dirname);
  } else {
    console.error("❌ Failed to load .env file!");
    console.error("   Location:", envPath);
    console.error("   Error:", result.error.message);
  }
  console.warn("⚠️  Warning: Environment variables not loaded from .env file");
  console.warn("   Using default values from code");
} else {
  console.log("✅ .env file loaded successfully");
  console.log("   Location:", envPath);
  // Only log DB_HOST if it exists to verify loading
  if (process.env.DB_HOST) {
    console.log("   DB_HOST =", process.env.DB_HOST);
  }
}

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || "development",
  },

  // Database configuration
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ATTENDIFY",
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "default_secret_key",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  // Email Verification Config
  verification: {
    codeLength: parseInt(process.env.VERIFICATION_CODE_LENGTH) || 6,
    ttlMinutes: parseInt(process.env.VERIFICATION_CODE_TTL_MINUTES) || 15,
    maxAttempts: parseInt(process.env.MAX_VERIFICATION_ATTEMPTS) || 5,
  },

  // Future Email settings
  email: {
    host: process.env.EMAIL_HOST,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    from: process.env.EMAIL_FROM,
  },
};
