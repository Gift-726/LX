# 🔐 Complete Authentication System Documentation

## ✅ Features Implemented

Your authentication system now includes:

1. ✅ **User Registration** with duplicate checking
2. ✅ **User Login** with enhanced validation
3. ✅ **Google OAuth** authentication
4. ✅ **Facebook OAuth** authentication
5. ✅ **Forgot Password** with email verification
6. ✅ **Password Reset** with 4-digit code
7. ✅ **Automatic redirect** for non-existent users

---

## 📋 API Endpoints

### **1. Register New User**
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "675...",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Error Responses:**
- **400** - Duplicate email or phone
- **400** - Passwords don't match
- **400** - Missing required fields

---

### **2. Login User**
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "675...",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Error Responses:**

**User Not Found (404):**
```json
{
  "success": false,
  "message": "User not found. Please sign up first.",
  "redirectTo": "signup"
}
```

**Social Login Account (400):**
```json
{
  "success": false,
  "message": "This account was created using social login. Please use Google or Facebook to sign in.",
  "socialLogin": true
}
```

**Invalid Credentials (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### **3. Forgot Password (Step 1: Request Code)**
**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "expiresIn": "10 minutes"
}
```

**What Happens:**
- Generates a random 4-digit code (e.g., `7392`)
- Saves code and expiry time to database
- Sends professional email with the code
- Code expires in 10 minutes

**Error Responses:**

**User Not Found (404):**
```json
{
  "success": false,
  "message": "No account found with this email address",
  "redirectTo": "signup"
}
```

**Social Login Account (400):**
```json
{
  "success": false,
  "message": "This account was created using social login. Password reset is not available.",
  "socialLogin": true
}
```

---

### **4. Verify Reset Code (Step 2: Optional)**
**Endpoint:** `POST /api/auth/verify-reset-code`

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "7392"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification code is valid. You can now reset your password."
}
```

**Error Responses:**

**Invalid Code (400):**
```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

**Expired Code (400):**
```json
{
  "success": false,
  "message": "Verification code has expired. Please request a new one.",
  "expired": true
}
```

---

### **5. Reset Password (Step 3: Final)**
**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "7392",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

**What Happens:**
- Verifies the code again
- Hashes the new password
- Updates the password in database
- Clears the reset code and expiry
- User can now login with new password

**Error Responses:**
- **400** - Passwords don't match
- **400** - Invalid or expired code
- **404** - User not found

---

### **6. Google OAuth**
**Endpoint:** `GET /api/auth/google`

Redirects to Google login page. After authentication, redirects to callback.

**Callback:** `GET /api/auth/google/callback`

**Success Response:**
```json
{
  "success": true,
  "message": "Google login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "675...",
    "googleId": "123456789",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@gmail.com"
  }
}
```

---

### **7. Facebook OAuth**
**Endpoint:** `GET /api/auth/facebook`

Redirects to Facebook login page. After authentication, redirects to callback.

**Callback:** `GET /api/auth/facebook/callback`

**Success Response:**
```json
{
  "success": true,
  "message": "Facebook login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "675...",
    "facebookId": "987654321",
    "firstname": "John",
    "lastname": "Doe",
    "email": "facebook_987654321@placeholder.com"
  }
}
```

---

## 🔄 Password Reset Flow

### **Complete User Journey:**

```
1. User clicks "Forgot Password"
   ↓
2. User enters email → POST /api/auth/forgot-password
   ↓
3. System sends 4-digit code to email
   ↓
4. User receives email with code (e.g., 7392)
   ↓
5. User enters code and new password → POST /api/auth/reset-password
   ↓
6. System verifies code and updates password
   ↓
