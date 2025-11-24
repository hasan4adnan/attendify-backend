# Attendify Backend

Backend API for **Attendify** - A Smart Attendance System using facial recognition.

## 🚀 Quick Start

### Prerequisites

- Node.js (LTS version recommended)
- MySQL database (already created with `user` and `user_verification` tables)
- npm or yarn

### Installation

1. **Clone the repository** (if not already done)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your database credentials and JWT secret.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3001` (or the port specified in `.env`).

5. **Test the server:**
   Visit `http://localhost:3001/health` in your browser or use Postman/curl.

## 📁 Project Structure

```
attendify-backend/
├── src/
│   ├── index.js                 # Application entry point
│   ├── app.js                   # Express app configuration
│   ├── config/                  # Configuration files
│   │   ├── env.js              # Environment variables
│   │   └── database.js         # MySQL connection pool
│   ├── routes/                  # API route definitions
│   │   └── auth.routes.js      # Authentication routes
│   ├── controllers/            # Request/response handlers
│   │   └── auth.controller.js  # Auth controller functions
│   ├── services/               # Business logic layer
│   │   ├── auth.service.js     # Authentication business logic
│   │   └── verification.service.js  # Email verification logic
│   ├── models/                 # Data access layer (database queries)
│   │   ├── user.model.js       # User table queries
│   │   └── userVerification.model.js  # Verification table queries
│   ├── middleware/             # Express middleware
│   │   ├── authMiddleware.js   # JWT authentication middleware
│   │   └── errorHandler.js     # Global error handler
│   ├── validators/             # Request validation
│   │   └── auth.validator.js   # Auth endpoint validators
│   └── utils/                  # Utility functions
│       ├── jwt.js              # JWT token helpers
│       ├── hash.js             # Password/code hashing
│       ├── email.js            # Email sending (stub)
│       └── ApiError.js         # Custom error class
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🏗️ Architecture Overview

This backend follows a **layered architecture** pattern:

1. **Routes** (`src/routes/`) - Define API endpoints and HTTP methods
2. **Validators** (`src/validators/`) - Validate request data before processing
3. **Controllers** (`src/controllers/`) - Handle HTTP requests/responses
4. **Services** (`src/services/`) - Business logic and orchestration
5. **Models** (`src/models/`) - Database queries and data access
6. **Utils** (`src/utils/`) - Reusable helper functions
7. **Middleware** (`src/middleware/`) - Cross-cutting concerns (auth, errors)

### Data Flow Example (Register Endpoint)

```
Request → Route → Validator → Controller → Service → Model → Database
                                                              ↓
Response ← Route ← Controller ← Service ← Model ← Database
```

## 📝 API Endpoints

### Authentication Endpoints

- **POST** `/api/auth/register` - Register a new user
  - Body: `{ name, surname, email, password, confirmPassword, role }`
  - Returns: `{ message, userId, verificationCode }` (verificationCode is for development only)
  
- **POST** `/api/auth/verify-email` - Verify email with code
  - Body: `{ email, code }`
  - Returns: `{ success, message }`
  
- **POST** `/api/auth/login` - Login with email/password
  - Body: `{ email, password }`
  - Returns: `{ success, token, user }`

## 🗄️ Database Schema

The database is already created with these tables:

### `user` table
- `user_id` (PK, int, auto-increment)
- `name` (varchar)
- `surname` (varchar)
- `email` (varchar, unique)
- `password_hash` (varchar)
- `role` (enum/varchar: 'admin', 'instructor')
- `created_at` (datetime)

### `user_verification` table
- `verification_id` (PK, int, auto-increment)
- `user_id` (FK → user.user_id)
- `purpose` (varchar: 'signup', 'reset_password', 'mfa')
- `code_hash` (varchar - hashed verification code)
- `delivery_channel` (varchar: 'email', 'sms')
- `expires_at` (datetime)
- `consumed_at` (nullable datetime)
- `attempt_count` (int, default 0)
- `created_at` (datetime)

## 🔌 Connecting to Local MySQL (XAMPP)

This section explains how to set up and connect to MySQL using XAMPP.

### Step 1: Start XAMPP Services

1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache** (if needed for phpMyAdmin)
3. Click **Start** next to **MySQL**
4. Both services should show green "Running" status

### Step 2: Create Database and Tables

1. Open your web browser and go to: `http://localhost/phpmyadmin`
2. Click on **New** in the left sidebar to create a new database
3. Enter database name: `ATTENDIFY` (or your preferred name)
4. Select **utf8mb4_general_ci** as collation
5. Click **Create**

