# Course Ownership Update - Implementation Summary

## Overview

Course endpoints have been updated so that users can **only view, edit, and delete courses they created**. The system uses the `instructor_id` field in the `COURSE` table to track course ownership.

---

## Changes Made

### 1. Course Creation
- **Automatic Ownership Assignment**: When a course is created, the `instructor_id` is automatically set to the authenticated user's ID
- **Location**: `src/services/course.service.js` - `createCourse()` function
- **Behavior**: The `instructorId` field in the request body is now optional and will be overridden by the authenticated user's ID

### 2. Get All Courses
- **Filtered Results**: Users only see courses where `instructor_id` matches their user ID
- **Location**: `src/services/course.service.js` - `getAllCourses()` function
- **Behavior**: The `instructorId` query parameter is ignored - users automatically see only their own courses

### 3. Get Course by ID
- **Ownership Check**: Verifies that the course's `instructor_id` matches the authenticated user's ID
- **Location**: `src/services/course.service.js` - `getCourseById()` function
- **Error**: Returns 403 Forbidden if user doesn't own the course

### 4. Update Course
- **Ownership Check**: Verifies ownership before allowing update
- **Ownership Protection**: Prevents changing `instructor_id` (course ownership cannot be transferred)
- **Location**: `src/services/course.service.js` - `updateCourse()` function
- **Error**: Returns 403 Forbidden if user doesn't own the course

### 5. Delete Course
- **Ownership Check**: Verifies ownership before allowing deletion
- **Location**: `src/services/course.service.js` - `deleteCourse()` function
- **Error**: Returns 403 Forbidden if user doesn't own the course

### 6. Enroll Students
- **Ownership Check**: Verifies ownership before allowing student enrollment
- **Location**: `src/services/course.service.js` - `enrollStudents()` function
- **Error**: Returns 403 Forbidden if user doesn't own the course

### 7. Remove Students
- **Ownership Check**: Verifies ownership before allowing student removal
- **Location**: `src/services/course.service.js` - `removeStudents()` function
- **Error**: Returns 403 Forbidden if user doesn't own the course

### 8. Get Enrolled Students
- **Ownership Check**: Verifies ownership before showing enrolled students
- **Location**: `src/services/course.service.js` - `getEnrolledStudents()` function
- **Error**: Returns 403 Forbidden if user doesn't own the course

---

## Security Features

1. **Automatic Ownership**: Courses are automatically assigned to the creator
2. **Ownership Verification**: All operations check ownership before proceeding
3. **Ownership Protection**: Course ownership cannot be transferred (instructor_id cannot be changed)
4. **Filtered Views**: Users only see courses they created

---

## Error Responses

### 403 Forbidden - Permission Denied

When a user tries to access a course they don't own:

```json
{
  "success": false,
  "message": "You do not have permission to access this course"
}
```

**Variations:**
- "You do not have permission to update this course"
- "You do not have permission to delete this course"
- "You do not have permission to enroll students in this course"
- "You do not have permission to remove students from this course"
- "You do not have permission to view students in this course"
- "You cannot change the course owner. You can only update courses you created."

---

## API Behavior Changes

### Before:
- Users could see all courses
- Users could edit/delete any course
- `instructorId` in request body was used to set course instructor

### After:
- Users can only see courses they created
- Users can only edit/delete courses they created
- `instructorId` in request body is ignored - course is automatically assigned to creator
- Course ownership cannot be changed after creation

---

## Testing Scenarios

### Scenario 1: User Creates Course
1. User A (ID: 1) creates a course
2. Course is automatically assigned `instructor_id = 1`
3. User A can view, edit, and delete this course

### Scenario 2: User Tries to Access Another User's Course
1. User A (ID: 1) creates a course (course ID: 1)
2. User B (ID: 2) tries to GET `/api/courses/1`
3. **Result**: 403 Forbidden - "You do not have permission to access this course"

### Scenario 3: User Tries to Update Another User's Course
1. User A (ID: 1) creates a course (course ID: 1)
2. User B (ID: 2) tries to PUT `/api/courses/1`
3. **Result**: 403 Forbidden - "You do not have permission to update this course"

### Scenario 4: User Tries to Change Course Owner
1. User A (ID: 1) creates a course (course ID: 1)
2. User A tries to update course with `instructorId: 2`
3. **Result**: 403 Forbidden - "You cannot change the course owner. You can only update courses you created."

### Scenario 5: Get All Courses
1. User A (ID: 1) creates 3 courses
2. User B (ID: 2) creates 2 courses
3. User A calls GET `/api/courses`
4. **Result**: Only returns User A's 3 courses

---

## Files Modified

1. **src/services/course.service.js**
   - Updated `createCourse()` - auto-assigns creator as instructor
   - Updated `getAllCourses()` - filters by user ID
   - Updated `getCourseById()` - checks ownership
   - Updated `updateCourse()` - checks ownership, prevents ownership transfer
   - Updated `deleteCourse()` - checks ownership
   - Updated `enrollStudents()` - checks ownership
   - Updated `removeStudents()` - checks ownership
   - Updated `getEnrolledStudents()` - checks ownership

2. **src/controllers/course.controller.js**
   - All functions now extract `userId` from `req.user.userId`
   - All functions pass `userId` to service methods
   - Added 403 Forbidden error handling in all endpoints

---

## Important Notes

1. **Backward Compatibility**: Existing courses will still work, but users can only access courses where `instructor_id` matches their user ID

2. **Ownership Assignment**: When creating a course, the authenticated user automatically becomes the course owner (instructor_id is set to their user ID)

3. **Ownership Immutability**: Once a course is created, the owner cannot be changed. The `instructorId` field in update requests is ignored.

4. **Query Parameters**: The `instructorId` query parameter in GET `/api/courses` is now ignored - users automatically see only their own courses

5. **Authentication Required**: All course endpoints require authentication (JWT token)

---

## Migration Notes

If you have existing courses without proper `instructor_id` values:
- You may need to update the database to set `instructor_id` for existing courses
- Users will only be able to access courses where `instructor_id` matches their user ID

---

## Example API Calls

### Create Course (Ownership Auto-Assigned)
```
POST http://localhost:3001/api/courses
Authorization: Bearer <token>
Body: {
  "courseName": "My Course",
  "courseCode": "CS101",
  "weeklyHours": 3
}
```
**Result**: Course created with `instructor_id` = authenticated user's ID

### Get All Courses (Filtered)
```
GET http://localhost:3001/api/courses
Authorization: Bearer <token>
```
**Result**: Returns only courses where `instructor_id` = authenticated user's ID

### Try to Access Another User's Course
```
GET http://localhost:3001/api/courses/5
Authorization: Bearer <token>
```
**Result**: 403 Forbidden if course belongs to another user

