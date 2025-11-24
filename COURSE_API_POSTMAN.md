# Course API - Postman Testing Guide

## Base URL
```
http://localhost:3001
```
*(Adjust port if different in your .env file)*

---

## Prerequisites

1. **Authentication Required**: All course endpoints require a JWT token
2. **Get Your Token**: First, login using `/api/auth/login` to get your JWT token
3. **Add Token to Headers**: Include the token in the Authorization header for all requests

### How to Get Authentication Token

**POST** `http://localhost:3001/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "your-email@example.com",
  "password": "YourPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "name": "John",
    "surname": "Doe",
    "email": "your-email@example.com",
    "role": "instructor"
  }
}
```

**Save the `token` value** - you'll need it for all course API requests.

---

## 1. Create Course (POST)

**Method:** `POST`  
**URL:** `http://localhost:3001/api/courses`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Request Body (Full Example with All Fields):**
```json
{
  "courseName": "Introduction to Computer Science",
  "courseCode": "CS101",
  "description": "This course covers fundamental programming concepts, data structures, and algorithms. Students will learn to write clean, efficient code using modern programming languages.",
  "weeklyHours": 3,
  "academicYear": "2024",
  "courseCategory": "Computer Science",
  "instructorId": 1,
  "roomNumber": "A101",
  "semester": "Fall",
  "schedule": [
    {
      "day": "Monday",
      "start_time": "09:00",
      "end_time": "10:00"
    },
    {
      "day": "Wednesday",
      "start_time": "09:00",
      "end_time": "10:00"
    },
    {
      "day": "Friday",
      "start_time": "14:00",
      "end_time": "15:00"
    }
  ],
  "studentIds": [1, 2, 3]
}
```

**Request Body (Minimal Required Fields):**
```json
{
  "courseName": "Database Systems",
  "courseCode": "CS301",
  "weeklyHours": 4
}
```

**Request Body (Without Schedule and Students):**
```json
{
  "courseName": "Web Development",
  "courseCode": "CS201",
  "description": "Learn modern web development with React and Node.js",
  "weeklyHours": 3,
  "academicYear": "2024",
  "courseCategory": "Computer Science",
  "instructorId": 1,
  "roomNumber": "B205",
  "semester": "Spring"
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
    "description": "This course covers fundamental programming concepts...",
    "weeklyHours": 3,
    "academicYear": "2024",
    "courseCategory": "Computer Science",
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
        "start_time": "09:00:00",
        "end_time": "10:00:00"
      },
      {
        "schedule_id": 2,
        "course_id": 1,
        "day": "Wednesday",
        "start_time": "09:00:00",
        "end_time": "10:00:00"
      },
      {
        "schedule_id": 3,
        "course_id": 1,
        "day": "Friday",
        "start_time": "14:00:00",
        "end_time": "15:00:00"
      }
    ],
    "enrolledStudents": [
      {
        "studentId": 1,
        "name": "Alice",
        "surname": "Smith",
        "studentNumber": "STU001",
        "department": "Computer Science",
        "enrolledAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "studentId": 2,
        "name": "Bob",
        "surname": "Johnson",
        "studentNumber": "STU002",
        "department": "Computer Science",
        "enrolledAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Course name is required",
      "param": "courseName",
      "location": "body"
    }
  ]
}
```

**409 Conflict - Duplicate Course Code:**
```json
{
  "success": false,
  "message": "Course with this course code already exists"
}
```

**404 Not Found - Instructor Not Found:**
```json
{
  "success": false,
  "message": "Instructor not found"
}
```

**401 Unauthorized - Missing/Invalid Token:**
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

---

## 2. Get All Courses (GET)

**Method:** `GET`  
**URL:** `http://localhost:3001/api/courses`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### Query Parameters (All Optional):

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 10) | `10` |
| `search` | string | Search in course name, code, or description | `CS101` |
| `instructorId` | number | Filter by instructor ID | `1` |
| `academicYear` | string | Filter by academic year | `2024` |
| `courseCategory` | string | Filter by course category | `Computer Science` |

### Example Requests:

**Get All Courses (Default - First 10):**
```
GET http://localhost:3001/api/courses
```

**Get Courses with Pagination:**
```
GET http://localhost:3001/api/courses?page=1&limit=5
```

**Search Courses:**
```
GET http://localhost:3001/api/courses?search=Computer
```

**Filter by Instructor:**
```
GET http://localhost:3001/api/courses?instructorId=1
```

**Filter by Academic Year:**
```
GET http://localhost:3001/api/courses?academicYear=2024
```

