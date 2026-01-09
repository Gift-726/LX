# Paystack Environment Variables Setup

## Quick Fix for "Format is Authorization Bearer [secret key]" Error

This error means Paystack can't find your secret key. Follow these steps:

### Step 1: Create/Update .env File

Create or update the `.env` file in your `backend` directory:

**Location:** `backend/.env`

**Content:**
```env
PAYSTACK_SECRET_KEY=sk_test_d87383e7b165cc12319050f6abde7ef898070da6
PAYSTACK_PUBLIC_KEY=pk_test_6329c0b91a74207b75096445e60cce3db564b6b4
FRONTEND_URL=http://localhost:3001
PAYSTACK_CALLBACK_URL=http://localhost:3001/payment/callback
```

### Step 2: Verify .env File Location

Make sure the `.env` file is in the **backend** directory, not the root directory:

```
LX/
├── backend/
│   ├── .env          ← Should be here
│   ├── server.js
│   └── ...
└── ...
```

### Step 3: Check .env File Format

- No spaces around the `=` sign
- No quotes around the values (unless needed)
- No trailing spaces
- Each variable on a new line

**Correct:**
```env
PAYSTACK_SECRET_KEY=sk_test_d87383e7b165cc12319050f6abde7ef898070da6
```

**Wrong:**
```env
PAYSTACK_SECRET_KEY = sk_test_d87383e7b165cc12319050f6abde7ef898070da6
PAYSTACK_SECRET_KEY="sk_test_d87383e7b165cc12319050f6abde7ef898070da6"
```

### Step 4: Restart Your Server

**CRITICAL:** After adding/updating `.env`, you MUST restart your server:

1. Stop the server (Ctrl+C)
2. Start it again:
   ```bash
   cd backend
   node server.js
   ```

### Step 5: Verify Environment Variable is Loaded

You can test if the variable is loaded by adding a temporary log in `server.js`:

```javascript
// After dotenv.config()
console.log("Paystack Secret Key:", process.env.PAYSTACK_SECRET_KEY ? "✓ Set" : "✗ Missing");
```

Or test directly:
```bash
# In backend directory
node -e "require('dotenv').config(); console.log('PAYSTACK_SECRET_KEY:', process.env.PAYSTACK_SECRET_KEY ? 'Set' : 'Missing');"
```

### Common Issues

#### Issue 1: .env file not in backend directory
**Solution:** Move `.env` to `backend/.env`

#### Issue 2: Variable name typo
**Solution:** Check spelling: `PAYSTACK_SECRET_KEY` (not `PAYSTACK_SECRET` or `PAYSTACK_KEY`)

#### Issue 3: Server not restarted
**Solution:** Always restart after changing `.env`

#### Issue 4: .env file has wrong encoding
**Solution:** Save as UTF-8, no BOM

#### Issue 5: Multiple .env files
**Solution:** Make sure you're editing the one in `backend/` directory

### Verification

After setup, test the endpoint:

```bash
POST http://localhost:3000/api/payments/initialize
Headers:
  Authorization: Bearer YOUR_AUTH_TOKEN
  Content-Type: application/json
Body:
{
  "orderId": "your_order_id"
}
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    ...
  }
}
```

**If you still get the error:**
1. Double-check `.env` file location and content
2. Restart server
3. Check server console for any error messages
4. Verify the secret key is correct (starts with `sk_test_`)

### Still Not Working?

1. **Check server logs** - Look for any errors when starting
2. **Verify .env is being read** - Add console.log to check
3. **Test with hardcoded value** (temporarily):
   ```javascript
   // In config/paystack.js (temporary test)
   const paystackSecretKey = "sk_test_d87383e7b165cc12319050f6abde7ef898070da6";
   ```
   If this works, the issue is with .env loading