7. User can now login with new password
```

### **Email Template:**
The verification email includes:
- Professional HTML design
- Large, easy-to-read 4-digit code
- Expiry time (10 minutes)
- Company branding

---

## 🔧 Email Setup (Gmail)

### **Step 1: Enable 2-Factor Authentication**
1. Go to Google Account settings
2. Security → 2-Step Verification
3. Enable it

### **Step 2: Generate App Password**
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other (Custom name)"
4. Enter name: "McGeorge LX Backend"
5. Click "Generate"
6. Copy the 16-character password

### **Step 3: Update .env File**
```env
EMAIL_USER='your-actual-email@gmail.com'
EMAIL_PASSWORD='your-16-char-app-password'
```

**Example:**
```env
EMAIL_USER='mcgeorgelx@gmail.com'
EMAIL_PASSWORD='abcd efgh ijkl mnop'
```

---

## 🧪 Testing the System

### **Test Registration:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Test",
    "lastname": "User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "Test123",
    "confirmPassword": "Test123"
  }'
```

### **Test Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123"
  }'
```

### **Test Forgot Password:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### **Test Reset Password:**
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "1234",
    "newPassword": "NewPass123",
    "confirmPassword": "NewPass123"
  }'
```

---

## 🎯 Frontend Integration Guide

### **Login Flow:**
```javascript
// Login attempt
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();

if (data.success) {
  // Store token
  localStorage.setItem('token', data.token);
  // Redirect to dashboard
  window.location.href = '/dashboard';
} else if (data.redirectTo === 'signup') {
  // User doesn't exist, redirect to signup
  window.location.href = '/signup';
} else if (data.socialLogin) {
  // Show message: "Please use Google/Facebook to login"
  alert(data.message);
} else {
  // Show error message
  alert(data.message);
}
```

### **Forgot Password Flow:**
```javascript
// Step 1: Request code
const step1 = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
});

// Step 2: User enters code from email
// Step 3: Reset password
const step3 = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email,
    code,
    newPassword,
    confirmPassword
  })
});

const result = await step3.json();
if (result.success) {
  // Redirect to login
  window.location.href = '/login';
}
```

---

## 🔒 Security Features

1. ✅ **Password Hashing** - bcrypt with salt rounds
2. ✅ **JWT Tokens** - 7-day expiration
3. ✅ **Code Expiry** - Reset codes expire in 10 minutes
4. ✅ **Duplicate Prevention** - Email and phone uniqueness
5. ✅ **OAuth Security** - Secure token handling
6. ✅ **Input Validation** - All fields validated
7. ✅ **Error Messages** - Clear, helpful feedback

---

## 📊 Database Schema

```javascript
{
  googleId: String,        // For Google OAuth
  facebookId: String,      // For Facebook OAuth
  firstname: String,       // Required
  lastname: String,        // Required
  email: String,           // Required, unique
  phone: String,           // Optional for OAuth
  password: String,        // Optional for OAuth
  resetCode: String,       // 4-digit code
  resetCodeExpiry: Date,   // Code expiration time
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}
```

---

## 🚨 Common Issues & Solutions

### **Issue: Email not sending**
**Solutions:**
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Ensure you're using App Password, not regular password
- Check Gmail security settings
- Verify 2FA is enabled

### **Issue: "User not found" on login**
**Expected Behavior:** This redirects user to signup
**Frontend Action:** Show signup form or redirect to `/signup`

### **Issue: Code expired**
**Solution:** User needs to request a new code via forgot-password

### **Issue: Social login user can't reset password**
**Expected Behavior:** Password reset not available for OAuth users
**Frontend Action:** Show message to use Google/Facebook login

---

## 📝 Next Steps

1. ✅ Set up Gmail App Password
2. ✅ Update EMAIL_USER and EMAIL_PASSWORD in .env
3. ✅ Test all endpoints
4. ⬜ Build frontend forms
5. ⬜ Implement token storage
6. ⬜ Add protected routes
7. ⬜ Deploy to production

---

## 🎉 You're All Set!

Your authentication system is now complete with:
- ✅ Registration with validation
- ✅ Login with smart redirects
- ✅ Google & Facebook OAuth
- ✅ Forgot password with email
- ✅ Secure password reset

**Start your server and test it out!**
```bash
npm run dev
```
