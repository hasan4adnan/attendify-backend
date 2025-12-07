# Course API - Postman Testing Guide

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

## 1. Create Course

**Method:** `POST`  
**URL:** `http://localhost:3001/api/courses`

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
  "instructorId": 1,
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
      },
      {
        "schedule_id": 2,
        "course_id": 1,
        "day": "Wednesday",
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
- **400 Bad Request** - Validation errors
- **409 Conflict** - Course code already exists
- **404 Not Found** - Instructor or student not found
- **401 Unauthorized** - Missing or invalid token

---

## 2. Get All Courses

**Method:** `GET`  
**URL:** `http://localhost:3001/api/courses`

**Query Parameters (all optional):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in course name, code, or description
- `instructorId` - Filter by instructor ID
- `academicYear` - Filter by academic year
- `courseCategory` - Filter by category

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Example URLs:**
- Get first page: `http://localhost:3001/api/courses`
- Get second page: `http://localhost:3001/api/courses?page=2`
- Get 20 per page: `http://localhost:3001/api/courses?limit=20`
- Search: `http://localhost:3001/api/courses?search=Computer`
- Filter by instructor: `http://localhost:3001/api/courses?instructorId=1`
- Combined filters: `http://localhost:3001/api/courses?page=1&limit=10&search=CS&academicYear=2024-2025`

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
    "total": 50,
    "totalPages": 5
  }
}
```

---

## 3. Get Course by ID

**Method:** `GET`  
**URL:** `http://localhost:3001/api/courses/:id`

**Example:** `http://localhost:3001/api/courses/1`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

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
    "schedule": [...],
    "enrolledStudents": [...]
  }
}
```

**Error Responses:**
- **404 Not Found** - Course not found
- **400 Bad Request** - Invalid course ID format
- **401 Unauthorized** - Missing or invalid token

---

## 4. Update Course

**Method:** `PUT`  
**URL:** `http://localhost:3001/api/courses/:id`

**Example:** `http://localhost:3001/api/courses/1`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body (JSON) - All fields are optional:**
```json
{
  "courseName": "Advanced Computer Science",
  "courseCode": "CS201",
  "description": "Advanced programming concepts and algorithms",
  "weeklyHours": 4,
  "academicYear": "2024-2025",
  "courseCategory": "Advanced",
  "instructorId": 2,
  "roomNumber": "B205",
  "semester": "Spring",
  "schedule": [
    {
      "day": "Tuesday",
      "start_time": "14:00",
      "end_time": "16:00"
    },
    {
      "day": "Thursday",
      "start_time": "14:00",
      "end_time": "16:00"
    }
  ]
}
```

**Partial Update Example (only update specific fields):**
```json
{
  "courseName": "Updated Course Name",
  "weeklyHours": 4
}
```

**Note:** To remove all schedule entries, send an empty array:
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
    "instructorId": 2,
    "instructor": {...},
    "roomNumber": "B205",
    "semester": "Spring",
    "schedule": [...],
    "enrolledStudents": [...]
  }
}
```

**Error Responses:**
- **404 Not Found** - Course or instructor not found
- **409 Conflict** - Course code already exists
- **400 Bad Request** - Validation errors or invalid data
- **401 Unauthorized** - Missing or invalid token

---

## 5. Delete Course

**Method:** `DELETE`  
**URL:** `http://localhost:3001/api/courses/:id`

**Example:** `http://localhost:3001/api/courses/1`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

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
- **400 Bad Request** - Invalid course ID format
- **401 Unauthorized** - Missing or invalid token

---

## 6. Enroll Students in Course

**Method:** `POST`  
**URL:** `http://localhost:3001/api/courses/:id/students`

**Example:** `http://localhost:3001/api/courses/1/students`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

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
- **400 Bad Request** - Invalid studentIds array
- **401 Unauthorized** - Missing or invalid token

---

## 7. Remove Students from Course

**Method:** `DELETE`  
**URL:** `http://localhost:3001/api/courses/:id/students`

**Example:** `http://localhost:3001/api/courses/1/students`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

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
- **400 Bad Request** - Invalid studentIds array
- **401 Unauthorized** - Missing or invalid token

---

## 8. Get Enrolled Students for Course

**Method:** `GET`  
**URL:** `http://localhost:3001/api/courses/:id/students`

**Example:** `http://localhost:3001/api/courses/1/students`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

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
- `courseCode`: Required (2-50 characters), must be unique
- `description`: Optional (max 2000 characters)
- `weeklyHours`: Required (0-168, decimal allowed)
- `academicYear`: Optional (max 50 characters)
- `courseCategory`: Optional (max 100 characters)
- `instructorId`: Optional (must be positive integer, user must exist and be instructor/admin)
- `roomNumber`: Optional (max 50 characters)
- `semester`: Optional (max 50 characters)
- `schedule`: Optional (array of schedule entries)
- `studentIds`: Optional (array of student IDs, students must exist)

---

## Quick Test Flow

1. **Login** → Get JWT token
   ```
   POST http://localhost:3001/api/auth/login
   ```

2. **Create Course** → Get course ID
   ```
   POST http://localhost:3001/api/courses
   ```

3. **Get All Courses** → Verify course was created
   ```
   GET http://localhost:3001/api/courses
   ```

4. **Get Course by ID** → View course details
   ```
   GET http://localhost:3001/api/courses/1
   ```

5. **Update Course** → Modify course information
   ```
   PUT http://localhost:3001/api/courses/1
   ```

6. **Enroll Students** → Add students to course
   ```
   POST http://localhost:3001/api/courses/1/students
   ```

7. **Get Enrolled Students** → View enrolled students
   ```
   GET http://localhost:3001/api/courses/1/students
   ```

8. **Remove Students** → Remove students from course
   ```
   DELETE http://localhost:3001/api/courses/1/students
   ```

9. **Delete Course** → Remove course
   ```
   DELETE http://localhost:3001/api/courses/1
   ```

---

## Postman Collection Variables

Set these variables in Postman for easier testing:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:3001` |
| `token` | `<your_jwt_token>` |
| `course_id` | `1` |

Then use: `{{base_url}}/api/courses/{{course_id}}`
