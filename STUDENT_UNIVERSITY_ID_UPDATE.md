# Student University ID Update - Documentation

## Overview

This document describes the changes made to the Student module to support `universityId`. The student number uniqueness is now scoped by university, meaning the same student number can exist for different universities.

---

## Changes Summary

### 1. **Student Number Uniqueness Scoped by University**
   - **Before**: Student numbers were globally unique across all universities
   - **After**: Student numbers are unique **within each university**
   - Same student number (e.g., "1001") can exist in University A and University B without conflict

### 2. **Database Schema**
   - Added `university_id` column to the `STUDENT` table
   - `university_id` is a foreign key referencing the `UNIVERSITY` table

### 3. **API Changes**
   - **Create Student**: Now requires `universityId` in request body
   - **Update Student**: `universityId` is now optional (can be updated)
   - **All Responses**: Include `universityId` field

---

## Updated Endpoints

### 1. Create Student

**Endpoint:** `POST http://localhost:3001/api/students`

**Changes:**
- `universityId` is now **required** (was not present before)
- Student number uniqueness check is now scoped by `universityId`

**Request Body:**
```json
{
  "name": "Ahmet",
  "surname": "Yılmaz",
  "universityId": 1,
  "studentNumber": "1001",
  "department": "Computer Science",
  "faceEmbedding": null,
  "photoPath": "/uploads/photo.jpg",
  "courseIds": [1, 2]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "studentId": 1,
    "name": "Ahmet",
    "surname": "Yılmaz",
    "universityId": 1,
    "studentNumber": "1001",
    "department": "Computer Science",
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

**Error Response (409) - Duplicate Student Number:**
```json
{
  "success": false,
  "message": "Student with this student number in this university already exists"
}
```

---

### 2. Get All Students

**Endpoint:** `GET http://localhost:3001/api/students`

**Changes:**
- Response now includes `universityId` for each student

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "studentId": 1,
      "name": "Ahmet",
      "surname": "Yılmaz",
      "universityId": 1,
      "studentNumber": "1001",
      "department": "Computer Science",
      "faceScanStatus": "Not Verified",
      "courses": "CS101, CS201",
      "coursesFull": [...],
      "attendance": {...},
      "createdBy": 1,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 3. Get Student by ID

**Endpoint:** `GET http://localhost:3001/api/students/:id`

**Changes:**
- Response now includes `universityId`

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": 1,
    "name": "Ahmet",
    "surname": "Yılmaz",
    "universityId": 1,
    "studentNumber": "1001",
    "department": "Computer Science",
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
- `universityId` is now **optional** (can be updated)
- When updating `studentNumber`, uniqueness is checked within the current or new `universityId`
- When updating `universityId`, checks if student number conflicts in the new university

**Request Body (All fields optional):**
```json
{
  "name": "Updated Name",
  "surname": "Updated Surname",
  "universityId": 2,
  "studentNumber": "1001",
  "department": "Software Engineering"
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
    "surname": "Updated Surname",
    "universityId": 2,
    "studentNumber": "1001",
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

**Error Response (409) - Duplicate Student Number:**
```json
{
  "success": false,
  "message": "Student with this student number already exists in this university"
}
```

**Error Response (409) - Conflict in Target University:**
```json
{
  "success": false,
  "message": "Student with this student number already exists in the target university"
}
```

---

### 5. Get Students by Instructor ID

**Endpoint:** `GET http://localhost:3001/api/students/instructor/:instructorId`

**Changes:**
- Response now includes `universityId` for each student

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "studentId": 1,
      "name": "Ahmet",
      "surname": "Yılmaz",
      "universityId": 1,
      "studentNumber": "1001",
      "department": "Computer Science",
      "faceEmbedding": null,
      "faceScanStatus": "Not Verified",
      "photoPath": "/uploads/photo.jpg",
      "createdBy": 1,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "courses": [...]
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
    "total": 5,
    "totalPages": 1
  }
}
```

---

## Validation Rules

### Create Student
- `universityId`: **Required**, must be a positive integer
- `studentNumber`: **Required**, must be unique within the same `universityId`

### Update Student
- `universityId`: **Optional**, must be a positive integer if provided
- `studentNumber`: **Optional**, must be unique within the current or new `universityId`

---

## Postman Testing Guide

### Prerequisites
1. Server running on `http://localhost:3001`
2. Valid JWT token (obtain from `/api/auth/login`)
3. At least one university exists in the database

