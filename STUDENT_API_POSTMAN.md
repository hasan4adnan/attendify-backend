# Student API - Postman Testing Guide

This document provides complete Postman testing instructions for all Student API endpoints.

## Prerequisites

1. **Server must be running**: `npm run dev`
2. **Database tables must exist**: STUDENT, COURSE, and STUDENT_COURSE tables
3. **Authentication**: Some endpoints require JWT token (obtain from `/api/auth/login`)

---

## Base URL

```
http://localhost:3001
```

---

## Authentication

Most endpoints require authentication. First, you need to:

1. **Register** a user (if not already done)
2. **Verify email** with the verification code
3. **Login** to get a JWT token

### Getting Authentication Token

#### Step 1: Register a User

**Endpoint:** `POST http://localhost:3000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "instructor@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "instructor"
}
```

**Response:**
```json
{
  "message": "User registered. Please verify your email.",
  "userId": 1,
  "verificationCode": "123456"
}
```

#### Step 2: Verify Email

**Endpoint:** `POST http://localhost:3000/api/auth/verify-email`

**Headers:**
```
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "email": "instructor@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email successfully verified."
}
```

#### Step 3: Login

**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "email": "instructor@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John",
    "surname": "Doe",
    "email": "instructor@example.com",
    "role": "instructor"
  }
}
```

**Save the `token` value** - you'll need it for all student endpoints!

---

## Student Endpoints

### 1. Create a New Student

**Endpoint:** `POST http://localhost:3000/api/students`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Request Body (JSON):**
```json
{
  "firstName": "Alice",
  "lastName": "Smith",
  "studentNumber": "STU001",
  "email": "alice.smith@example.com",
  "courseIds": [1, 2]
}
```

**Field Descriptions:**
- `firstName` (required): Student's first name (2-50 characters)
- `lastName` (required): Student's last name (2-50 characters)
- `studentNumber` (required): Unique student number (3-50 characters)
- `email` (required): Valid email address (unique)
- `courseIds` (optional): Array of course IDs to associate student with

**Success Response (201):**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "studentId": 1,
    "firstName": "Alice",
    "lastName": "Smith",
    "studentNumber": "STU001",
    "email": "alice.smith@example.com",
    "faceScanStatus": "Not Verified",
    "courses": [
      {
        "course_id": 1,
        "course_name": "Introduction to Computer Science",
        "course_code": "CS101",
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "course_id": 2,
        "course_name": "Data Structures",
        "course_code": "CS201",
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "attendance": {
      "status": "No Class Today",
      "message": "No class scheduled for today"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (409) - Duplicate Email:**
```json
{
  "success": false,
  "message": "Student with this email already exists"
}
```

**Error Response (409) - Duplicate Student Number:**
```json
{
  "success": false,
  "message": "Student with this student number already exists"
}
```

**Error Response (400) - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "First name is required",
      "path": "firstName",
      "location": "body"
    }
  ]
}
```

---

### 2. Get All Students (with Pagination and Search)

**Endpoint:** `GET http://localhost:3000/api/students`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search query - searches first name, last name, student number, and email

