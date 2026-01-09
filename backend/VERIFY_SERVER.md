# Verify Server is Running Updated Code

## The Problem

You're getting a 404 error, which means either:
1. The server isn't running the updated code
2. The server needs to be restarted
3. There's a caching issue

## Solution Steps

### Step 1: Stop ALL Node Processes

**Windows:**
```bash
# Find all node processes
tasklist | findstr node

# Kill all node processes
taskkill /F /IM node.exe
```

**Or manually:**
- Close all terminal windows running node
- Check Task Manager for node processes and end them

### Step 2: Verify Files Are Updated

Check that `backend/server.js` has this line (around line 94):
```javascript
app.use("/api/payments", paymentRoutes);
```

Check that `backend/routes/paymentRoutes.js` has the `/test` endpoint.

### Step 3: Start Server Fresh

```bash
cd backend
node server.js
```

**Look for these messages when server starts:**
```
=== Registered Routes ===
Payment routes: /api/payments
  - GET  /api/payments/test
  - GET  /api/payments/debug
  - POST /api/payments/initialize
=======================

✓ Server running on port 3000
✓ Health check: http://localhost:3000/health
✓ Payment test: http://localhost:3000/api/payments/test
✓ Payment debug: http://localhost:3000/api/payments/debug
```

If you DON'T see these messages, the server isn't running the updated code.

### Step 4: Test Endpoints

1. **Health check (should work):**
   ```bash
   GET http://localhost:3000/health
   ```

2. **Payment test (should work):**
   ```bash
   GET http://localhost:3000/api/payments/test
   ```

3. **Check server console** - You should see logs when you hit the endpoints.

### Step 5: If Still Not Working

1. **Check if another server is running:**
   - Try a different port: Change `PORT` in `.env` to `3001`
   - Or check if something else is using port 3000

2. **Clear any caches:**
   - Delete `node_modules/.cache` if it exists
   - Restart your computer if needed

3. **Verify you're hitting the right server:**
   - Make sure you're using `http://localhost:3000` (not 3001, 8000, etc.)
   - Check the server console shows it's running on port 3000

## Expected Console Output

When you call `/api/payments/test`, you should see in the server console:
```
[Payment Route] Test endpoint called
```

If you don't see this, the route isn't being hit.

## Still Getting 404?

1. **Check server console** - Does it show the route registration messages?
2. **Check URL** - Make sure it's exactly `/api/payments/test` (not `/api/payment/test`)
3. **Check method** - Use GET for `/test` and `/debug`
4. **Restart server** - Always restart after code changes

