# 🚀 Quick Reference - 2FA Authentication

## Registration Flow
```
1. POST /api/auth/register
   → Sends 6-digit code to email
   
2. POST /api/auth/verify-registration
   → Verifies code, returns token
```

## Login Flow
```
1. POST /api/auth/login
   → Sends 6-digit code to email
   
2. POST /api/auth/verify-login
   → Verifies code, returns token
```

## Code Details
- **Length**: 6 digits
- **Expiry**: 10 minutes
- **Delivery**: Email (Gmail or Ethereal)

## Frontend Pages Needed
1. Registration Form
2. Registration Verification (6-digit input)
3. Login Form
4. Login Verification (6-digit input)

## Test Commands
```bash
# Start server
node backend/server.js

# Test 2FA flow
node backend/test-2fa.js
```

## Key Files
- `2FA_IMPLEMENTATION_GUIDE.md` - Complete guide
- `2FA_SUMMARY.md` - Implementation summary
- `API_DOCUMENTATION.md` - API reference
- `test-2fa.js` - Test script