**Filter by Category:**
```
GET http://localhost:3001/api/courses?courseCategory=Computer Science
```

**Combined Filters:**
```
GET http://localhost:3001/api/courses?page=1&limit=10&search=CS&instructorId=1&academicYear=2024&courseCategory=Computer Science
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "courseId": 1,
      "courseName": "Introduction to Computer Science",
      "courseCode": "CS101",
      "description": "This course covers fundamental programming concepts...",
      "weeklyHours": 3,
      "academicYear": "2024",
      "courseCategory": "Computer Science",
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
          "start_time": "09:00:00",
          "end_time": "10:00:00"
        },
        {
          "schedule_id": 2,
          "course_id": 1,
          "day": "Wednesday",
          "start_time": "09:00:00",
          "end_time": "10:00:00"
        }
      ],
      "enrolledStudentsCount": 2
    },
    {
      "courseId": 2,
      "courseName": "Database Systems",
      "courseCode": "CS301",
      "description": null,
      "weeklyHours": 4,
      "academicYear": "2024",
      "courseCategory": "Computer Science",
      "instructorId": 1,
      "instructor": {
        "instructorId": 1,
        "name": "John",
        "surname": "Doe",
        "email": "john.doe@example.com"
      },
      "roomNumber": null,
      "semester": null,
      "schedule": [],
      "enrolledStudentsCount": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

**Error Responses:**

**401 Unauthorized - Missing/Invalid Token:**
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

**400 Bad Request - Invalid Query Parameters:**
```json
{
  "success": false,
  "message": "Invalid query parameters"
}
```

---

## Quick Testing Checklist

### ✅ POST /api/courses
- [ ] Test with all fields (full course with schedule and students)
- [ ] Test with minimal required fields only
- [ ] Test with invalid course code (should fail validation)
- [ ] Test with duplicate course code (should return 409)
- [ ] Test with invalid instructor ID (should return 404)
- [ ] Test without authentication token (should return 401)
- [ ] Test with invalid schedule times (end_time before start_time)
- [ ] Test with invalid day name

### ✅ GET /api/courses
- [ ] Test without query parameters (default pagination)
- [ ] Test with pagination (page & limit)
- [ ] Test search functionality
- [ ] Test filter by instructorId
- [ ] Test filter by academicYear
- [ ] Test filter by courseCategory
- [ ] Test combined filters
- [ ] Test without authentication token (should return 401)

---

## Postman Collection Setup Tips

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:3001`
   - `auth_token`: (set this after login)

2. **Pre-request Script (for authenticated requests):**
   ```javascript
   // Set token from environment variable
   pm.request.headers.add({
     key: 'Authorization',
     value: 'Bearer ' + pm.environment.get('auth_token')
   });
   ```

3. **Test Script (for login endpoint):**
   ```javascript
   // Save token to environment after login
   if (pm.response.code === 200) {
     const jsonData = pm.response.json();
     if (jsonData.token) {
       pm.environment.set('auth_token', jsonData.token);
     }
   }
   ```

---

## Field Validation Rules

### Required Fields (POST):
- `courseName` - String, 2-255 characters
- `courseCode` - String, 2-50 characters, unique
- `weeklyHours` - Number, 0-168

### Optional Fields:
- `description` - String, max 2000 characters
- `academicYear` - String, max 50 characters
- `courseCategory` - String, max 100 characters
- `instructorId` - Integer, must exist in USER table
- `roomNumber` - String, max 50 characters
- `semester` - String, max 50 characters
- `schedule` - Array of schedule entries
- `studentIds` - Array of student IDs

### Schedule Entry Format:
```json
{
  "day": "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday",
  "start_time": "HH:MM" (24-hour format, e.g., "09:00", "14:30"),
  "end_time": "HH:MM" (must be after start_time)
}
```

---

## Common Issues & Solutions

**Issue:** Getting 401 Unauthorized
- **Solution:** Make sure you're including the `Authorization: Bearer TOKEN` header
- **Solution:** Check that your token hasn't expired (default: 7 days)

**Issue:** Getting 409 Conflict on POST
- **Solution:** Course code must be unique. Try a different course code.

**Issue:** Schedule validation fails
- **Solution:** Day must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- **Solution:** Time format must be HH:MM (24-hour format)
- **Solution:** end_time must be after start_time

**Issue:** Instructor not found
- **Solution:** Make sure the instructorId exists in the USER table
- **Solution:** User must have role 'instructor' or 'admin'

---

**Happy Testing! 🚀**