6. Select the `ATTENDIFY` database from the left sidebar
7. Click on the **SQL** tab
8. Run the following SQL to create the tables:

```sql
-- Create user table
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `surname` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'instructor',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create user_verification table
CREATE TABLE IF NOT EXISTS `user_verification` (
  `verification_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `purpose` VARCHAR(50) NOT NULL,
  `code_hash` VARCHAR(255) NOT NULL,
  `delivery_channel` VARCHAR(50) NOT NULL DEFAULT 'email',
  `expires_at` DATETIME NOT NULL,
  `consumed_at` DATETIME NULL DEFAULT NULL,
  `attempt_count` INT(11) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`verification_id`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set the following values:
   ```env
   PORT=3001
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=ATTENDIFY
   
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=7d
   
   VERIFICATION_CODE_TTL_MINUTES=15
   VERIFICATION_CODE_LENGTH=6
   MAX_VERIFICATION_ATTEMPTS=5
   ```

   **Important Notes:**
   - `DB_PASSWORD` is usually **empty** for XAMPP's default MySQL installation
   - If you set a MySQL password, enter it in `DB_PASSWORD`
   - `DB_NAME` should match the database name you created (e.g., `ATTENDIFY`)
   - Change `JWT_SECRET` to a strong random string in production

### Step 4: Test Database Connection

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. You should see in the console:
   ```
   ✅ Database connection established
   📊 Connected to database: ATTENDIFY on localhost:3306
   🚀 Attendify Backend server running on port 3001
   ```

4. If you see an error, check:
   - MySQL is running in XAMPP Control Panel
   - Database name in `.env` matches the one you created
   - Database credentials are correct
   - Tables were created successfully

## 🔧 How to Work with This Backend Step-by-Step

**Note:** The business logic is already implemented! You can skip to testing. The steps below are for reference if you need to modify the code.

Follow this order when implementing or modifying authentication features:

### Step 1: Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your MySQL database credentials:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
3. Set a strong `JWT_SECRET` (use a random string in production)
4. Adjust verification settings if needed (`VERIFICATION_CODE_TTL_MINUTES`, etc.)

### Step 2: Implement Database Queries (Models)

Start with the **data access layer** - implement SQL queries in model files:

1. **`src/models/user.model.js`**
   - Implement `createUser()` - INSERT query to create a user
   - Implement `findUserByEmail()` - SELECT query to find user by email
   - Implement `findUserById()` - SELECT query to find user by ID

2. **`src/models/userVerification.model.js`**
   - Implement `createVerificationCode()` - INSERT query with expiration time
   - Implement `findActiveVerificationByUserAndPurpose()` - SELECT with expiration check
   - Implement `markVerificationAsConsumed()` - UPDATE to set consumed_at
   - Implement `incrementAttemptCount()` - UPDATE to increment attempts

**What belongs here:** Pure SQL queries, no business logic.

### Step 3: Implement Utility Functions

1. **`src/utils/hash.js`**
   - Implement `hashPassword()` using `bcrypt.hash()`
   - Implement `verifyPassword()` using `bcrypt.compare()`
   - Implement `hashVerificationCode()` and `verifyVerificationCode()`

2. **`src/utils/jwt.js`**
   - Implement `generateToken()` using `jsonwebtoken.sign()`
   - Implement `verifyToken()` using `jsonwebtoken.verify()`
   - Implement `extractTokenFromHeader()` to parse "Bearer <token>"

3. **`src/utils/email.js`**
   - Implement `generateVerificationCode()` - random numeric code
   - Implement `sendVerificationCode()` - send email (use nodemailer or your email service)

**What belongs here:** Reusable helper functions, no business logic.

### Step 4: Implement Business Logic (Services)

1. **`src/services/verification.service.js`**
   - Implement `sendVerificationCode()`:
     - Get user email from database
     - Generate code, hash it, save to database
     - Send email
   - Implement `verifyCode()`:
     - Find active verification, check attempts, verify code hash
     - Mark as consumed if valid

