# Paystack Payment Authentication Guide

## Understanding the Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/payments/test` - Test endpoint
- `GET /api/payments/debug` - Debug endpoint

### Protected Endpoints (Auth Required)
- `POST /api/payments/initialize` - Initialize payment (requires token)
- `GET /api/payments/verify/:reference` - Verify payment (requires token)
- `GET /api/payments/status/:orderId` - Get payment status (requires token)

---

## Step 1: Get a JWT Token

You need to login first to get a token. Your system uses 2FA, so you need to:

### Option A: Login (2 Steps)

**Step 1: Request Login Code**
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Check email for code",
  "userId": "...",
  "email": "your-email@example.com"
}
```

**Step 2: Verify Code**
```bash
POST http://localhost:3000/api/auth/verify-login
Content-Type: application/json

{
  "email": "your-email@example.com",
  "code": "123456"
}
```

**Response (contains token):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Copy the `token` value!**

### Option B: Register New User (if you don't have an account)

**Step 1: Register**
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Step 2: Verify Registration Code** (check email)
```bash
POST http://localhost:3000/api/auth/verify-registration
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (contains token):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

## Step 2: Use the Token

Once you have the token, include it in the `Authorization` header:

### Initialize Payment

```bash
POST http://localhost:3000/api/payments/initialize
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "orderId": "your_order_id_here"
}
```

**Important Notes:**
- Use `POST` method (not GET)
- Include `Authorization: Bearer YOUR_TOKEN` header
- Token must be valid (not expired)
- You need to create an order first to get an `orderId`

---

## Complete Example Flow

### 1. Login and Get Token
```bash
# Step 1: Request login code
POST http://localhost:3000/api/auth/login
Body: { "email": "user@example.com", "password": "password123" }

# Step 2: Verify code (check email for code)
POST http://localhost:3000/api/auth/verify-login
Body: { "email": "user@example.com", "code": "123456" }

# Response contains: { "token": "eyJ..." }
```

### 2. Create an Order (if you don't have one)
```bash
POST http://localhost:3000/api/orders
Authorization: Bearer YOUR_TOKEN
Body: {
  "shippingAddressId": "address_id",
  "shippingMethodId": "shipping_method_id",
  "paymentMethod": "paystack"
}

# Response contains: { "order": { "_id": "order_id" } }
```

### 3. Initialize Payment
```bash
POST http://localhost:3000/api/payments/initialize
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
Body: {
  "orderId": "order_id_from_step_2"
}
```

---

## Common Errors

### "Not authorized, token failed"
**Cause:** 
- No token provided
- Token is invalid/expired
- Token format is wrong

**Solution:**
- Make sure you include: `Authorization: Bearer YOUR_TOKEN`
- Get a fresh token by logging in again
- Check token hasn't expired (tokens last 7 days)

### "Not authorized, no token provided"
**Cause:** Missing Authorization header

**Solution:**
- Add `Authorization: Bearer YOUR_TOKEN` header
- Make sure there's a space between "Bearer" and the token

### "Order not found"
**Cause:** Invalid orderId or order doesn't belong to you

**Solution:**
- Create an order first
- Use the correct orderId
- Make sure the order belongs to the authenticated user

---

## Quick Test Script

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}' \
  | jq -r '.token')

# 2. Initialize Payment
curl -X POST http://localhost:3000/api/payments/initialize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"your_order_id"}'
```

---

## Using Postman/Thunder Client

1. **Get Token:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/auth/login`
   - Body: `{ "email": "...", "password": "..." }`
   - Copy the `token` from response

2. **Initialize Payment:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/payments/initialize`
   - Headers:
     - `Authorization: Bearer YOUR_TOKEN`
     - `Content-Type: application/json`
   - Body: `{ "orderId": "..." }`

---

## Token Format

The token should look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NS4uLiIsImlhdCI6MTczNjkwNDgwMCwiZXhwIjoxNzM3NTA5NjAwfQ.xxxxx
```

It's a long string with dots separating three parts. Make sure you copy the ENTIRE token.

