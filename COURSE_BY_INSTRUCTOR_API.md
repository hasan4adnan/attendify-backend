# Complete Course API - Postman Testing Guide

## Base URL
```
http://localhost:3001
```

## Authentication
All course endpoints require authentication. Include the JWT token in the Authorization header:

**Header:**
```
Authorization: Bearer <your_jwt_token_here>
Content-Type: application/json
```

**To get a token:**
1. Register: `POST http://localhost:3001/api/auth/register`
2. Verify email: `POST http://localhost:3001/api/auth/verify-email`
3. Login: `POST http://localhost:3001/api/auth/login` (returns token)

---

## Important: Course Ownership Model

**All courses are owned by the user who creates them:**
- When creating a course, the `instructor_id` is **automatically set** to the authenticated user's ID
- The `instructorId` field in the request body is **ignored** - you cannot create courses for other users
- Users can only **view, edit, and delete** courses they created
- **Admins** can view courses by any instructor using the `/instructor/:instructorId` endpoint
- **Instructors** can only view their own courses

## Important: Course Code Uniqueness

**Course codes are unique per university:**
- The same course code (e.g., "CS101") can exist for different universities
- Course code uniqueness is determined by the instructor's `university_id`
- When creating or updating a course, the system checks for duplicate course codes **within the same university only**
- This allows different universities to use the same course codes independently
- Example: University A can have "CS101" and University B can also have "CS101" - they won't conflict

---

## 1. Create Course

**Method:** `POST`  
**Full URL:** `http://localhost:3001/api/courses`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "courseName": "Introduction to Computer Science",
  "courseCode": "CS101",
  "description": "Fundamental concepts of computer science and programming",
  "weeklyHours": 3,
  "academicYear": "2024-2025",
  "courseCategory": "Core",
  "roomNumber": "A101",
  "semester": "Fall",
  "schedule": [
    {
      "day": "Monday",
      "start_time": "09:00",
      "end_time": "11:00"
    },
    {
      "day": "Wednesday",
      "start_time": "09:00",
      "end_time": "11:00"
    }
  ],
  "studentIds": [1, 2, 3]
}
```

**Note:** The `instructorId` field is **ignored** - the course is automatically assigned to the authenticated user.

**Minimal Request Body (Required fields only):**
```json
{
  "courseName": "Introduction to Computer Science",
  "courseCode": "CS101",
  "weeklyHours": 3
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "courseId": 1,
    "courseName": "Introduction to Computer Science",
    "courseCode": "CS101",
    "description": "Fundamental concepts of computer science and programming",
    "weeklyHours": 3,
    "academicYear": "2024-2025",
    "courseCategory": "Core",
    "instructorId": 1,
    "instructor": {
      "instructorId": 1,
      "name": "John",
      "surname": "Doe",
      "email": "john.doe@example.com"
    },
    "roomNumber": "A101",
    "semester": "Fall",
    "schedule": [
      {
        "schedule_id": 1,
        "course_id": 1,
        "day": "Monday",
        "start_time": "09:00",
        "end_time": "11:00"
      }
    ],
    "enrolledStudents": []
  }
}
```

**Error Responses:**
- **400 Bad Request** - Validation errors
- **409 Conflict** - Course code already exists for your university (same code can exist for different universities)
- **404 Not Found** - Student not found
- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - User is not an instructor or admin

---

## 2. Get All Courses (Authenticated User's Courses Only)

**Method:** `GET`  
**Full URL:** `http://localhost:3001/api/courses`

**Query Parameters (all optional):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in course name, code, or description
- `academicYear` - Filter by academic year
- `courseCategory` - Filter by category

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Example URLs:**
- `http://localhost:3001/api/courses`
- `http://localhost:3001/api/courses?page=2&limit=20`
- `http://localhost:3001/api/courses?search=Computer`
- `http://localhost:3001/api/courses?academicYear=2024-2025&courseCategory=Core`

