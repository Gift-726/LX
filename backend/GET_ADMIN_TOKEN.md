# 🔑 Getting Admin Token - Quick Guide

## Admin Credentials
- **Email:** `gianosamsung@gmail.com`
- **Password:** `Admin@McGeorge2024`

---

## Method 1: Using the Login Script (Recommended)

### Step 1: Start the Server
```bash
node backend/server.js
```

### Step 2: Run the Login Script
In a **new terminal**:
```bash
node backend/login-admin.js
```

This will:
- ✅ Login as admin
- ✅ Display your token
- ✅ Show usage examples

---

## Method 2: Manual Login via API

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"gianosamsung@gmail.com\",\"password\":\"Admin@McGeorge2024\"}"
```

### Using Postman/Thunder Client:
1. **Method:** POST
2. **URL:** `http://localhost:3000/api/auth/login`
3. **Headers:** 
   - `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "email": "gianosamsung@gmail.com",
  "password": "Admin@McGeorge2024"
}
```

5. **Response:** Copy the `token` value from the response

---

## Method 3: Register Admin Account First

If login fails because the account doesn't exist:

### Step 1: Register the Admin Account
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"firstname\":\"Admin\",\"lastname\":\"McGeorge\",\"email\":\"gianosamsung@gmail.com\",\"phone\":\"1234567890\",\"password\":\"Admin@McGeorge2024\",\"confirmPassword\":\"Admin@McGeorge2024\"}"
```

Or in Postman:
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/register`
- **Body:**
```json
{
  "firstname": "Admin",
  "lastname": "McGeorge",
  "email": "gianosamsung@gmail.com",
  "phone": "1234567890",
  "password": "Admin@McGeorge2024",
  "confirmPassword": "Admin@McGeorge2024"
}
```

### Step 2: The response will include your token!
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "firstname": "Admin",
    "lastname": "McGeorge",
    "email": "gianosamsung@gmail.com",
    "phone": "1234567890",
    "role": "admin"
  }
}
```

**Copy the token value!**

---

## Using the Token

Once you have the token, use it in the `Authorization` header for all admin requests:

### Example: Create a Product

**cURL:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test Product\",\"description\":\"A test product\",\"price\":999.99,\"category\":\"CATEGORY_ID_HERE\",\"stock\":50}"
```

**Postman/Thunder Client:**
1. **Method:** POST
2. **URL:** `http://localhost:3000/api/products`
3. **Headers:**
   - `Authorization: Bearer YOUR_TOKEN_HERE`
   - `Content-Type: application/json`
4. **Body:**
```json
{
  "title": "Premium Suit",
  "description": "High-quality business suit",
  "price": 2999.99,
  "category": "CATEGORY_ID_HERE",
  "images": ["https://example.com/image1.jpg"],
  "tags": ["Men", "Formal"],
  "stock": 50
}
```

---

## Troubleshooting

### "Authentication failed" Error
1. ✅ Make sure the server is running
2. ✅ Check that you registered with `gianosamsung@gmail.com`
3. ✅ Verify the password is exactly: `Admin@McGeorge2024`
4. ✅ Make sure MongoDB is connected

### "User not found" Error
- Run the registration endpoint first (Method 3 above)

### "Access denied. Admin privileges required"
- Your account might not have admin role
- Only `gianosamsung@gmail.com` gets admin role automatically
- Check the user object in the login response - it should show `"role": "admin"`

---

## Quick Test

After getting your token, test it:

```bash
# Replace YOUR_TOKEN_HERE with your actual token
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

You should see your profile with `"role": "admin"`