---

### Test Case 1: Create Student with University ID

**Request:**
```
POST http://localhost:3001/api/students
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "name": "Ahmet",
  "surname": "Yılmaz",
  "universityId": 1,
  "studentNumber": "1001",
  "department": "Computer Science",
  "faceEmbedding": null,
  "photoPath": "/uploads/photo.jpg",
  "courseIds": [1, 2]
}
```

**Expected Response:** `201 Created`
- Student created successfully
- `universityId` is included in response

---

### Test Case 2: Create Student with Same Number in Different University

**Request 1 (University 1):**
```json
{
  "name": "Student A",
  "surname": "Test",
  "universityId": 1,
  "studentNumber": "1001",
  "department": "CS"
}
```

**Request 2 (University 2):**
```json
{
  "name": "Student B",
  "surname": "Test",
  "universityId": 2,
  "studentNumber": "1001",
  "department": "CS"
}
```

**Expected Result:** Both requests should succeed ✅
- Same student number "1001" can exist in different universities

---

### Test Case 3: Create Duplicate Student Number in Same University

**Request 1:**
```json
{
  "name": "Student A",
  "surname": "Test",
  "universityId": 1,
  "studentNumber": "1001",
  "department": "CS"
}
```

**Request 2 (Same University):**
```json
{
  "name": "Student B",
  "surname": "Test",
  "universityId": 1,
  "studentNumber": "1001",
  "department": "CS"
}
```

**Expected Result:** 
- Request 1: `201 Created` ✅
- Request 2: `409 Conflict` ❌
- Error: "Student with this student number in this university already exists"

---

### Test Case 4: Update Student University ID

**Request:**
```
PUT http://localhost:3001/api/students/1
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "universityId": 2
}
```

**Expected Response:** `200 OK`
- Student's `universityId` updated successfully
- If student number conflicts in new university, returns `409 Conflict`

---

### Test Case 5: Update Student Number (Same University)

**Request:**
```
PUT http://localhost:3001/api/students/1
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "studentNumber": "2001"
}
```

**Expected Response:** `200 OK`
- Student number updated successfully
- Uniqueness checked within current `universityId`

---

### Test Case 6: Update Student Number and University ID

**Request:**
```
PUT http://localhost:3001/api/students/1
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "universityId": 2,
  "studentNumber": "1001"
}
```

**Expected Response:** `200 OK` or `409 Conflict`
- If "1001" doesn't exist in University 2: `200 OK` ✅
- If "1001" already exists in University 2: `409 Conflict` ❌

---

### Test Case 7: Get All Students (Verify universityId in Response)

**Request:**
```
GET http://localhost:3001/api/students
Authorization: Bearer <your_jwt_token>
```

**Expected Response:** `200 OK`
- All students include `universityId` field
- Verify `universityId` is present in each student object

---

### Test Case 8: Get Student by ID (Verify universityId)

**Request:**
```
GET http://localhost:3001/api/students/1
Authorization: Bearer <your_jwt_token>
```

**Expected Response:** `200 OK`
- Student object includes `universityId` field

---

### Test Case 9: Get Students by Instructor (Verify universityId)

**Request:**
```
GET http://localhost:3001/api/students/instructor/1
Authorization: Bearer <your_jwt_token>
```

**Expected Response:** `200 OK`
- All students include `universityId` field

---

## Error Scenarios

### 1. Missing universityId in Create
**Request:**
```json
{
  "name": "Ahmet",
  "surname": "Yılmaz",
  "studentNumber": "1001"
}
```

**Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "University ID is required",
      "path": "universityId",
      "location": "body"
    }
  ]
}
```

---

### 2. Invalid universityId Format
**Request:**
```json
{
  "name": "Ahmet",
  "surname": "Yılmaz",
  "universityId": "invalid",
  "studentNumber": "1001"
}
```

**Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "University ID must be a positive integer",
      "path": "universityId",
      "location": "body"
    }
  ]
}
```

---