**Note:** This endpoint returns **only courses created by the authenticated user**.

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "courseId": 1,
      "courseName": "Introduction to Computer Science",
      "courseCode": "CS101",
      "description": "Fundamental concepts...",
      "weeklyHours": 3,
      "academicYear": "2024-2025",
      "courseCategory": "Core",
      "instructorId": 1,
      "instructor": {
        "instructorId": 1,
        "name": "John",
        "surname": "Doe",
        "email": "john.doe@example.com"
      },
      "roomNumber": "A101",
      "semester": "Fall",
      "schedule": [...],
      "enrolledStudentsCount": 25
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

**Error Responses:**
- **401 Unauthorized** - Missing or invalid token

---

## 3. Get Courses by Instructor ID

**Method:** `GET`  
**Full URL:** `http://localhost:3001/api/courses/instructor/:instructorId`

**Example URLs:**
- `http://localhost:3001/api/courses/instructor/1`
- `http://localhost:3001/api/courses/instructor/1?page=1&limit=10`
- `http://localhost:3001/api/courses/instructor/1?search=Computer&page=1&limit=20`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters (all optional):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in course name, code, or description
- `academicYear` - Filter by academic year
- `courseCategory` - Filter by category

**Authorization Rules:**
- ✅ **Admins** can view courses by **any instructor/admin ID**
- ✅ **Instructors** can view courses by **their own ID only**
- ❌ **Instructors** cannot view courses by **another instructor's ID** (returns 403 Forbidden)

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "courseId": 1,
      "courseName": "Introduction to Computer Science",
      "courseCode": "CS101",
      "description": "Fundamental concepts of computer science",
      "weeklyHours": 3,
      "academicYear": "2024-2025",
      "courseCategory": "Core",
      "instructorId": 1,
      "instructor": {
        "instructorId": 1,
        "name": "John",
        "surname": "Doe",
        "email": "john.doe@example.com"
      },
      "roomNumber": "A101",
      "semester": "Fall",
      "schedule": [...],
      "enrolledStudentsCount": 25
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

