# Settings & Updated Registration API - Complete Postman Guide

## Base URL
```
http://localhost:3001
```

## Authentication
Settings endpoints require authentication. Include the JWT token in the Authorization header:

**Header:**
```
Authorization: Bearer <your_jwt_token_here>
Content-Type: application/json
```

---

## 1. Register User (Updated - Now includes University)

**Method:** `POST`  
**Full URL:** `http://localhost:3001/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body (JSON) - Full Example:**
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "role": "instructor",
  "universityId": 1
}
```

**Request Body (JSON) - Minimal Example (without university):**
```json
{
  "name": "Jane",
  "surname": "Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "instructor"
}
```

**Request Body (JSON) - With Admin Role:**
```json
{
  "name": "Admin",
  "surname": "User",
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "confirmPassword": "AdminPass123!",
  "role": "admin",
  "universityId": 1
}
```

**Expected Response (201 Created):**
```json
{
  "message": "User registered. Please verify your email.",
  "userId": 1,
  "verificationCode": "123456"
}
```

**Error Responses:**

**400 Bad Request - Validation errors:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "A",
      "msg": "Name must be between 2 and 50 characters",
      "path": "name",
      "location": "body"
    }
  ]
}
```

**400 Bad Request - Passwords don't match:**
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

**404 Not Found - University not found:**
```json
{
  "success": false,
  "message": "University not found"
}
```

**409 Conflict - Email already registered:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Field Validations:**

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `name` | string | Required | 2-50 characters |
| `surname` | string | Required | 2-50 characters |
| `email` | string | Required | Valid email format, must be unique |
| `password` | string | Required | Minimum 8 characters |
| `confirmPassword` | string | Required | Must match password |
| `role` | string | Optional | 'admin' or 'instructor' (default: 'instructor') |
| `universityId` | number | Optional | Positive integer, university must exist |

---

## 2. Update Profile Settings

**Method:** `PUT`  
**Full URL:** `http://localhost:3001/api/settings/profile`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body Examples:**

### Update Only Name:
```json
{
  "name": "UpdatedName"
}
```

### Update Name and Surname:
```json
{
  "name": "John",
  "surname": "UpdatedSurname"
}
```

### Update Email:
```json
{
  "email": "newemail@example.com"
}
```

### Update Role:
```json
{
  "role": "admin"
}
```

### Update University:
```json
{
  "universityId": 2
}
```

### Remove University (set to null):
```json
{
  "universityId": null
}
```

### Full Update Example:
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@example.com",
  "role": "instructor",
  "universityId": 1
}
```

### Update Multiple Fields:
```json
{
  "name": "Jane",
  "surname": "Smith",
  "email": "jane.smith@example.com",
  "universityId": 2
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": 1,
    "name": "John",
    "surname": "Doe",
    "email": "john.doe@example.com",
    "role": "instructor",
    "universityId": 1,
    "universityName": "Example University",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request - Validation errors:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "A",
      "msg": "Name must be between 2 and 50 characters",
      "path": "name",
      "location": "body"
    }
  ]
}
```

**404 Not Found - User or university not found:**
```json
{
  "success": false,
  "message": "User not found"
}
```
or
```json
{
  "success": false,
  "message": "University not found"
}
```

**409 Conflict - Email already registered:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**401 Unauthorized - Missing or invalid token:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Field Validations:**

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `name` | string | Optional | 2-50 characters, cannot be empty if provided |
| `surname` | string | Optional | 2-50 characters, cannot be empty if provided |
| `email` | string | Optional | Valid email format, must be unique |
| `role` | string | Optional | Must be 'admin' or 'instructor' |
| `universityId` | number \| null | Optional | Positive integer or null, university must exist |

---

## 3. Update Password

**Method:** `PUT`  
**Full URL:** `http://localhost:3001/api/settings/password`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body (JSON) - All fields required:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmNewPassword": "NewPassword123!"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses:**

