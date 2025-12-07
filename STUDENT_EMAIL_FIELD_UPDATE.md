# Student Email Field Update - Documentation

## Overview

This document describes the addition of the `email` field to the Student module. The email field is now required when creating a student and can be updated.

---

## Changes Summary

### 1. **Email Field Added**
   - **Create Student**: `email` is now **required**
   - **Update Student**: `email` is **optional** (can be updated)
   - **All Responses**: Include `email` field
   - **Search**: Email is included in search functionality

---

## Updated Endpoints

### 1. Create Student

**Endpoint:** `POST http://localhost:3001/api/students`

**Changes:**
- `email` field is now **required** in request body
- Email is validated for proper format
- Email is stored in database and returned in response

**Request Body:**
```json
{
  "name": "Hasan",
  "surname": "Adnan",
  "email": "hasan.adnan@university.edu",
  "universityId": 1,
  "studentNumber": "1009",
  "department": "Software Engineering",
  "faceEmbedding": null,
  "photoPath": "/uploads/photo.jpg",
  "courseIds": [2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "studentId": 1,
    "name": "Hasan",
    "surname": "Adnan",
    "email": "hasan.adnan@university.edu",
    "universityId": 1,
    "studentNumber": "1009",
    "department": "Software Engineering",
    "faceEmbedding": null,
    "faceScanStatus": "Not Verified",
    "photoPath": "/uploads/photo.jpg",
    "createdBy": 1,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "courses": [...],
    "attendance": {...}
  }
}
```

**Error Response (400) - Missing Email:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Email is required",
      "path": "email",
      "location": "body"
    }
  ]
}
```

**Error Response (400) - Invalid Email Format:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Valid email is required",
      "path": "email",
      "location": "body"
    }
  ]
}
```

---

### 2. Get All Students

**Endpoint:** `GET http://localhost:3001/api/students`

**Changes:**
- Response now includes `email` for each student
- Search functionality includes email (you can search by email)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "studentId": 1,
      "name": "Hasan",
      "surname": "Adnan",
      "email": "hasan.adnan@university.edu",
      "universityId": 1,
      "studentNumber": "1009",
      "department": "Software Engineering",
      "faceScanStatus": "Not Verified",
      "courses": "CS101, CS201",
      "coursesFull": [...],
      "attendance": {...},
      "createdBy": 1,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

**Search by Email:**
```
GET http://localhost:3001/api/students?search=hasan.adnan@university.edu
```

---

### 3. Get Student by ID

**Endpoint:** `GET http://localhost:3001/api/students/:id`

**Changes:**
- Response now includes `email`

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": 1,
    "name": "Hasan",
    "surname": "Adnan",
    "email": "hasan.adnan@university.edu",
    "universityId": 1,
    "studentNumber": "1009",
    "department": "Software Engineering",
    "faceEmbedding": null,
    "faceScanStatus": "Not Verified",
    "photoPath": "/uploads/photo.jpg",
    "courses": [...],
    "attendance": {...},
    "createdBy": 1,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### 4. Update Student

**Endpoint:** `PUT http://localhost:3001/api/students/:id`

**Changes:**
- `email` field is now **optional** (can be updated)
- Email is validated for proper format if provided

**Request Body (All fields optional):**
```json
{
  "email": "updated.email@university.edu",
  "name": "Updated Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "studentId": 1,
    "name": "Updated Name",
    "surname": "Adnan",
    "email": "updated.email@university.edu",
    "universityId": 1,
    "studentNumber": "1009",
    ...
  }
}
```

**Error Response (400) - Invalid Email Format:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Valid email is required",
      "path": "email",
      "location": "body"
    }
  ]
}
```

---

### 5. Get Students by Instructor ID

**Endpoint:** `GET http://localhost:3001/api/students/instructor/:instructorId`

**Changes:**
- Response now includes `email` for each student
- Search functionality includes email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "studentId": 1,
      "name": "Hasan",
      "surname": "Adnan",
      "email": "hasan.adnan@university.edu",
      "universityId": 1,
      "studentNumber": "1009",
      "department": "Software Engineering",
      "faceScanStatus": "Not Verified",
      "photoPath": "/uploads/photo.jpg",
      "createdBy": 1,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "courses": [...]
    }
  ],
  "instructor": {...},
  "pagination": {...}
}
```

---

## Validation Rules

### Create Student
- `email`: **Required**, must be a valid email format
- Email is normalized (lowercase, trimmed)

### Update Student
- `email`: **Optional**, must be a valid email format if provided
- Email is normalized (lowercase, trimmed)

---

## Postman Testing Guide

### Prerequisites
1. Server running on `http://localhost:3001`
2. Valid JWT token (obtain from `/api/auth/login`)

---

### Test Case 1: Create Student with Email

**Request:**
```
POST http://localhost:3001/api/students
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "name": "Hasan",
  "surname": "Adnan",
  "email": "hasan.adnan@university.edu",
  "universityId": 1,
  "studentNumber": "1009",
  "department": "Software Engineering",
  "faceEmbedding": null,
  "photoPath": "/uploads/photo.jpg",
  "courseIds": [2, 3]
}
```

