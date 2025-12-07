# Student Edit & Delete API - Postman Testing Guide

## Base URL
```
http://localhost:3001
```

## Authentication
Both endpoints require authentication. Include the JWT token in the Authorization header:

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

## 1. Update Student (Edit)

**Method:** `PUT`  
**URL:** `http://localhost:3001/api/students/:id`

**Example:** `http://localhost:3001/api/students/1`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Request Body (JSON)

**All fields are optional** - you can update only the fields you want to change.

#### Full Update Example:
```json
{
  "name": "Ahmet",
  "surname": "Yılmaz",
  "studentNumber": "1001",
  "department": "Computer Science",
  "faceEmbedding": "base64_encoded_face_embedding_string",
  "photoPath": "/uploads/students/ahmet_yilmaz.jpg",
  "createdBy": 1,
  "courseIds": [1, 2, 3]
}
```

#### Partial Update Examples:

**Update only name and surname:**
```json
{
  "name": "Mehmet",
  "surname": "Demir"
}
```

**Update student number and department:**
```json
{
  "studentNumber": "2001",
  "department": "Software Engineering"
}
```

**Update courses only:**
```json
{
  "courseIds": [1, 2, 3, 4]
}
```

**Note:** When updating `courseIds`, it will **replace** all existing course associations with the new list. If you want to keep existing courses, include them in the array.

**Remove face embedding (set to null):**
```json
{
  "faceEmbedding": null
}
```

**Update photo path:**
```json
{
  "photoPath": "/uploads/students/new_photo.jpg"
}
```

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "studentId": 1,
    "name": "Ahmet",
    "surname": "Yılmaz",
    "studentNumber": "1001",
    "department": "Computer Science",
    "faceEmbedding": "base64_encoded_face_embedding_string",
    "photoPath": "/uploads/students/ahmet_yilmaz.jpg",
    "faceScanStatus": "Verified",
    "courses": [
      {
        "course_id": 1,
        "course_name": "Introduction to Computer Science",
        "course_code": "CS101",
        "created_at": "2024-01-15T10:00:00.000Z"
      },
      {
        "course_id": 2,
        "course_name": "Data Structures",
        "course_code": "CS201",
        "created_at": "2024-01-15T10:00:00.000Z"
      }
    ],
    "attendance": {
      "status": "Not Marked",
      "message": "Attendance not yet marked",
      "sessionId": 1
    },
    "createdBy": 1,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Error Responses:

**400 Bad Request - Invalid student ID:**
```json
{
  "success": false,
  "message": "Invalid student ID"
}
```

**400 Bad Request - Validation errors:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "A",
      "msg": "Name must be between 2 and 100 characters",
      "path": "name",
      "location": "body"
    }
  ]
}
```

**404 Not Found - Student not found:**
```json
{
  "success": false,
  "message": "Student not found"
}
```

**404 Not Found - Course not found (when updating courseIds):**
```json
{
  "success": false,
  "message": "One or more courses do not exist: 5, 6",
  "missingCourseIds": [5, 6]
}
```

**409 Conflict - Duplicate student number:**
```json
{
  "success": false,
  "message": "Student with this student number already exists"
}
```

**401 Unauthorized - Missing or invalid token:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Field Validations:

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `name` | string | Optional | 2-100 characters, cannot be empty if provided |
| `surname` | string | Optional | 2-100 characters, cannot be empty if provided |
| `studentNumber` | string | Optional | 3-50 characters, must be unique, cannot be empty if provided |
| `department` | string | Optional | Max 255 characters |
| `faceEmbedding` | string \| null | Optional | String or null |
| `photoPath` | string | Optional | Max 500 characters |
| `createdBy` | number | Optional | Positive integer (user ID) |
| `courseIds` | array | Optional | Array of positive integers (course IDs must exist) |

### Important Notes:

1. **Partial Updates:** You can send only the fields you want to update. Other fields will remain unchanged.

2. **Course IDs Replacement:** When you provide `courseIds`, it **replaces** all existing course associations. To keep existing courses, include them in the array:
   - Current courses: [1, 2]
   - Want to add course 3: Send `[1, 2, 3]`
   - Want to remove course 2: Send `[1]`

3. **Student Number Uniqueness:** If you update `studentNumber`, it must be unique. If another student already has that number, you'll get a 409 Conflict error.

4. **Face Embedding:** Can be set to `null` to remove it, or a string value to update it.

---

## 2. Delete Student

**Method:** `DELETE`  
**URL:** `http://localhost:3001/api/students/:id`