**400 Bad Request - Validation errors:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "short",
      "msg": "New password must be at least 8 characters",
      "path": "newPassword",
      "location": "body"
    }
  ]
}
```

**400 Bad Request - Passwords don't match:**
```json
{
  "success": false,
  "message": "New passwords do not match"
}
```

**401 Unauthorized - Incorrect current password:**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**404 Not Found - User not found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**401 Unauthorized - Missing or invalid token:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Field Validations:**

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `currentPassword` | string | Required | Must match user's current password |
| `newPassword` | string | Required | Minimum 8 characters |
| `confirmNewPassword` | string | Required | Must match `newPassword` exactly |

---

## Complete Testing Flow

### Step 1: Register a New User
```
POST http://localhost:3001/api/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "role": "instructor",
  "universityId": 1
}
```

**Response:** Save the `verificationCode` from response

---

### Step 2: Verify Email
```
POST http://localhost:3001/api/auth/verify-email
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john.doe@example.com",
  "code": "123456"
}
```

---

### Step 3: Login to Get Token
```
POST http://localhost:3001/api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Response:** Save the `token` from response for use in settings endpoints

---

### Step 4: Update Profile
```
PUT http://localhost:3001/api/settings/profile
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body (Example - Update name and email):**
```json
{
  "name": "John",
  "email": "john.updated@example.com"
}
```

---

### Step 5: Update Password
```
PUT http://localhost:3001/api/settings/password
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!",
  "confirmNewPassword": "NewPassword123!"
}
```

---

## Postman Collection Setup

### Variables
Set these variables in Postman:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:3001` | Base API URL |
| `token` | `<your_jwt_token>` | JWT token from login |
| `user_email` | `john.doe@example.com` | User email for testing |

### Example URLs with Variables
- Register: `{{base_url}}/api/auth/register`
- Update Profile: `{{base_url}}/api/settings/profile`
- Update Password: `{{base_url}}/api/settings/password`

---

## Quick Copy-Paste Examples

### 1. Register User
**URL:** `POST http://localhost:3001/api/auth/register`
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "role": "instructor",
  "universityId": 1
}
```

### 2. Update Profile - Name Only
**URL:** `PUT http://localhost:3001/api/settings/profile`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "name": "UpdatedName"
}
```

### 3. Update Profile - Email and University
**URL:** `PUT http://localhost:3001/api/settings/profile`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "email": "newemail@example.com",
  "universityId": 2
}
```

### 4. Update Profile - Full Update
**URL:** `PUT http://localhost:3001/api/settings/profile`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@example.com",
  "role": "admin",
  "universityId": 1
}
```

### 5. Update Password
**URL:** `PUT http://localhost:3001/api/settings/password`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmNewPassword": "NewPassword123!"
}
```

---

## Important Notes

### Registration:
1. **University ID is optional** - You can register without a university
2. **University must exist** - If provided, the university ID must exist in the database
3. **Role defaults to 'instructor'** - If not provided, role will be 'instructor'
4. **Email must be unique** - Cannot register with an email that already exists

### Profile Settings:
1. **Partial Updates** - You can update only the fields you want to change
2. **Email Uniqueness** - If updating email, it must be unique
3. **University Validation** - If updating universityId, the university must exist
4. **Null University** - You can set `universityId` to `null` to remove university association

### Password Settings:
1. **Current Password Required** - Must provide correct current password
2. **Password Strength** - New password must be at least 8 characters
3. **Password Match** - `newPassword` and `confirmNewPassword` must match exactly
4. **Token Required** - Must be authenticated to change password

---

## Error Handling

### Common Errors:

**401 Unauthorized:**
- Missing or invalid JWT token
- Token expired (login again to get new token)
- For password update: Current password is incorrect

**404 Not Found:**
- User not found (shouldn't happen if authenticated)
- University not found (check university ID exists)

**409 Conflict:**
- Email already registered (during registration or profile update)

**400 Bad Request:**
- Validation errors (check field requirements)
- Passwords don't match
- Invalid data format

---

## Testing Checklist

- [ ] Register user with university
- [ ] Register user without university
- [ ] Verify email
- [ ] Login and get token
- [ ] Update profile - name only
- [ ] Update profile - email
- [ ] Update profile - role
- [ ] Update profile - university
- [ ] Update profile - remove university (set to null)
- [ ] Update profile - full update
- [ ] Update password - correct current password
- [ ] Update password - incorrect current password (should fail)
- [ ] Update password - passwords don't match (should fail)
- [ ] Update password - new password too short (should fail)


