# 🚀 Quick Start - Authentication System

## 📋 Setup Checklist

- [ ] Install nodemailer: `npm install nodemailer` ✅ (Already done)
- [ ] Set up Gmail App Password
- [ ] Update .env with email credentials
- [ ] Test forgot password flow

---

## 🔑 Gmail App Password Setup (5 minutes)

### **Step 1: Enable 2FA**
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"

### **Step 2: Generate App Password**
1. Go to: https://myaccount.google.com/apppasswords
2. Select: Mail → Other (Custom name)
3. Name it: "McGeorge LX"
4. Copy the 16-character password

### **Step 3: Update .env**
```env
EMAIL_USER='your-email@gmail.com'
EMAIL_PASSWORD='xxxx xxxx xxxx xxxx'
```

---

## 📡 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/forgot-password` | POST | Send reset code |
| `/api/auth/verify-reset-code` | POST | Verify code (optional) |
| `/api/auth/reset-password` | POST | Reset password |
| `/api/auth/google` | GET | Google OAuth |
| `/api/auth/facebook` | GET | Facebook OAuth |

---

## 🔄 Password Reset Flow

```
User → Forgot Password → Enter Email
  ↓
System → Generate 4-digit code → Send Email
  ↓
User → Receives Email → Enters Code + New Password
  ↓
System → Verify Code → Update Password
  ↓
User → Login with New Password ✅
```

---

## 🧪 Quick Test

### **1. Start Server**
```bash
npm run dev
```

### **2. Test Forgot Password**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### **3. Check Email**
Look for 4-digit code in your inbox

### **4. Reset Password**
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

## ✨ New Features

### **Enhanced Login**
- ✅ Checks if user exists
- ✅ Redirects to signup if not found
- ✅ Detects social login accounts
- ✅ Clear error messages

### **Forgot Password**
- ✅ Sends 4-digit code via email
- ✅ Professional HTML email template
- ✅ 10-minute code expiry
- ✅ Secure password reset

### **Smart Validation**
- ✅ Duplicate email/phone checking
- ✅ Password confirmation
- ✅ OAuth account detection
- ✅ Helpful error responses

---

## 📧 Email Template Preview

```
┌─────────────────────────────────┐
│   Password Reset Request        │
│                                 │
│   Your verification code is:    │
│                                 │
│        ┌─────────┐              │
│        │  7392   │              │
│        └─────────┘              │
│                                 │
│   Expires in 10 minutes         │
└─────────────────────────────────┘
```

---

## 🎯 Response Examples

### **Login - User Not Found**
```json
{
  "success": false,
  "message": "User not found. Please sign up first.",
  "redirectTo": "signup"
}
```

### **Login - Social Account**
```json
{
  "success": false,
  "message": "This account was created using social login...",
  "socialLogin": true
}
```

### **Forgot Password - Success**
```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "expiresIn": "10 minutes"
}
```

---

## 🔒 Security Features

- 🔐 Bcrypt password hashing
- 🎫 JWT tokens (7-day expiry)
- ⏰ Code expiration (10 minutes)
- 🚫 Duplicate prevention
- ✅ Input validation

---

## 📚 Full Documentation

See `AUTHENTICATION_GUIDE.md` for complete details.

---

## ⚡ Start Testing Now!

1. Update .env with email credentials
2. Run: `npm run dev`
3. Test endpoints with Postman or curl
4. Check your email for verification codes

**You're ready to go! 🎉**
