# Postman Testing Guide - Attendify Backend API

## Base URL
```
http://localhost:3000
```

## Health Check (Optional Test)

**Method:** `GET`  
**URL:** `http://localhost:3000/health`

**Headers:** None required

**Expected Response:**
```json
{
  "success": true,
  "message": "Attendify API is running"
}
```

---

## 1. Register User

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "name": "Hasan",
  "surname": "Adnan",
  "email": "hasan4adnan@gmail.com",
  "password": "StrongPass123!",
  "confirmPassword": "StrongPass123!",
  "role": "instructor"
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

**Notes:**
- Save the `verificationCode` from the response - you'll need it for the next step
- The `verificationCode` is also logged in the server console
- `role` is optional (defaults to "instructor" if not provided)
- Valid roles: `"admin"` or `"instructor"`

**Error Responses:**
- **409 Conflict** - Email already registered
- **400 Bad Request** - Validation errors (missing fields, passwords don't match, etc.)

---

## 2. Verify Email

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/verify-email`

**Headers:**
```
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "email": "hasan4adnan@gmail.com",
  "code": "123456"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Email successfully verified."
}
```

**Notes:**
- Use the `verificationCode` from the register response
- Code expires after 15 minutes (configurable in `.env`)
- Maximum 5 attempts before code is locked

**Error Responses:**
- **400 Bad Request** - Invalid code or expired code
- **404 Not Found** - User not found
- **429 Too Many Requests** - Too many failed attempts

---

## 3. Login

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "email": "hasan4adnan@gmail.com",
  "password": "StrongPass123!"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiaGFzYW40YWRuYW5AZ21haWwuY29tIiwicm9sZSI6Imluc3RydWN0b3IiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDU2NDgwMH0.abc123...",
  "user": {
    "id": 1,
    "name": "Hasan",
    "surname": "Adnan",
    "email": "hasan4adnan@gmail.com",
    "role": "instructor"
  }
}
```

**Notes:**
- Save the `token` - you'll need it for protected routes
- Email must be verified before login (complete step 2 first)
- Token expires after 7 days (configurable in `.env`)

**Error Responses:**
- **401 Unauthorized** - Invalid email or password
- **403 Forbidden** - Email not verified
- **400 Bad Request** - Validation errors

---

## Complete Testing Flow

### Step-by-Step Process:

1. **Register** → Copy `userId` and `verificationCode`
2. **Verify Email** → Use the `verificationCode` from step 1
3. **Login** → Copy the `token` for future authenticated requests

### Example Sequence:

**Step 1: Register**
```json
POST http://localhost:3000/api/auth/register
{
  "name": "Hasan",
  "surname": "Adnan",
  "email": "hasan4adnan@gmail.com",
  "password": "StrongPass123!",
  "confirmPassword": "StrongPass123!",
  "role": "instructor"
}
```
→ Response: `{ "userId": 1, "verificationCode": "123456" }`

**Step 2: Verify Email**
```json
POST http://localhost:3000/api/auth/verify-email
{
  "email": "hasan4adnan@gmail.com",
  "code": "123456"
}
```
→ Response: `{ "success": true, "message": "Email successfully verified." }`

**Step 3: Login**
```json
POST http://localhost:3000/api/auth/login
{
  "email": "hasan4adnan@gmail.com",
  "password": "StrongPass123!"
}
```
→ Response: `{ "token": "eyJ...", "user": {...} }`

---

## Using JWT Token for Protected Routes

Once you have a token from login, use it in the Authorization header:

**Headers:**
```
Authorization: Bearer <your_token_here>
Content-Type: application/json
```

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiaGFzYW40YWRuYW5AZ21haWwuY29tIiwicm9sZSI6Imluc3RydWN0b3IiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDU2NDgwMH0.abc123...
```

---

## Quick Copy-Paste Templates

### Register
```json
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Hasan",
  "surname": "Adnan",
  "email": "hasan4adnan@gmail.com",
  "password": "StrongPass123!",
  "confirmPassword": "StrongPass123!",
  "role": "instructor"
}
```

### Verify Email
```json
POST http://localhost:3000/api/auth/verify-email
Content-Type: application/json

{
  "email": "hasan4adnan@gmail.com",
  "code": "123456"
}
```

### Login
```json
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "hasan4adnan@gmail.com",
  "password": "StrongPass123!"
}
```

---

## Error Testing Examples

### Test Duplicate Email (409 Conflict)
```json
POST http://localhost:3000/api/auth/register
{
  "name": "Test",
  "surname": "User",
  "email": "hasan4adnan@gmail.com",  // Same email as before
  "password": "Test123!",
  "confirmPassword": "Test123!",
  "role": "instructor"
}
```

### Test Password Mismatch (400 Bad Request)
```json
POST http://localhost:3000/api/auth/register
{
  "name": "Test",
  "surname": "User",
  "email": "test@example.com",
  "password": "Test123!",
  "confirmPassword": "Different123!",  // Doesn't match
  "role": "instructor"
}
```

### Test Invalid Verification Code (400 Bad Request)
```json
POST http://localhost:3000/api/auth/verify-email
{
  "email": "hasan4adnan@gmail.com",
  "code": "999999"  // Wrong code
}
```

### Test Unverified Email Login (403 Forbidden)
```json
POST http://localhost:3000/api/auth/login
{
  "email": "unverified@example.com",  // User exists but not verified
  "password": "Password123!"
}
```

---

## Postman Collection Setup Tips

1. **Create a Collection** named "Attendify API"
2. **Add Environment Variables:**
   - `base_url`: `http://localhost:3000`
   - `token`: (set after login)
   - `verification_code`: (set after register)
3. **Use Variables in URLs:**
   - `{{base_url}}/api/auth/register`
   - `{{base_url}}/api/auth/verify-email`
   - `{{base_url}}/api/auth/login`
4. **Set Token Automatically:**
   - In login request, add a "Tests" script to save token:
   ```javascript
   if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       pm.environment.set("token", jsonData.token);
   }
   ```

---

## Troubleshooting

**Connection Refused:**
- Ensure server is running: `npm run dev`
- Check port in `.env` (default: 3000)

**Database Connection Error:**
- Ensure MySQL is running in XAMPP
- Check `.env` database credentials
- Verify database `ATTENDIFY` exists

**401/403 Errors:**
- Make sure you verified email before login
- Check password is correct (case-sensitive)
- Verify token hasn't expired

**Validation Errors:**
- Check all required fields are present
- Ensure email format is valid
- Password must be at least 8 characters
- Passwords must match exactly

