# Settings API - Postman Testing Guide

## Base URL
```
http://localhost:3001
```

## Authentication
All settings endpoints require authentication. Include the JWT token in the Authorization header:

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

## 1. Update Profile Settings

**Method:** `PUT`  
**URL:** `http://localhost:3001/api/settings/profile`

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
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@example.com",
  "role": "instructor",
  "universityId": 1
}
```

#### Partial Update Examples:

**Update only name:**
```json
{
  "name": "Jane"
}
```

**Update name and surname:**
```json
{
  "name": "Jane",
  "surname": "Smith"
}
```

**Update email:**
```json
{
  "email": "newemail@example.com"
}
```

**Update role:**
```json
{
  "role": "admin"
}
```

**Update university:**
```json
{
  "universityId": 2
}
```

**Remove university (set to null):**
```json
{
  "universityId": null
}
```

### Expected Response (200 OK):
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

### Error Responses:

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

### Field Validations:

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `name` | string | Optional | 2-50 characters, cannot be empty if provided |
| `surname` | string | Optional | 2-50 characters, cannot be empty if provided |
| `email` | string | Optional | Valid email format, must be unique |
| `role` | string | Optional | Must be 'admin' or 'instructor' |
| `universityId` | number \| null | Optional | Positive integer or null, university must exist |

### Important Notes:

1. **Partial Updates:** You can send only the fields you want to update. Other fields will remain unchanged.

2. **Email Uniqueness:** If you update `email`, it must be unique. If another user already has that email, you'll get a 409 Conflict error.

3. **University Validation:** If you provide `universityId`, the university must exist in the database. You can set it to `null` to remove the university association.

4. **Role Restriction:** Role can only be 'admin' or 'instructor'.

---

## 2. Update Password

**Method:** `PUT`  
**URL:** `http://localhost:3001/api/settings/password`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Request Body (JSON)

**All fields are required:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmNewPassword": "NewPassword123!"
}
```

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### Error Responses:

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

### Field Validations:

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `currentPassword` | string | Required | Must match user's current password |
| `newPassword` | string | Required | Minimum 8 characters |
| `confirmNewPassword` | string | Required | Must match `newPassword` |

### Important Notes:

1. **Current Password Verification:** The current password must be correct before the password can be changed.

2. **Password Strength:** New password must be at least 8 characters long.

3. **Password Confirmation:** `newPassword` and `confirmNewPassword` must match exactly.

4. **Security:** After password update, the user will need to use the new password for future logins.

---

## Updated Registration Endpoint

The registration endpoint now includes `universityId` as an optional field.

**Method:** `POST`  
**URL:** `http://localhost:3001/api/auth/register`

**Request Body (JSON):**
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

**Note:** `universityId` is optional. If provided, the university must exist in the database.

---

## Complete Testing Flow

1. **Register** → Get `userId` and `verificationCode`
   ```
   POST http://localhost:3001/api/auth/register
   Body: { name, surname, email, password, confirmPassword, role, universityId }
   ```

2. **Verify Email** → Use the `verificationCode` from step 1
   ```
   POST http://localhost:3001/api/auth/verify-email
   Body: { email, code }
   ```

3. **Login** → Get JWT token
   ```
   POST http://localhost:3001/api/auth/login
   Body: { email, password }
   ```

4. **Update Profile** → Modify profile settings
   ```
   PUT http://localhost:3001/api/settings/profile
   Headers: Authorization: Bearer <token>
   Body: { name, surname, email, role, universityId }
   ```

5. **Update Password** → Change password
   ```
   PUT http://localhost:3001/api/settings/password
   Headers: Authorization: Bearer <token>
   Body: { currentPassword, newPassword, confirmNewPassword }
   ```

---

## Postman Collection Variables

Set these variables in Postman for easier testing:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:3001` |
| `token` | `<your_jwt_token>` |

Then use:
- Update Profile: `{{base_url}}/api/settings/profile`
- Update Password: `{{base_url}}/api/settings/password`

---

## Common Use Cases

### Update Only Name
```json
{
  "name": "Updated Name"
}
```

### Update Email and University
```json
{
  "email": "newemail@example.com",
  "universityId": 2
}
```

### Change Role to Admin
```json
{
  "role": "admin"
}
```

### Remove University Association
```json
{
  "universityId": null
}
```

### Change Password
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmNewPassword": "NewPassword123!"
}
```

---

## Error Handling Tips

1. **404 Not Found:** 
   - Check that the user exists (you're authenticated)
   - Check that the university ID exists if provided

2. **409 Conflict:** 
   - Email must be unique - check if another user has the same email

3. **400 Bad Request:** 
   - Check validation rules for each field
   - Ensure passwords match

4. **401 Unauthorized:** 
   - Make sure your JWT token is valid and included in the Authorization header
   - For password update, verify current password is correct