**Expected Response:** `201 Created`
- Student created successfully
- Response includes `email` field

---

### Test Case 2: Create Student Without Email

**Request:**
```
POST http://localhost:3001/api/students
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "name": "Hasan",
  "surname": "Adnan",
  "universityId": 1,
  "studentNumber": "1010",
  "department": "Software Engineering"
}
```

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Email is required",
      "path": "email",
      "location": "body"
    }
  ]
}
```

---

### Test Case 3: Create Student with Invalid Email

**Request:**
```
POST http://localhost:3001/api/students
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "name": "Hasan",
  "surname": "Adnan",
  "email": "invalid-email",
  "universityId": 1,
  "studentNumber": "1011",
  "department": "Software Engineering"
}
```

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Valid email is required",
      "path": "email",
      "location": "body"
    }
  ]
}
```

---

### Test Case 4: Update Student Email

**Request:**
```
PUT http://localhost:3001/api/students/1
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "email": "new.email@university.edu"
}
```

**Expected Response:** `200 OK`
- Email updated successfully
- Response includes updated `email`

---

### Test Case 5: Search Students by Email

**Request:**
```
GET http://localhost:3001/api/students?search=hasan.adnan@university.edu
Authorization: Bearer <your_jwt_token>
```

**Expected Response:** `200 OK`
- Returns students matching the email search
- All results include `email` field

---

### Test Case 6: Get All Students (Verify Email in Response)

**Request:**
```
GET http://localhost:3001/api/students
Authorization: Bearer <your_jwt_token>
```

**Expected Response:** `200 OK`
- All students include `email` field in response

---

### Test Case 7: Get Student by ID (Verify Email)

**Request:**
```
GET http://localhost:3001/api/students/1
Authorization: Bearer <your_jwt_token>
```

**Expected Response:** `200 OK`
- Student object includes `email` field

---

### Test Case 8: Get Students by Instructor (Verify Email)

**Request:**
```
GET http://localhost:3001/api/students/instructor/1
Authorization: Bearer <your_jwt_token>
```

**Expected Response:** `200 OK`
- All students include `email` field

---

## Code Changes

### Model Layer (`src/models/student.model.js`)
- ✅ Added `email` to `createStudent` INSERT statement
- ✅ Added `email` to all SELECT queries (`findStudentById`, `getAllStudents`, `getStudentsByInstructor`, `findStudentByStudentNumberAndUniversityId`)
- ✅ Added `email` to `updateStudent` allowed fields
- ✅ Updated search functionality to include email in search queries

### Service Layer (`src/services/student.service.js`)
- ✅ Added `email` parameter to `createStudent` function
- ✅ Added `email` to all response objects (create, getAll, getById, update, getByInstructor)
- ✅ Added `email` to `updateStudent` function

### Controller Layer (`src/controllers/student.controller.js`)
- ✅ Updated `createStudent` to accept `email` from request body
- ✅ Updated `updateStudent` to accept `email` from request body

### Validator Layer (`src/validators/student.validator.js`)
- ✅ Added `email` validation (required) to `validateCreateStudent`
- ✅ Added `email` validation (optional) to `validateUpdateStudent`
- ✅ Email validation includes format check and normalization

---

## Database Considerations

### Required Database Changes

If you haven't already added the `email` column to the `STUDENT` table, run this SQL:

```sql
ALTER TABLE STUDENT 
ADD COLUMN email VARCHAR(255) NULL AFTER surname;

-- Add index for better query performance (optional)
CREATE INDEX IDX_STUDENT_EMAIL ON STUDENT(email);

-- If you want email to be unique per university (similar to student_number)
-- CREATE UNIQUE INDEX IDX_STUDENT_EMAIL_UNIVERSITY ON STUDENT(university_id, email);
```

**Note:** The email field is currently nullable in the database. If you want to make it required, you can update existing records first, then:

```sql
ALTER TABLE STUDENT 
MODIFY COLUMN email VARCHAR(255) NOT NULL;
```

---

## Summary

### What Changed
1. ✅ Added `email` field to student creation (required)
2. ✅ Added `email` field to student update (optional)
3. ✅ Added `email` to all student responses
4. ✅ Added email validation (format check)
5. ✅ Added email to search functionality
6. ✅ Email is normalized (lowercase, trimmed)

### Field Details
- **Type**: String (VARCHAR(255))
- **Required**: Yes (for create), No (for update)
- **Validation**: Must be valid email format
- **Normalization**: Automatically normalized (lowercase, trimmed)
- **Search**: Included in search queries

---

## Testing Checklist

- [ ] Create student with valid email - should succeed
- [ ] Create student without email - should fail with validation error
- [ ] Create student with invalid email format - should fail with validation error
- [ ] Update student email - should succeed
- [ ] Get all students - all should include email
- [ ] Get student by ID - should include email
- [ ] Get students by instructor - all should include email
- [ ] Search by email - should return matching students
- [ ] Email is normalized in responses (lowercase)

---

**Last Updated:** 2024-01-15
**Version:** 1.0.0