2. **`src/services/auth.service.js`**
   - Implement `register()`:
     - Check if email exists
     - Hash password
     - Create user
     - Send verification code
   - Implement `login()`:
     - Find user, verify password
     - Generate JWT token
     - Return user and token
   - Implement `verifyEmail()`:
     - Call verification service
     - Mark user as verified (if you add verified column later)

**What belongs here:** Business rules, orchestration of models and utils, no HTTP concerns.

### Step 5: Implement Request Validation

1. **`src/validators/auth.validator.js`**
   - Implement `validateRegister` - validate name, surname, email, password, role
   - Implement `validateLogin` - validate email, password
   - Implement `validateVerifyEmail` - validate userId, code

**What belongs here:** Request data validation rules using express-validator.

### Step 6: Implement Controllers

1. **`src/controllers/auth.controller.js`**
   - Implement `register()`:
     - Extract data from `req.body`
     - Call `authService.register()`
     - Return 201 with user object
     - Handle errors (duplicate email → 409, validation → 400)
   - Implement `verifyEmail()`:
     - Extract userId and code
     - Call `authService.verifyEmail()`
     - Return 200 with success message
   - Implement `login()`:
     - Extract email and password
     - Call `authService.login()`
     - Return 200 with user and token
     - Handle errors (invalid credentials → 401)

**What belongs here:** HTTP request/response handling, status codes, error formatting.

### Step 7: Implement Middleware

1. **`src/middleware/authMiddleware.js`**
   - Extract token from Authorization header
   - Verify token, find user
   - Attach user to `req.user`
   - Return 401 if invalid

2. **`src/middleware/errorHandler.js`**
   - Format errors into consistent JSON responses
   - Handle ApiError, validation errors, JWT errors
   - Log errors in development

**What belongs here:** Cross-cutting concerns (authentication, error handling).

### Step 8: Test Endpoints

1. Use **Postman** or **curl** to test each endpoint:
   - Test `/api/auth/register` with valid data
   - Test `/api/auth/verify-email` with the code received
   - Test `/api/auth/login` with credentials
   - Test error cases (invalid data, duplicate email, etc.)

2. Verify database records are created correctly

3. Test JWT token by using it in Authorization header for protected routes

## 📚 Code Organization Guidelines

### Where to Put Code

- **Routes** (`routes/`): Only route definitions, no logic
- **Controllers** (`controllers/`): HTTP concerns (status codes, response format)
- **Services** (`services/`): Business logic, orchestration
- **Models** (`models/`): Database queries only
- **Utils** (`utils/`): Reusable helper functions
- **Validators** (`validators/`): Request validation rules
- **Middleware** (`middleware/`): Cross-cutting concerns

### Example: Adding a New Feature

If you want to add password reset:

1. Add route in `routes/auth.routes.js`: `POST /api/auth/reset-password`
2. Add validator in `validators/auth.validator.js`: `validateResetPassword`
3. Add controller in `controllers/auth.controller.js`: `resetPassword`
4. Add service in `services/auth.service.js`: `resetPassword`
5. Use existing models/utils (or extend if needed)

## 🔐 Security Notes

- Passwords are hashed using bcrypt (never store plain text)
- Verification codes are hashed before storing
- JWT tokens expire (configure in `.env`)
- Use strong `JWT_SECRET` in production
- Enable HTTPS in production
- Validate all user inputs
- Limit verification code attempts

## 🧪 Testing with Postman

This section provides step-by-step instructions for testing all authentication endpoints using Postman.

### Prerequisites

- Server is running (`npm run dev`)
- MySQL is running in XAMPP
- Database and tables are created
- Postman is installed (or use any API testing tool)

### 1. Register a New User

**Endpoint:** `POST http://localhost:3000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "name": "Hasan",
  "surname": "Adnan",
  "email": "hasan4adnan@gmail.com",
  "password": "StrongPass123!",
  "confirmPassword": "StrongPass123!",
  "role": "instructor"
}
```

**Expected Response (201 Created):**
```json
{
  "message": "User registered. Please verify your email.",
  "userId": 1,
  "verificationCode": "123456"
}
```

