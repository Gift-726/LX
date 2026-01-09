# Testing Payment Endpoints

## Step 1: Test Basic Route (No Auth Required)

First, verify the routes are accessible:

```bash
GET http://localhost:3000/api/payments/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment routes are working!",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "path": "/api/payments/test"
}
```

If this doesn't work, the routes aren't registered properly.

## Step 2: Test Debug Endpoint (No Auth Required)

```bash
GET http://localhost:3000/api/payments/debug
```

**Expected Response:**
```json
{
  "success": true,
  "secretKeyExists": true,
  "secretKeyLength": 48,
  "secretKeyPreview": "sk_test_d87383e...",
  "secretKeyHasSpaces": false,
  "allEnvKeys": ["PAYSTACK_SECRET_KEY", "PAYSTACK_PUBLIC_KEY"],
  "nodeEnv": "development",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

## Step 3: Test Initialize Endpoint (Auth Required)

```bash
POST http://localhost:3000/api/payments/initialize
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "orderId": "your_order_id_here"
}
```

## Common Errors

### Error: "Cannot GET /api/payments/test"
**Cause:** Routes not registered or server not restarted
**Solution:** 
- Restart server
- Check server.js has `app.use("/api/payments", paymentRoutes);`

### Error: "Route not found"
**Cause:** Wrong URL or method
**Solution:**
- Check URL: `/api/payments/test` (not `/api/payment/test`)
- Check method: GET for test/debug, POST for initialize

### Error: "Unauthorized" (on /initialize)
**Cause:** Missing or invalid auth token
**Solution:**
- Add `Authorization: Bearer YOUR_TOKEN` header
- Make sure token is valid

### Error: No response, no console logs
**Cause:** Server might not be running or route not registered
**Solution:**
- Check server is running
- Check server console for errors
- Verify route registration in server.js

## Check Server Console

When you call the endpoints, you should see logs like:

```
[Payment Route] Initialize endpoint called
[Payment Route] Method: POST
[Payment Route] Path: /initialize
[Payment Route] Body: { orderId: '...' }
```

If you don't see these logs, the route isn't being hit.

## Still Not Working?

1. **Verify server is running:**
   ```bash
   GET http://localhost:3000/health
   ```

2. **Check server console** for any errors when starting

3. **Verify route registration** in server.js (line 94)

4. **Check if routes file exists:**
   ```bash
   ls backend/routes/paymentRoutes.js
   ```

5. **Restart server** after any changes

