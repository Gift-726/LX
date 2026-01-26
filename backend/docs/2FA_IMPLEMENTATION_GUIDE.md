# 🔐 Two-Factor Authentication (2FA) Implementation Guide

## Overview
Two-Factor Authentication has been implemented for both **Registration** and **Login** flows. Users will receive a 6-digit verification code via email that must be entered to complete the process.

---

## 🎯 Authentication Flows

### 1. Registration Flow (2FA)

#### Step 1: Initiate Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration initiated. Please check your email for the verification code.",
  "userId": "675...",
  "email": "john@example.com",
  "expiresIn": "10 minutes",
  "previewUrl": "https://ethereal.email/message/..." // Only if using Ethereal
}
```

**What happens:**
- ✅ User account created (but not verified)
- ✅ 6-digit code sent to email
- ✅ Code expires in 10 minutes
- ❌ User cannot login yet

#### Step 2: Verify Registration Code
```http
POST /api/auth/verify-registration
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration completed successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "675...",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user"
  }
}
```

**What happens:**
- ✅ Account marked as verified
- ✅ JWT token issued
- ✅ User can now login

---

### 2. Login Flow (2FA)

#### Step 1: Initiate Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email. Please verify to complete login.",
  "userId": "675...",
  "email": "john@example.com",
  "expiresIn": "10 minutes",
  "previewUrl": "https://ethereal.email/message/..." // Only if using Ethereal
}
```

**What happens:**
- ✅ Credentials verified
- ✅ 6-digit code sent to email
- ✅ Code expires in 10 minutes
- ❌ No token issued yet

#### Step 2: Verify Login Code
```http
POST /api/auth/verify-login
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "654321"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "675...",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user"
  }
}
```

**What happens:**
- ✅ Code verified
- ✅ JWT token issued
- ✅ User is logged in

---

## 📧 Email Template

Users will receive an email with:
- **Subject:** "Password Reset Verification Code" (reusing existing template)
- **Code:** 6-digit number (e.g., 123456)
- **Expiry:** 10 minutes
- **Design:** Professional HTML email with McGeorge LX branding

---

## 🎨 Frontend Implementation Guide

### Registration Page Flow

```javascript
// Step 1: Registration Form
const handleRegister = async (formData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store email for verification step
    localStorage.setItem('pendingEmail', data.email);
    
    // Navigate to verification page
    navigate('/verify-registration');
  }
};

// Step 2: Verification Code Input Page
const handleVerifyRegistration = async (code) => {
  const email = localStorage.getItem('pendingEmail');
  
  const response = await fetch('/api/auth/verify-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Clear pending email
    localStorage.removeItem('pendingEmail');
    
    // Navigate to dashboard
    navigate('/dashboard');
  }
};
```

### Login Page Flow

```javascript
// Step 1: Login Form
const handleLogin = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store email for verification step
    localStorage.setItem('pendingEmail', data.email);
    
    // Navigate to verification page
    navigate('/verify-login');
  }
};

// Step 2: Verification Code Input Page
const handleVerifyLogin = async (code) => {
  const email = localStorage.getItem('pendingEmail');
  
  const response = await fetch('/api/auth/verify-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Clear pending email
    localStorage.removeItem('pendingEmail');
    
    // Navigate to dashboard
    navigate('/dashboard');
  }
};
```

### Verification Code Input Component (React Example)

```jsx
import React, { useState } from 'react';

const VerificationCodeInput = ({ onSubmit, onResend }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
    
    // Auto-submit when all filled
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleSubmit = async (fullCode) => {
    setLoading(true);
    setError('');
    
    try {
      await onSubmit(fullCode || code.join(''));
    } catch (err) {
      setError(err.message || 'Invalid code');
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0').focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <h2>Enter Verification Code</h2>
      <p>We've sent a 6-digit code to your email</p>
      
      <div className="code-inputs">
        {code.map((digit, index) => (
          <input
            key={index}
            id={`code-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !digit && index > 0) {
                document.getElementById(`code-${index - 1}`).focus();
              }
            }}
            disabled={loading}
          />
        ))}
      </div>
      
      {error && <p className="error">{error}</p>}
      
      <button onClick={() => handleSubmit()} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>
      
      <button onClick={onResend} className="resend-btn">
        Resend Code
      </button>
    </div>
  );
};
```

---

## ⚠️ Error Handling

### Common Error Responses

#### Invalid Code
```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

#### Expired Code
```json
{
  "success": false,
  "message": "Verification code has expired. Please login/register again.",
  "expired": true
}
```

#### User Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

#### Already Verified (Registration)
```json
{
  "success": false,
  "message": "Account already verified. Please login."
}
```

#### Not Verified (Login)
```json
{
  "success": false,
  "message": "Please complete registration verification first."
}
```

---

## 🔄 Resend Code Flow

To resend a code, the user should:
1. **For Registration:** Call `/api/auth/register` again with the same details
2. **For Login:** Call `/api/auth/login` again with the same credentials

This will generate and send a new code.

---

## 🧪 Testing

### Test Registration with 2FA
```bash
# Step 1: Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Test","lastname":"User","email":"test@example.com","phone":"1234567890","password":"Test123","confirmPassword":"Test123"}'

# Check email for code (or console for Ethereal preview URL)

# Step 2: Verify
curl -X POST http://localhost:3000/api/auth/verify-registration \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

### Test Login with 2FA
```bash
# Step 1: Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# Check email for code

# Step 2: Verify
curl -X POST http://localhost:3000/api/auth/verify-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"654321"}'
```

---

## 📝 Database Changes

### User Model Updates
- ✅ `isVerified`: Boolean (default: false)
- ✅ `verificationCode`: String (6-digit code)
- ✅ `verificationCodeExpiry`: Date (10 minutes from creation)

---

## 🔒 Security Features

1. **Code Expiry:** Codes expire after 10 minutes
2. **One-Time Use:** Codes are cleared after successful verification
3. **Email Validation:** Codes are tied to specific email addresses
4. **Account Status:** Unverified users cannot login
5. **Password Hashing:** Passwords remain securely hashed
6. **JWT Tokens:** Only issued after successful 2FA verification

---

## 💡 Tips

1. **Email Delivery:** If using Gmail, make sure App Password is set correctly
2. **Testing:** Use Ethereal fallback for development (check console for preview URLs)
3. **Code Length:** 6 digits provides good balance between security and usability
4. **Expiry Time:** 10 minutes is standard for verification codes
5. **Resend Logic:** Allow users to request new codes if they don't receive the email