**Example:** `http://localhost:3001/api/students/1`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:** None (no body required)

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

### Error Responses:

**400 Bad Request - Invalid student ID:**
```json
{
  "success": false,
  "message": "Invalid student ID"
}
```

**404 Not Found - Student not found:**
```json
{
  "success": false,
  "message": "Student not found"
}
```

**401 Unauthorized - Missing or invalid token:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Important Notes:

1. **Cascade Deletion:** When a student is deleted:
   - All course enrollments are automatically deleted (via CASCADE foreign key in `STUDENT_COURSE` table)
   - The student record is removed from the `STUDENT` table

2. **Permanent Action:** This action cannot be undone. Make sure you want to delete the student before proceeding.

3. **No Body Required:** DELETE requests don't require a request body.

---

## Complete Testing Examples

### Example 1: Update Student Name and Department

**Request:**
```
PUT http://localhost:3001/api/students/1
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Mehmet",
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
    "name": "Mehmet",
    "surname": "Yılmaz",
    "studentNumber": "1001",
    "department": "Software Engineering",
    ...
  }
}
```

---

### Example 2: Update Student Courses

**Request:**
```
PUT http://localhost:3001/api/students/1
```

**Body:**
```json
{
  "courseIds": [1, 2, 3]
}
```

**Note:** This replaces all existing course associations with courses [1, 2, 3].

---

### Example 3: Remove Face Embedding

**Request:**
```
PUT http://localhost:3001/api/students/1
```

**Body:**
```json
{
  "faceEmbedding": null
}
```

**Response:** The `faceScanStatus` will change to "Not Verified".

---

### Example 4: Delete Student

**Request:**
```
DELETE http://localhost:3001/api/students/1
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

---

## Postman Collection Variables

Set these variables in Postman for easier testing:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:3001` |
| `token` | `<your_jwt_token>` |
| `student_id` | `1` |

Then use:
- Update: `{{base_url}}/api/students/{{student_id}}`
- Delete: `{{base_url}}/api/students/{{student_id}}`

---

## Quick Test Flow

1. **Login** → Get JWT token
   ```
   POST http://localhost:3001/api/auth/login
   ```

2. **Get Student** → Verify student exists
   ```
   GET http://localhost:3001/api/students/1
   ```

3. **Update Student** → Modify student information
   ```
   PUT http://localhost:3001/api/students/1
   ```

4. **Get Student Again** → Verify changes
   ```
   GET http://localhost:3001/api/students/1
   ```

5. **Delete Student** → Remove student
   ```
   DELETE http://localhost:3001/api/students/1
   ```

6. **Get Student** → Verify deletion (should return 404)
   ```
   GET http://localhost:3001/api/students/1
   ```

---

## Common Use Cases

### Update Student Information After Registration
```json
{
  "name": "Updated Name",
  "surname": "Updated Surname",
  "department": "New Department"
}
```

### Add Face Embedding to Student
```json
{
  "faceEmbedding": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Change Student's Courses
```json
{
  "courseIds": [1, 2, 3, 4, 5]
}
```

### Update Student Number
```json
{
  "studentNumber": "NEW123"
}
```

**Note:** Make sure the new student number is unique, otherwise you'll get a 409 Conflict error.

---

## Error Handling Tips

1. **404 Not Found:** Check that the student ID exists before updating/deleting
2. **409 Conflict:** Student number must be unique - check if another student has the same number
3. **400 Bad Request:** Check validation rules for each field
4. **401 Unauthorized:** Make sure your JWT token is valid and included in the Authorization header

