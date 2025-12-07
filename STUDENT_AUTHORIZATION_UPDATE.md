# Student Authorization Update - Documentation

## Overview

This document describes the authorization changes made to the Student module. Instructors can now only edit and delete students they created, while admins have full access.

---

## Changes Summary

### 1. **Update Student Authorization**
   - **Before**: Any authenticated user could update any student
   - **After**: 
     - **Instructors** can only update students they created (`created_by` matches their user ID)
     - **Admins** can update any student
     - Ownership (`created_by`) cannot be changed by instructors (only admins can change it)

### 2. **Delete Student Authorization**
   - **Before**: Any authenticated user could delete any student
   - **After**:
     - **Instructors** can only delete students they created (`created_by` matches their user ID)
     - **Admins** can delete any student

---

## Authorization Rules

### Update Student (`PUT /api/students/:id`)

| User Role | Can Update Own Students | Can Update Other Students | Can Change Ownership |
|-----------|------------------------|---------------------------|---------------------|
| **Instructor** | ✅ Yes | ❌ No (403 Forbidden) | ❌ No (403 Forbidden) |
| **Admin** | ✅ Yes | ✅ Yes | ✅ Yes |

### Delete Student (`DELETE /api/students/:id`)

| User Role | Can Delete Own Students | Can Delete Other Students |
|-----------|------------------------|--------------------------|
| **Instructor** | ✅ Yes | ❌ No (403 Forbidden) |
| **Admin** | ✅ Yes | ✅ Yes |

---

## Updated Endpoints

### 1. Update Student

**Endpoint:** `PUT http://localhost:3001/api/students/:id`

**Authorization:**
- ✅ Instructors can update students they created
- ✅ Admins can update any student
- ❌ Instructors cannot update students created by others

**Request Example:**
```
PUT http://localhost:3001/api/students/1
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "surname": "Updated Surname"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "studentId": 1,
    "name": "Updated Name",
    "surname": "Updated Surname",
    ...
  }
}
```

**Error Response (403 Forbidden) - Permission Denied:**
```json
{
  "success": false,
  "message": "You do not have permission to update this student"
}
```

**Error Response (403 Forbidden) - Cannot Change Ownership:**
```json
{
  "success": false,
  "message": "You cannot change the student owner. You can only update students you created."
}
```

---

### 2. Delete Student

**Endpoint:** `DELETE http://localhost:3001/api/students/:id`

**Authorization:**
- ✅ Instructors can delete students they created
- ✅ Admins can delete any student
- ❌ Instructors cannot delete students created by others

**Request Example:**
```
DELETE http://localhost:3001/api/students/1
Authorization: Bearer <instructor_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

**Error Response (403 Forbidden) - Permission Denied:**
```json
{
  "success": false,
  "message": "You do not have permission to delete this student"
}
```

---

## Postman Testing Guide

### Prerequisites
1. Server running on `http://localhost:3001`
2. At least two users:
   - Instructor A (ID: 1) - creates Student 1
   - Instructor B (ID: 2) - tries to edit/delete Student 1
   - Admin (ID: 3) - can edit/delete any student

---

### Test Case 1: Instructor Updates Their Own Student

**Setup:**
1. Login as Instructor A (ID: 1)
2. Create a student (Student ID: 1, created_by: 1)

**Request:**
```
PUT http://localhost:3001/api/students/1
Authorization: Bearer <instructor_a_token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

**Expected Result:** ✅ `200 OK` - Student updated successfully

---

### Test Case 2: Instructor Tries to Update Another Instructor's Student

**Setup:**
1. Login as Instructor B (ID: 2)
2. Try to update Student 1 (created by Instructor A)

**Request:**
```
PUT http://localhost:3001/api/students/1
Authorization: Bearer <instructor_b_token>
Content-Type: application/json

{
  "name": "Hacked Name"
}
```

**Expected Result:** ❌ `403 Forbidden`
```json
{
  "success": false,
  "message": "You do not have permission to update this student"
}
```

---

### Test Case 3: Admin Updates Any Student

**Setup:**
1. Login as Admin
2. Update Student 1 (created by Instructor A)

**Request:**
```
PUT http://localhost:3001/api/students/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Admin Updated Name"
}
```

**Expected Result:** ✅ `200 OK` - Admin can update any student

---

### Test Case 4: Instructor Tries to Change Student Ownership

**Setup:**
1. Login as Instructor A (ID: 1)
2. Try to change `createdBy` of their own student

**Request:**
```
PUT http://localhost:3001/api/students/1
Authorization: Bearer <instructor_a_token>
Content-Type: application/json