**Examples:**
- Get first page: `GET http://localhost:3000/api/students`
- Get second page: `GET http://localhost:3000/api/students?page=2`
- Get 20 per page: `GET http://localhost:3000/api/students?limit=20`
- Search for "Alice": `GET http://localhost:3000/api/students?search=Alice`
- Search with pagination: `GET http://localhost:3000/api/students?page=1&limit=10&search=Smith`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "studentId": 1,
      "firstName": "Alice",
      "lastName": "Smith",
      "studentNumber": "STU001",
      "email": "alice.smith@example.com",
      "faceScanStatus": "Verified",
      "courses": "CS101, CS201",
      "coursesFull": [
        {
          "course_id": 1,
          "course_name": "Introduction to Computer Science",
          "course_code": "CS101",
          "created_at": "2024-01-15T10:30:00.000Z"
        },
        {
          "course_id": 2,
          "course_name": "Data Structures",
          "course_code": "CS201",
          "created_at": "2024-01-15T10:30:00.000Z"
        }
      ],
      "attendance": {
        "status": "No Class Today",
        "message": "No class scheduled for today"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "studentId": 2,
      "firstName": "Bob",
      "lastName": "Johnson",
      "studentNumber": "STU002",
      "email": "bob.johnson@example.com",
      "faceScanStatus": "Pending",
      "courses": "No courses selected",
      "coursesFull": [],
      "attendance": {
        "status": "No Class Today",
        "message": "No class scheduled for today"
      },
      "createdAt": "2024-01-15T11:00:00.000Z"
    },
    {
      "studentId": 3,
      "firstName": "Charlie",
      "lastName": "Brown",
      "studentNumber": "STU003",
      "email": "charlie.brown@example.com",
      "faceScanStatus": "Not Verified",
      "courses": "CS101",
      "coursesFull": [
        {
          "course_id": 1,
          "course_name": "Introduction to Computer Science",
          "course_code": "CS101",
          "created_at": "2024-01-15T10:30:00.000Z"
        }
      ],
      "attendance": {
        "status": "Present",
        "message": "Attendance: Present",
        "markedAt": "2024-01-15T14:30:00.000Z",
        "sessionId": 5
      },
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

**Note:** 
- `courses` field shows course codes as comma-separated string (e.g., "CS101, CS201") for list view display
- `coursesFull` contains full course objects with all details
- `faceScanStatus` can be: "Verified", "Pending", or "Not Verified"
- `attendance.status` can be: "No Class Today", "Not Marked", "Present", "Absent", etc.

---

### 3. Get Student by ID

**Endpoint:** `GET http://localhost:3000/api/students/:id`

**URL Parameters:**
- `id`: Student ID (number)

**Example:**
```
GET http://localhost:3000/api/students/1
```

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "studentId": 1,
    "firstName": "Alice",
    "lastName": "Smith",
    "studentNumber": "STU001",
    "email": "alice.smith@example.com",
    "faceScanStatus": "Verified",
    "courses": [
      {
        "course_id": 1,
        "course_name": "Introduction to Computer Science",
        "course_code": "CS101",
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "attendance": {
      "status": "No Class Today",
      "message": "No class scheduled for today"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404) - Not Found:**
```json
{
  "success": false,
  "message": "Student not found"
}
```

**Error Response (400) - Invalid ID:**
```json
{
  "success": false,
  "message": "Invalid student ID"
}
```

---

### 4. Get Students by Instructor ID

**Endpoint:** `GET http://localhost:3001/api/students/instructor/:instructorId`

**URL Parameters:**
- `instructorId`: Instructor/User ID (number)

**Query Parameters (all optional):**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search query - searches name, surname, student number, and department

**Examples:**
- Get all students for instructor 1: `GET http://localhost:3001/api/students/instructor/1`
- Get with pagination: `GET http://localhost:3001/api/students/instructor/1?page=2&limit=20`
- Search students: `GET http://localhost:3001/api/students/instructor/1?search=Ahmet`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Authorization Rules:**
- ✅ **Admins** can view students created by **any instructor/admin ID**
- ✅ **Instructors** can view students created by **their own ID only**
- ❌ **Instructors** cannot view students created by **another instructor's ID** (returns 403 Forbidden)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "studentId": 1,
      "name": "Ahmet",
      "surname": "Yılmaz",
      "studentNumber": "1001",
      "department": "Computer Science",
      "faceEmbedding": null,
      "faceScanStatus": "Not Verified",
      "photoPath": "/uploads/photo.jpg",
      "createdBy": 1,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "courses": [
        {
          "courseId": 1,
          "courseName": "Introduction to Computer Science",
          "courseCode": "CS101"
        }
      ]
    },
    {
      "studentId": 2,
      "name": "Mehmet",
      "surname": "Demir",
      "studentNumber": "1002",
      "department": "Software Engineering",
      "faceEmbedding": "...",
      "faceScanStatus": "Verified",
      "photoPath": "/uploads/photo2.jpg",
      "createdBy": 1,
      "createdAt": "2024-01-16T10:00:00.000Z",
      "courses": []
    }
  ],
  "instructor": {
    "instructorId": 1,
    "name": "John",
    "surname": "Doe",
    "email": "john.doe@example.com",
    "role": "instructor"
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

**Error Response (400) - Invalid Instructor ID:**
```json
{
  "success": false,
  "message": "Invalid instructor ID"
}
```

**Error Response (403) - Permission Denied:**
```json
{
  "success": false,
  "message": "You do not have permission to view students for this instructor"
}
```

**Error Response (404) - Instructor Not Found:**
```json
{
  "success": false,
  "message": "Instructor not found"
}
```

**Error Response (401) - Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### 5. Update Student

**Endpoint:** `PUT http://localhost:3000/api/students/:id`

**URL Parameters:**
- `id`: Student ID (number)

**Example:**
```
PUT http://localhost:3000/api/students/1
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Request Body (JSON) - All fields are optional:**
```json
{
  "firstName": "Alice",
  "lastName": "Smith-Jones",
  "studentNumber": "STU001",
  "email": "alice.smith@example.com",
  "faceScanStatus": "Verified",
  "courseIds": [1, 2, 3]
}
```

**Field Descriptions:**
- `firstName` (optional): Student's first name
- `lastName` (optional): Student's last name
- `studentNumber` (optional): Student number
- `email` (optional): Email address
- `faceScanStatus` (optional): Face scan status - must be one of: "Verified", "Pending", "Not Verified"
- `courseIds` (optional): Array of course IDs to associate student with

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "studentId": 1,
    "firstName": "Alice",
    "lastName": "Smith-Jones",
    "studentNumber": "STU001",
    "email": "alice.smith@example.com",
    "faceScanStatus": "Verified",
    "courses": [
      {
        "course_id": 1,
        "course_name": "Introduction to Computer Science",
        "course_code": "CS101",
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "course_id": 2,
        "course_name": "Data Structures",
        "course_code": "CS201",
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "course_id": 3,
        "course_name": "Algorithms",
        "course_code": "CS301",
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "attendance": {
      "status": "Present",
      "message": "Attendance: Present",
      "markedAt": "2024-01-15T14:30:00.000Z",
      "sessionId": 5
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404) - Not Found:**
```json
{
  "success": false,
  "message": "Student not found"
}
```

**Error Response (409) - Duplicate Email/Student Number:**
```json
{
  "success": false,
  "message": "Student with this email already exists"
}
```

---

### 6. Delete Student

**Endpoint:** `DELETE http://localhost:3000/api/students/:id`

**URL Parameters:**
- `id`: Student ID (number)

**Example:**
```
DELETE http://localhost:3000/api/students/1
```

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

**Error Response (404) - Not Found:**
```json
{
  "success": false,
  "message": "Student not found"
}
```

**Error Response (400) - Invalid ID:**
```json
{
  "success": false,
  "message": "Invalid student ID"
}
```

---

## Complete Testing Flow

### Step 1: Authentication
1. Register a user (if not already done)
2. Verify email with code
3. Login to get JWT token
4. **Copy the token** from login response

### Step 2: Create Students
1. Set Authorization header: `Bearer YOUR_TOKEN`
2. Create student 1:
   ```json
   {
     "firstName": "Alice",
     "lastName": "Smith",
     "studentNumber": "STU001",
     "email": "alice@example.com",
     "courseIds": [1]
   }
   ```
3. Create student 2:
   ```json
   {
     "firstName": "Bob",
     "lastName": "Johnson",
     "studentNumber": "STU002",
     "email": "bob@example.com",
     "courseIds": [1, 2]
   }
   ```

### Step 3: Retrieve Students
1. Get all students: `GET /api/students`
2. Get student by ID: `GET /api/students/1`

### Step 4: Update Student
1. Update student 1: `PUT /api/students/1`
   ```json
   {
     "lastName": "Smith-Jones",
     "courseIds": [1, 2, 3]
   }
   ```

### Step 5: Delete Student
1. Delete student 2: `DELETE /api/students/2`

---

## Postman Collection Setup

### Environment Variables

Create a Postman environment with:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |
| `jwt_token` | (empty) | (will be set after login) |

### Pre-request Script (for authenticated endpoints)

Add this to the "Pre-request Script" tab:

```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('jwt_token')
});
```

### Tests Script (for login endpoint)

Add this to the "Tests" tab of the login request:

```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set('jwt_token', jsonData.token);
        console.log('Token saved:', jsonData.token);
    }
}
```

---

## Database Schema Requirements

Make sure these tables exist in your database:

### STUDENT Table
```sql
CREATE TABLE IF NOT EXISTS STUDENT (
  student_id INT(11) NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  student_number VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  face_scan_status VARCHAR(50) NOT NULL DEFAULT 'Not Verified',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id),
  UNIQUE KEY student_number (student_number),
  UNIQUE KEY email (email),
  KEY idx_face_scan_status (face_scan_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**face_scan_status values:**
- `Verified` - Face scan completed and verified
- `Pending` - Face scan in progress
- `Not Verified` - Face scan not completed (default)

### COURSE Table (must exist for course associations)
```sql
CREATE TABLE IF NOT EXISTS COURSE (
  course_id INT(11) NOT NULL AUTO_INCREMENT,
  course_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(50) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (course_id),
  UNIQUE KEY course_code (course_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### STUDENT_COURSE Junction Table
```sql
CREATE TABLE IF NOT EXISTS STUDENT_COURSE (
  id INT(11) NOT NULL AUTO_INCREMENT,
  student_id INT(11) NOT NULL,
  course_id INT(11) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY student_course_unique (student_id, course_id),
  KEY student_id (student_id),
  KEY course_id (course_id),
  FOREIGN KEY (student_id) REFERENCES STUDENT(student_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES COURSE(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Troubleshooting

### 401 Unauthorized
- Make sure you've logged in and have a valid JWT token
- Check that the Authorization header format is: `Bearer YOUR_TOKEN`
- Token might be expired - login again to get a new token

### 404 Not Found
- Check that the student ID exists in the database
- Verify the endpoint URL is correct

### 409 Conflict
- Email or student number already exists
- Use a different email/student number

### 500 Internal Server Error
- Check database tables exist
- Verify database connection
- Check server logs for detailed error messages

### Validation Errors
- Make sure all required fields are present
- Check field length requirements
- Verify email format is valid

---

## Example Postman Requests

### Request 1: Create Student
```
POST http://localhost:3000/api/students
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "firstName": "Alice",
  "lastName": "Smith",
  "studentNumber": "STU001",
  "email": "alice.smith@example.com",
  "courseIds": [1, 2]
}
```

### Request 2: Get All Students (with search)
```
GET http://localhost:3000/api/students?page=1&limit=10&search=Alice
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Search Examples:**
- Search by name: `?search=Smith`
- Search by student number: `?search=STU001`
- Search by email: `?search=alice@example.com`

### Request 3: Get Student by ID
```
GET http://localhost:3000/api/students/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request 4: Update Student
```
PUT http://localhost:3000/api/students/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "lastName": "Smith-Jones",
  "courseIds": [1, 2, 3]
}
```

### Request 5: Delete Student
```
DELETE http://localhost:3000/api/students/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

**Happy Testing! 🎉**

