# 🚀 Quick Start Guide

## For Frontend Developers

This guide will help you quickly understand and integrate with the McGeorge LX Backend API.

### 1. Base URL

All API endpoints start with:
```
http://localhost:3000/api
```

### 2. Authentication Flow

The API uses **Two-Factor Authentication (2FA)**. Here's how it works:

#### Registration
```javascript
// Step 1: Register
POST /api/auth/register
Body: { firstname, lastname, email, phone, password, confirmPassword }
Response: { success: true, message: "Check email for code", userId, email }

// Step 2: Verify Code
POST /api/auth/verify-registration
Body: { email, code }
Response: { success: true, token, user }
```

#### Login
```javascript
// Step 1: Login
POST /api/auth/login
Body: { email, password }
Response: { success: true, message: "Check email for code", userId, email }

// Step 2: Verify Code
POST /api/auth/verify-login
Body: { email, code }
Response: { success: true, token, user }
```

### 3. Using the Token

After authentication, include the token in all protected requests:

```javascript
fetch('http://localhost:3000/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### 4. Common Endpoints

#### Get Products
```javascript
GET /api/products?page=1&limit=20&category=<categoryId>
```

#### Get Categories
```javascript
GET /api/categories
```

#### Get User Profile
```javascript
GET /api/user/profile
Headers: { Authorization: `Bearer ${token}` }
```

### 5. Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical details (optional)"
}
```

### 6. Response Format

All successful responses include:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

## 📚 Full Documentation

See `docs/API_DOCUMENTATION.md` for complete API reference.

## 🧪 Testing

Test the API endpoints using:
- Postman
- cURL
- Your frontend application

## 💡 Tips

1. **Store JWT token securely** - Use localStorage or httpOnly cookies
2. **Handle 2FA flow** - Show verification code input after registration/login
3. **Check success field** - Always verify `success: true` before using data
4. **Handle errors gracefully** - Show user-friendly error messages
5. **Implement loading states** - Show spinners during API calls

---

**Need Help?** Check `docs/API_DOCUMENTATION.md` for detailed examples and error scenarios.