{
  "createdBy": 2
}
```

**Expected Result:** ❌ `403 Forbidden`
```json
{
  "success": false,
  "message": "You cannot change the student owner. You can only update students you created."
}
```

---

### Test Case 5: Admin Changes Student Ownership

**Setup:**
1. Login as Admin
2. Change `createdBy` of a student

**Request:**
```
PUT http://localhost:3001/api/students/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "createdBy": 2
}
```

**Expected Result:** ✅ `200 OK` - Admin can change ownership

---

### Test Case 6: Instructor Deletes Their Own Student

**Setup:**
1. Login as Instructor A (ID: 1)
2. Delete Student 1 (created by Instructor A)

**Request:**
```
DELETE http://localhost:3001/api/students/1
Authorization: Bearer <instructor_a_token>
```

**Expected Result:** ✅ `200 OK` - Student deleted successfully

---

### Test Case 7: Instructor Tries to Delete Another Instructor's Student

**Setup:**
1. Login as Instructor B (ID: 2)
2. Try to delete Student 1 (created by Instructor A)

**Request:**
```
DELETE http://localhost:3001/api/students/1
Authorization: Bearer <instructor_b_token>
```

**Expected Result:** ❌ `403 Forbidden`
```json
{
  "success": false,
  "message": "You do not have permission to delete this student"
}
```

---

### Test Case 8: Admin Deletes Any Student

**Setup:**
1. Login as Admin
2. Delete Student 1 (created by Instructor A)

**Request:**
```
DELETE http://localhost:3001/api/students/1
Authorization: Bearer <admin_token>
```

**Expected Result:** ✅ `200 OK` - Admin can delete any student

---

## Code Changes

### Service Layer (`src/services/student.service.js`)

#### Update Student Function
```javascript
async function updateStudent(studentId, updateData, userId, userRole) {
  // ... existing code ...
  
  // Authorization check: Only admins can update any student, instructors can only update students they created
  if (userRole !== 'admin' && existingStudent.created_by !== userId) {
    const error = new Error('You do not have permission to update this student');
    error.statusCode = 403;
    throw error;
  }
  
  // Prevent changing created_by (ownership) - users cannot transfer student ownership
  if (createdBy !== undefined && createdBy !== null && createdBy !== existingStudent.created_by) {
    if (userRole !== 'admin') {
      const error = new Error('You cannot change the student owner. You can only update students you created.');
      error.statusCode = 403;
      throw error;
    }
  }
  
  // ... rest of the function ...
}
```

#### Delete Student Function
```javascript
async function deleteStudent(studentId, userId, userRole) {
  // ... existing code ...
  
  // Authorization check: Only admins can delete any student, instructors can only delete students they created
  if (userRole !== 'admin' && student.created_by !== userId) {
    const error = new Error('You do not have permission to delete this student');
    error.statusCode = 403;
    throw error;
  }
  
  // ... rest of the function ...
}
```

### Controller Layer (`src/controllers/student.controller.js`)

#### Update Student Controller
```javascript
async function updateStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.id);
    const userId = req.user.userId; // Get from authenticated user
    const userRole = req.user.role; // Get from authenticated user
    
    // ... existing code ...
    
    const result = await studentService.updateStudent(studentId, {
      // ... updateData ...
    }, userId, userRole);
    
    // ... response handling ...
  } catch (error) {
    // Handle forbidden (403) - user doesn't own the student
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    // ... other error handling ...
  }
}
```

#### Delete Student Controller
```javascript
async function deleteStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.id);
    const userId = req.user.userId; // Get from authenticated user
    const userRole = req.user.role; // Get from authenticated user
    
    // ... existing code ...
    
    const result = await studentService.deleteStudent(studentId, userId, userRole);
    
    // ... response handling ...
  } catch (error) {
    // Handle forbidden (403) - user doesn't own the student
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    // ... other error handling ...
  }
}
```

---

## Error Responses

### 403 Forbidden - Permission Denied

**When updating:**
```json
{
  "success": false,
  "message": "You do not have permission to update this student"
}
```

**When deleting:**
```json
{
  "success": false,
  "message": "You do not have permission to delete this student"
}
```

**When trying to change ownership:**
```json
{
  "success": false,
  "message": "You cannot change the student owner. You can only update students you created."
}
```

---

## Summary

### What Changed
1. ✅ Added authorization checks to `updateStudent` - instructors can only update their own students
2. ✅ Added authorization checks to `deleteStudent` - instructors can only delete their own students
3. ✅ Added ownership protection - instructors cannot change `created_by` field
4. ✅ Admins have full access to update/delete any student
5. ✅ Proper error handling with 403 Forbidden responses

### Authorization Flow
1. Extract `userId` and `userRole` from JWT token (`req.user`)
2. Check if student exists (404 if not found)
3. Check authorization:
   - If admin → allow
   - If instructor → check if `student.created_by === userId`
   - If not authorized → return 403 Forbidden
4. Proceed with update/delete operation

---

## Testing Checklist

- [ ] Instructor can update their own student
- [ ] Instructor cannot update another instructor's student (403 error)
- [ ] Admin can update any student
- [ ] Instructor cannot change student ownership (403 error)
- [ ] Admin can change student ownership
- [ ] Instructor can delete their own student
- [ ] Instructor cannot delete another instructor's student (403 error)
- [ ] Admin can delete any student
- [ ] Proper error messages are returned for unauthorized access
- [ ] All existing functionality still works

---

**Last Updated:** 2024-01-15
**Version:** 1.0.0

