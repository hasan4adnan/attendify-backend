# Student API Endpoints - Complete Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All student endpoints require authentication via JWT token.

**Header Required:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

To get a JWT token:
1. Register: `POST /api/auth/register`
2. Verify email: `POST /api/auth/verify-email`
3. Login: `POST /api/auth/login` (returns token)

---

## 1. Create a New Student

**Endpoint:** `POST /api/students`

**Authentication:** Required

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Request Body (JSON):**
```json
{
  "name": "Ahmet",
  "surname": "Yılmaz",
  "studentNumber": "1001",
  "department": "Computer Science",
  "faceEmbedding": null,
  "photoPath": "/uploads/photo.jpg",
  "createdBy": 1,
  "courseIds": [1, 2]
}
```

**Field Descriptions:**
- `name` (required): Student's name (2-100 characters)
- `surname` (required): Student's surname (2-100 characters)
- `studentNumber` (required): Unique student number (3-50 characters)
- `department` (optional): Department name (max 255 characters)
- `faceEmbedding` (optional): Face embedding data as string
- `photoPath` (optional): Photo file path (max 500 characters)
- `createdBy` (optional): User ID who created this student (will use authenticated user if not provided)
- `courseIds` (optional): Array of course IDs to associate student with

**Success Response (201):**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "studentId": 1,
    "name": "Ahmet",
    "surname": "Yılmaz",
    "studentNumber": "1001",
    "department": "Computer Science",
    "faceEmbedding": null,
    "photoPath": "/uploads/photo.jpg",
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
    "createdBy": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Duplicate student number
- `401` - Unauthorized (missing/invalid token)

---

## 2. Get All Students (with Pagination & Search)

**Endpoint:** `GET /api/students`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search query - searches name, surname, student_number, department

**Examples:**
```
GET /api/students
GET /api/students?page=1&limit=10
GET /api/students?page=2&limit=20
GET /api/students?search=Ahmet
GET /api/students?page=1&limit=10&search=Yılmaz
```

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
      "photoPath": "/uploads/photo.jpg",
      "faceScanStatus": "Not Verified",
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
      "createdBy": 1,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "studentId": 2,
      "name": "Ayşe",
      "surname": "Demir",
      "studentNumber": "1002",
      "department": "Mathematics",
      "faceEmbedding": "[0.1, 0.2, ...]",
      "photoPath": "/uploads/ayse.jpg",
      "faceScanStatus": "Verified",
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
      "createdBy": 1,
      "createdAt": "2024-01-15T11:00:00.000Z"
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

**Face Scan Status Values:**
- `"Not Verified"` - Face embedding is null/empty
- `"Verified"` - Face embedding exists

**Attendance Status Values:**
- `"No Class Today"` - No session scheduled for today
- `"Not Marked"` - Session exists but attendance not marked
- `"Present"` - Attendance marked as present
- `"Absent"` - Attendance marked as absent

**Error Responses:**
- `401` - Unauthorized (missing/invalid token)
- `500` - Internal server error

---

## 3. Get Student by ID

**Endpoint:** `GET /api/students/:id`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**URL Parameters:**
- `id` (required): Student ID (number)

**Example:**
```
GET /api/students/1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "studentId": 1,
    "name": "Ahmet",
    "surname": "Yılmaz",
    "studentNumber": "1001",
    "department": "Computer Science",
    "faceEmbedding": null,
    "photoPath": "/uploads/photo.jpg",
    "faceScanStatus": "Not Verified",
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
    "createdBy": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid student ID
- `404` - Student not found
- `401` - Unauthorized (missing/invalid token)

---

## 4. Update Student

**Endpoint:** `PUT /api/students/:id`

**Authentication:** Required

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**URL Parameters:**
- `id` (required): Student ID (number)

**Request Body (JSON) - All fields are optional:**
```json
{
  "name": "Ahmet",
  "surname": "Yılmaz",
  "studentNumber": "1001",
  "department": "Computer Engineering",
  "faceEmbedding": "[0.1, 0.2, 0.3, ...]",
  "photoPath": "/uploads/updated-photo.jpg",
  "createdBy": 1,
  "courseIds": [1, 2, 3]
}
```

**Field Descriptions:**
- `name` (optional): Student's name (2-100 characters if provided)
- `surname` (optional): Student's surname (2-100 characters if provided)
- `studentNumber` (optional): Student number (3-50 characters if provided, must be unique)
- `department` (optional): Department name (max 255 characters)
- `faceEmbedding` (optional): Face embedding data as string (setting this will change faceScanStatus to "Verified")
- `photoPath` (optional): Photo file path (max 500 characters)
- `createdBy` (optional): User ID who created this student
- `courseIds` (optional): Array of course IDs to associate student with (replaces existing associations)

**Example:**
```
PUT /api/students/1
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "studentId": 1,
    "name": "Ahmet",
    "surname": "Yılmaz",
    "studentNumber": "1001",
    "department": "Computer Engineering",
    "faceEmbedding": "[0.1, 0.2, 0.3, ...]",
    "photoPath": "/uploads/updated-photo.jpg",
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
    "createdBy": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid student ID or validation error