### 3. Duplicate Student Number in Same University
**Request:**
```json
{
  "name": "Student B",
  "surname": "Test",
  "universityId": 1,
  "studentNumber": "1001"
}
```
(Assuming "1001" already exists in University 1)

**Response:** `409 Conflict`
```json
{
  "success": false,
  "message": "Student with this student number in this university already exists"
}
```

---

## Database Considerations

### Required Database Changes

If you haven't already added the `university_id` column to the `STUDENT` table, run this SQL:

```sql
ALTER TABLE STUDENT 
ADD COLUMN university_id BIGINT UNSIGNED NULL AFTER surname;

-- Add foreign key constraint (if UNIVERSITY table exists)
ALTER TABLE STUDENT 
ADD CONSTRAINT FK_STUDENT_UNIVERSITY 
FOREIGN KEY (university_id) 
REFERENCES UNIVERSITY(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Add index for better query performance
CREATE INDEX IDX_STUDENT_UNIVERSITY_ID ON STUDENT(university_id);

-- Create unique index for student_number + university_id combination
CREATE UNIQUE INDEX IDX_STUDENT_NUMBER_UNIVERSITY 
ON STUDENT(university_id, student_number);
```

---

## Summary of Code Changes

### Model Layer (`src/models/student.model.js`)
- ✅ Added `university_id` to `createStudent` INSERT statement
- ✅ Updated `findStudentByStudentNumberAndUniversityId` to check both `university_id` and `student_number`
- ✅ Added `university_id` to all SELECT queries (`findStudentById`, `getAllStudents`, `getStudentsByInstructor`)
- ✅ Added `university_id` to `updateStudent` allowed fields

### Service Layer (`src/services/student.service.js`)
- ✅ Updated `createStudent` to accept and validate `universityId`
- ✅ Updated uniqueness check to use `findStudentByStudentNumberAndUniversityId`
- ✅ Updated `updateStudent` to handle `universityId` changes
- ✅ Added validation for student number conflicts when changing university
- ✅ Added `universityId` to all response objects

### Controller Layer (`src/controllers/student.controller.js`)
- ✅ Updated `createStudent` to accept `universityId` from request body
- ✅ Updated `updateStudent` to accept `universityId` from request body

### Validator Layer (`src/validators/student.validator.js`)
- ✅ Added `universityId` validation (required) to `validateCreateStudent`
- ✅ Added `universityId` validation (optional) to `validateUpdateStudent`

---

## Migration Notes

### For Existing Data

If you have existing students without `university_id`:

1. **Option 1: Set Default University**
   ```sql
   UPDATE STUDENT 
   SET university_id = 1 
   WHERE university_id IS NULL;
   ```
   (Replace `1` with your default university ID)

2. **Option 2: Get university_id from Creator**
   ```sql
   UPDATE STUDENT s
   INNER JOIN USER u ON s.created_by = u.user_id
   SET s.university_id = u.university_id
   WHERE s.university_id IS NULL;
   ```

3. **Option 3: Make university_id Required**
   After setting values, make the column NOT NULL:
   ```sql
   ALTER TABLE STUDENT 
   MODIFY COLUMN university_id BIGINT UNSIGNED NOT NULL;
   ```

---

## Testing Checklist

- [ ] Create student with `universityId` - should succeed
- [ ] Create student without `universityId` - should fail with validation error
- [ ] Create two students with same number in different universities - both should succeed
- [ ] Create two students with same number in same university - second should fail
- [ ] Update student `universityId` - should succeed if no conflict
- [ ] Update student `universityId` to one with conflicting number - should fail
- [ ] Update student number in same university - should succeed if unique
- [ ] Get all students - all should include `universityId`
- [ ] Get student by ID - should include `universityId`
- [ ] Get students by instructor - all should include `universityId`

---

## Important Notes

1. **Student Number Uniqueness**: Student numbers are now unique **per university**, not globally
2. **University ID Required**: `universityId` is required when creating a student
3. **University ID Optional**: `universityId` can be updated, but must not conflict with existing student numbers in the target university
4. **Backward Compatibility**: If you have existing students, you'll need to migrate them to have `university_id` values

---

**Last Updated:** 2024-01-15
**Version:** 1.0.0

