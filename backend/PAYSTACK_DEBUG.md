# Paystack Debugging Guide

## Step 1: Check Environment Variable

First, verify that the environment variable is being loaded:

```bash
GET http://localhost:3000/api/payments/debug
```

This will show you:
- Whether PAYSTACK_SECRET_KEY exists
- Its length
- A preview of the key
- Whether it has spaces

**Expected Response:**
```json
{
  "secretKeyExists": true,
  "secretKeyLength": 48,
  "secretKeyPreview": "sk_test_d87383e...",
  "secretKeyHasSpaces": false,
  "allEnvKeys": ["PAYSTACK_SECRET_KEY", "PAYSTACK_PUBLIC_KEY", ...]
}
```

## Step 2: Check Server Logs

When you call `/api/payments/initialize`, check your server console. You should see logs like:

```
[Paystack Config] Initializing client...
[Paystack Config] Secret key exists: true
[Paystack Config] Secret key length: 48
[Paystack Config] Secret key preview: sk_test_d87383e...
[Paystack Config] Client initialized successfully
[Paystack] Initializing transaction...
```

If you see "Secret key exists: false", the environment variable is not being loaded.

## Step 3: Verify .env File

1. **Location:** Make sure `.env` is in `backend/` directory (not root)
2. **Format:** 
   ```env
   PAYSTACK_SECRET_KEY=sk_test_d87383e7b165cc12319050f6abde7ef898070da6
   ```
   - No spaces around `=`
   - No quotes
   - No trailing spaces

3. **Restart Server:** After changing `.env`, ALWAYS restart:
   ```bash
   # Stop server (Ctrl+C)
   # Then start again
   node server.js
   ```

## Step 4: Test Directly

Run the test script:
```bash
cd backend
node test-paystack.js
```

This should show all green checkmarks if everything is working.

## Common Issues

### Issue: "Secret key exists: false"
**Solution:**
- Check `.env` file location (must be in `backend/`)
- Check variable name spelling (PAYSTACK_SECRET_KEY)
- Restart server after adding to `.env`

### Issue: "Secret key length: 0"
**Solution:**
- Check `.env` file - key might be empty
- Check for hidden characters
- Re-type the key value

### Issue: "Secret key has spaces: true"
**Solution:**
- Remove spaces from the key value
- Use `.trim()` (already handled in code)

### Issue: Server logs show key exists but still fails
**Solution:**
- Check if key is correct (starts with `sk_test_` for test mode)
- Verify key hasn't expired or been revoked
- Check Paystack dashboard for key status

## Still Not Working?

1. **Check server console** - Look for error messages
2. **Run debug endpoint** - `/api/payments/debug`
3. **Run test script** - `node test-paystack.js`
4. **Verify .env file** - Location, format, content
5. **Restart server** - Always restart after .env changes