- `404` - Student not found
- `409` - Duplicate student number (if updating student number)
- `401` - Unauthorized (missing/invalid token)

---

## 5. Delete Student

**Endpoint:** `DELETE /api/students/:id`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**URL Parameters:**
- `id` (required): Student ID (number)

**Example:**
```
DELETE /api/students/1
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

**Error Responses:**
- `400` - Invalid student ID
- `404` - Student not found
- `401` - Unauthorized (missing/invalid token)
- `500` - Internal server error

---

## Complete Postman Collection Example

### Environment Variables
Set these in Postman:
- `base_url`: `http://localhost:3000`
- `jwt_token`: (will be set after login)

### Pre-request Script (for authenticated endpoints)
Add this to the "Pre-request Script" tab:
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('jwt_token')
});
```

### 1. Create Student
```
POST {{base_url}}/api/students
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "name": "Ahmet",
  "surname": "Yılmaz",
  "studentNumber": "1001",
  "department": "Computer Science",
  "courseIds": [1, 2]
}
```

### 2. Get All Students
```
GET {{base_url}}/api/students?page=1&limit=10
Authorization: Bearer {{jwt_token}}
```

### 3. Search Students
```
GET {{base_url}}/api/students?search=Ahmet
Authorization: Bearer {{jwt_token}}
```

### 4. Get Student by ID
```
GET {{base_url}}/api/students/1
Authorization: Bearer {{jwt_token}}
```

### 5. Update Student
```
PUT {{base_url}}/api/students/1
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "department": "Computer Engineering",
  "faceEmbedding": "[0.1, 0.2, ...]",
  "courseIds": [1, 2, 3]
}
```

### 6. Delete Student
```
DELETE {{base_url}}/api/students/1
Authorization: Bearer {{jwt_token}}
```

---

## Field Validation Rules

### Create Student (all required fields must be provided):
- `name`: Required, 2-100 characters
- `surname`: Required, 2-100 characters
- `studentNumber`: Required, 3-50 characters, must be unique
- `department`: Optional, max 255 characters
- `faceEmbedding`: Optional, string
- `photoPath`: Optional, max 500 characters
- `createdBy`: Optional, positive integer (uses authenticated user if not provided)
- `courseIds`: Optional, array of positive integers

### Update Student (all fields optional):
- Same validation rules as create, but all fields are optional
- If provided, must meet the same requirements

---

## Response Fields Explanation

- `faceScanStatus`: Automatically derived from `faceEmbedding`
  - `"Not Verified"` if `faceEmbedding` is null/empty
  - `"Verified"` if `faceEmbedding` has a value
- `courses`: Comma-separated string of course codes (for list view)
- `coursesFull`: Array of full course objects with all details
- `attendance`: Current attendance status for today
- `createdBy`: User ID who created the student
- `createdAt`: Timestamp when student was created

---

## Error Codes

- `400` - Bad Request (validation errors, invalid ID)
- `401` - Unauthorized (missing or invalid JWT token)
- `404` - Not Found (student doesn't exist)
- `409` - Conflict (duplicate student number)
- `500` - Internal Server Error

---

## Notes

1. **Authentication**: All endpoints require a valid JWT token in the Authorization header
2. **Student Number**: Must be unique across all students
3. **Course Associations**: When updating `courseIds`, it replaces all existing associations
4. **Face Scan Status**: Automatically calculated from `faceEmbedding` field
5. **Search**: Searches across name, surname, student_number, and department fields
6. **Pagination**: Default is page 1 with 10 items per page