**Error Responses:**
- **400 Bad Request** - Invalid instructor ID
- **403 Forbidden** - Permission denied (instructor trying to view another instructor's courses)
- **404 Not Found** - Instructor not found
- **401 Unauthorized** - Missing or invalid token

---

## 4. Get Course by ID

**Method:** `GET`  
**Full URL:** `http://localhost:3001/api/courses/:id`

**Example:** `http://localhost:3001/api/courses/1`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Authorization:** Users can only view courses they created.

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courseId": 1,
    "courseName": "Introduction to Computer Science",
    "courseCode": "CS101",
    "description": "Fundamental concepts...",
    "weeklyHours": 3,
    "academicYear": "2024-2025",
    "courseCategory": "Core",
    "instructorId": 1,
    "instructor": {
      "instructorId": 1,
      "name": "John",
      "surname": "Doe",
      "email": "john.doe@example.com"
    },
    "roomNumber": "A101",
    "semester": "Fall",
    "schedule": [
      {
        "schedule_id": 1,
        "course_id": 1,
        "day": "Monday",
        "start_time": "09:00",
        "end_time": "11:00"
      }
    ],
    "enrolledStudents": [
      {
        "studentId": 1,
        "name": "Alice",
        "surname": "Smith",
        "studentNumber": "1001",
        "department": "Computer Science",
        "enrolledAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- **404 Not Found** - Course not found
- **403 Forbidden** - You do not have permission to access this course
- **400 Bad Request** - Invalid course ID format
- **401 Unauthorized** - Missing or invalid token

---

## 5. Update Course

**Method:** `PUT`  
**Full URL:** `http://localhost:3001/api/courses/:id`

**Example:** `http://localhost:3001/api/courses/1`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Authorization:** Users can only update courses they created. The `instructorId` field cannot be changed (ownership is fixed).

**Request Body (JSON) - All fields are optional:**
```json
{
  "courseName": "Advanced Computer Science",
  "courseCode": "CS201",
  "description": "Advanced programming concepts and algorithms",
  "weeklyHours": 4,
  "academicYear": "2024-2025",
  "courseCategory": "Advanced",
  "roomNumber": "B205",
  "semester": "Spring",
  "schedule": [
    {
      "day": "Tuesday",
      "start_time": "14:00",
      "end_time": "16:00"
    }
  ]
}
```

**Note:** The `instructorId` field is **ignored** - you cannot change course ownership.

**Partial Update Example:**
```json
{
  "courseName": "Updated Course Name",
  "weeklyHours": 4
}
```

**To remove all schedule entries:**
```json
{
  "schedule": []
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "courseId": 1,
    "courseName": "Advanced Computer Science",
    "courseCode": "CS201",
    "description": "Advanced programming concepts...",
    "weeklyHours": 4,
    "academicYear": "2024-2025",
    "courseCategory": "Advanced",
    "instructorId": 1,
    "instructor": {...},
    "roomNumber": "B205",
    "semester": "Spring",
    "schedule": [...],
    "enrolledStudents": [...]
  }
}
```

**Error Responses:**
- **404 Not Found** - Course not found
- **403 Forbidden** - You do not have permission to update this course
- **409 Conflict** - Course code already exists for your university (same code can exist for different universities)
- **400 Bad Request** - Validation errors
- **401 Unauthorized** - Missing or invalid token

---

## 6. Delete Course

**Method:** `DELETE`  
**Full URL:** `http://localhost:3001/api/courses/:id`

**Example:** `http://localhost:3001/api/courses/1`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Authorization:** Users can only delete courses they created.

**Request Body:** None

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

**Note:** Deleting a course will automatically:
- Delete all schedule entries for the course
- Remove all student enrollments (via CASCADE foreign key)

**Error Responses:**
- **404 Not Found** - Course not found
- **403 Forbidden** - You do not have permission to delete this course
- **400 Bad Request** - Invalid course ID format
- **401 Unauthorized** - Missing or invalid token

---

## 7. Enroll Students in Course

**Method:** `POST`  
**Full URL:** `http://localhost:3001/api/courses/:id/students`

**Example:** `http://localhost:3001/api/courses/1/students`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Authorization:** Users can only enroll students in courses they created.

**Request Body (JSON):**
```json
{
  "studentIds": [1, 2, 3, 4, 5]
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Students enrolled successfully",
  "data": [
    {
      "studentId": 1,
      "name": "Alice",
      "surname": "Smith",
      "studentNumber": "1001",
      "department": "Computer Science",
      "enrolledAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "studentId": 2,
      "name": "Bob",
      "surname": "Johnson",
      "studentNumber": "1002",
      "department": "Computer Science",
      "enrolledAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- **404 Not Found** - Course or student not found
- **403 Forbidden** - You do not have permission to enroll students in this course
- **400 Bad Request** - Invalid studentIds array
- **401 Unauthorized** - Missing or invalid token

---

## 8. Remove Students from Course

**Method:** `DELETE`  
**Full URL:** `http://localhost:3001/api/courses/:id/students`

**Example:** `http://localhost:3001/api/courses/1/students`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Authorization:** Users can only remove students from courses they created.

**Request Body (JSON):**
```json
{
  "studentIds": [1, 2, 3]
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Students removed from course successfully"
}
```

**Error Responses:**
- **404 Not Found** - Course not found
- **403 Forbidden** - You do not have permission to remove students from this course
- **400 Bad Request** - Invalid studentIds array
- **401 Unauthorized** - Missing or invalid token

---

## 9. Get Enrolled Students for Course

**Method:** `GET`  
**Full URL:** `http://localhost:3001/api/courses/:id/students`

**Example:** `http://localhost:3001/api/courses/1/students`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Authorization:** Users can only view enrolled students for courses they created.

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "studentId": 1,
      "name": "Alice",
      "surname": "Smith",
      "studentNumber": "1001",
      "department": "Computer Science",
      "enrolledAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "studentId": 2,
      "name": "Bob",
      "surname": "Johnson",
      "studentNumber": "1002",
      "department": "Computer Science",
      "enrolledAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- **404 Not Found** - Course not found
- **403 Forbidden** - You do not have permission to view students in this course
- **400 Bad Request** - Invalid course ID format
- **401 Unauthorized** - Missing or invalid token

---

## Field Validations

### Schedule Entry Format:
- `day`: Must be one of: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`
- `start_time`: Format `HH:MM` (24-hour format, e.g., `09:00`, `14:30`)
- `end_time`: Format `HH:MM` (24-hour format, e.g., `11:00`, `16:30`)
- End time must be after start time

### Course Fields:
- `courseName`: Required (2-255 characters)
- `courseCode`: Required (2-50 characters), must be unique **within the same university**
  - Same course code can exist for different universities
  - Uniqueness is determined by the instructor's `university_id`
- `description`: Optional (max 2000 characters)
- `weeklyHours`: Required (0-168, decimal allowed)
- `academicYear`: Optional (max 50 characters)
- `courseCategory`: Optional (max 100 characters)
- `instructorId`: **IGNORED** - automatically set to authenticated user
- `roomNumber`: Optional (max 50 characters)
- `semester`: Optional (max 50 characters)
- `schedule`: Optional (array of schedule entries)
- `studentIds`: Optional (array of student IDs, students must exist)

---

## Complete Testing Flow

### Scenario 1: Instructor Creating and Managing Their Own Courses

1. **Login as Instructor**
   ```
   POST http://localhost:3001/api/auth/login
   Body: { "email": "instructor@example.com", "password": "..." }
   ```
   Save the token

2. **Create Course**
   ```
   POST http://localhost:3001/api/courses
   Headers: Authorization: Bearer <token>
   Body: { "courseName": "CS101", "courseCode": "CS101", "weeklyHours": 3 }
   ```
   ✅ Course is created with `instructorId` = authenticated user's ID

3. **Get All My Courses**
   ```
   GET http://localhost:3001/api/courses
   Headers: Authorization: Bearer <token>
   ```
   ✅ Returns only courses created by this instructor

4. **Get Course by ID**
   ```
   GET http://localhost:3001/api/courses/1
   Headers: Authorization: Bearer <token>
   ```
   ✅ Works - instructor owns this course

5. **Update Course**
   ```
   PUT http://localhost:3001/api/courses/1
   Headers: Authorization: Bearer <token>
   Body: { "courseName": "Updated Name" }
   ```
   ✅ Works - instructor owns this course

6. **Enroll Students**
   ```
   POST http://localhost:3001/api/courses/1/students
   Headers: Authorization: Bearer <token>
   Body: { "studentIds": [1, 2, 3] }
   ```
   ✅ Works - instructor owns this course

7. **Delete Course**
   ```
   DELETE http://localhost:3001/api/courses/1
   Headers: Authorization: Bearer <token>
   ```
   ✅ Works - instructor owns this course

---

### Scenario 2: Instructor Trying to Access Another Instructor's Course

1. **Login as Instructor A (ID: 1)**
   ```
   POST http://localhost:3001/api/auth/login
   Body: { "email": "instructor1@example.com", "password": "..." }
   ```
   Save token A

2. **Login as Instructor B (ID: 2)**
   ```
   POST http://localhost:3001/api/auth/login
   Body: { "email": "instructor2@example.com", "password": "..." }
   ```
   Save token B

3. **Instructor B tries to view Instructor A's course**
   ```
   GET http://localhost:3001/api/courses/1
   Headers: Authorization: Bearer <token_B>
   ```
   ❌ Returns 403 Forbidden - Instructor B doesn't own this course

4. **Instructor B tries to update Instructor A's course**
   ```
   PUT http://localhost:3001/api/courses/1
   Headers: Authorization: Bearer <token_B>
   Body: { "courseName": "Hacked Course" }
   ```
   ❌ Returns 403 Forbidden - Instructor B doesn't own this course

5. **Instructor B tries to delete Instructor A's course**
   ```
   DELETE http://localhost:3001/api/courses/1
   Headers: Authorization: Bearer <token_B>
   ```
   ❌ Returns 403 Forbidden - Instructor B doesn't own this course

---

### Scenario 3: Admin Viewing Any Instructor's Courses

1. **Login as Admin**
   ```
   POST http://localhost:3001/api/auth/login
   Body: { "email": "admin@example.com", "password": "..." }
   ```
   Save admin token

2. **View Courses by Instructor ID 1**
   ```
   GET http://localhost:3001/api/courses/instructor/1
   Headers: Authorization: Bearer <admin_token>
   ```
   ✅ Works - Admins can view any instructor's courses

3. **View Courses by Instructor ID 2**
   ```
   GET http://localhost:3001/api/courses/instructor/2
   Headers: Authorization: Bearer <admin_token>
   ```
   ✅ Works - Admins can view any instructor's courses

---

## Postman Collection Variables

Set these variables in Postman:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:3001` |
| `token` | `<your_jwt_token>` |
| `course_id` | `1` |
| `instructor_id` | `1` |

Then use:
- `{{base_url}}/api/courses`
- `{{base_url}}/api/courses/{{course_id}}`
- `{{base_url}}/api/courses/instructor/{{instructor_id}}`

---

## Quick Copy-Paste Examples

### Create Course
```
POST http://localhost:3001/api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseName": "CS101",
  "courseCode": "CS101",
  "weeklyHours": 3
}
```

### Get All My Courses
```
GET http://localhost:3001/api/courses
Authorization: Bearer <token>
```

### Get Courses by Instructor ID
```
GET http://localhost:3001/api/courses/instructor/1
Authorization: Bearer <token>
```

### Get Course by ID
```
GET http://localhost:3001/api/courses/1
Authorization: Bearer <token>
```

### Update Course
```
PUT http://localhost:3001/api/courses/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseName": "Updated Name"
}
```

### Delete Course
```
DELETE http://localhost:3001/api/courses/1
Authorization: Bearer <token>
```

### Enroll Students
```
POST http://localhost:3001/api/courses/1/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentIds": [1, 2, 3]
}
```

### Remove Students
```
DELETE http://localhost:3001/api/courses/1/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentIds": [1, 2]
}
```

### Get Enrolled Students
```
GET http://localhost:3001/api/courses/1/students
Authorization: Bearer <token>
```

---

## Summary of Ownership Rules

| Endpoint | Ownership Rule |
|----------|----------------|
| `POST /api/courses` | Course is created for authenticated user (instructorId ignored) |
| `GET /api/courses` | Returns only courses created by authenticated user |
| `GET /api/courses/instructor/:id` | Admins: any instructor, Instructors: own ID only |
| `GET /api/courses/:id` | Only if authenticated user created the course |
| `PUT /api/courses/:id` | Only if authenticated user created the course |
| `DELETE /api/courses/:id` | Only if authenticated user created the course |
| `POST /api/courses/:id/students` | Only if authenticated user created the course |
| `DELETE /api/courses/:id/students` | Only if authenticated user created the course |
| `GET /api/courses/:id/students` | Only if authenticated user created the course |

---

## Testing Checklist

- [ ] Create course - instructorId is automatically set to authenticated user
- [ ] Get all courses - returns only authenticated user's courses
- [ ] Get courses by instructor ID - admins can view any, instructors only own
- [ ] Get course by ID - only if user owns it
- [ ] Update course - only if user owns it, instructorId cannot be changed
- [ ] Delete course - only if user owns it
- [ ] Enroll students - only if user owns the course
- [ ] Remove students - only if user owns the course
- [ ] Get enrolled students - only if user owns the course
- [ ] Instructor cannot access another instructor's course (403 error)
- [ ] Admin can view any instructor's courses
- [ ] All endpoints require authentication (401 if missing token)