**What to Check:**
- ✅ Response status is `201`
- ✅ `userId` is returned
- ✅ `verificationCode` is a 6-digit number (for development - remove in production)
- ✅ In phpMyAdmin, check `user` table - new user should be created with hashed password
- ✅ In phpMyAdmin, check `user_verification` table - new verification record should exist with:
  - `user_id` matching the created user
  - `purpose` = 'signup'
  - `code_hash` is hashed (not plain text)
  - `expires_at` is set to 15 minutes from creation
  - `consumed_at` is NULL
  - `attempt_count` is 0

**Error Cases to Test:**
- Duplicate email → Should return `409 Conflict`
- Passwords don't match → Should return `400 Bad Request`
- Missing required fields → Should return `400 Bad Request` with validation errors

### 2. Verify Email

**Endpoint:** `POST http://localhost:3000/api/auth/verify-email`

**Headers:**
```
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "email": "hasan4adnan@gmail.com",
  "code": "123456"
}
```
*Use the `verificationCode` from the register response, or check the server console logs*

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Email successfully verified."
}
```

**What to Check:**
- ✅ Response status is `200`
- ✅ Success message is returned
- ✅ In phpMyAdmin, check `user_verification` table:
  - The verification record should have `consumed_at` set to current timestamp
  - `attempt_count` should remain unchanged (if code was correct on first try)

**Error Cases to Test:**
- Invalid code → Should return `400 Bad Request` with "Invalid verification code"
- Expired code → Should return `400 Bad Request` with "No active verification code found, or it has expired"
- Too many attempts → After 5 failed attempts, should return `429 Too Many Requests`
- User not found → Should return `404 Not Found`

### 3. Login

**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "email": "hasan4adnan@gmail.com",
  "password": "StrongPass123!"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Hasan",
    "surname": "Adnan",
    "email": "hasan4adnan@gmail.com",
    "role": "instructor"
  }
}
```

**What to Check:**
- ✅ Response status is `200`
- ✅ JWT `token` is returned (long string starting with `eyJ...`)
- ✅ `user` object contains user information (without password)
- ✅ Copy the `token` for use in protected routes (Authorization header)

**Error Cases to Test:**
- Invalid email → Should return `401 Unauthorized` with "Invalid credentials"
- Invalid password → Should return `401 Unauthorized` with "Invalid credentials"
- Email not verified → Should return `403 Forbidden` with "Email not verified. Please verify your email before logging in."
- Missing fields → Should return `400 Bad Request` with validation errors

### 4. Using JWT Token for Protected Routes

Once you have a token from login, you can use it to access protected routes:

**Headers:**
```
Authorization: Bearer <your_jwt_token_here>
Content-Type: application/json
```

Example:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiaGFzYW40YWRuYW5AZ21haWwuY29tIiwicm9sZSI6Imluc3RydWN0b3IiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDU2NDgwMH0...
```

### Complete Testing Flow

1. **Register** → Get `userId` and `verificationCode`
2. **Verify Email** → Use the `verificationCode` from step 1
3. **Login** → Get `token` and `user` object
4. Use the `token` in Authorization header for any protected routes

### Troubleshooting

**Database Connection Errors:**
- Ensure MySQL is running in XAMPP Control Panel
- Check `.env` file has correct database credentials
- Verify database name exists in phpMyAdmin

**Verification Code Not Working:**
- Check server console logs - code is logged there for development
- Verify code hasn't expired (default: 15 minutes)
- Check `attempt_count` hasn't exceeded max attempts (default: 5)

**Login Fails:**
- Ensure email is verified first (step 2)
- Check password matches exactly (case-sensitive)
- Verify user exists in database

## 🧪 Unit Testing (Future)

Currently, no test framework is set up. You can add:
- `jest` or `mocha` for unit tests
- `supertest` for API integration tests

## 📦 Dependencies

- **express** - Web framework
- **mysql2** - MySQL driver with promise support
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT token generation/verification
- **express-validator** - Request validation
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 🚧 Future Extensions

This structure is designed to easily extend with:
- Student management
- Course management
- Session/attendance tracking
- Facial recognition integration
- Logging and audit trails

## 📄 License

ISC

---

**Happy Coding! 🎉**
