# Paystack Integration Troubleshooting

## Error: "Cannot POST /api/payments/initialize"

This error typically means the route isn't registered. Follow these steps:

### Step 1: Check Environment Variables

Make sure your `.env` file in the `backend` directory has:

```env
PAYSTACK_SECRET_KEY=sk_test_d87383e7b165cc12319050f6abde7ef898070da6
PAYSTACK_PUBLIC_KEY=pk_test_6329c0b91a74207b75096445e60cce3db564b6b4
FRONTEND_URL=http://localhost:3001
PAYSTACK_CALLBACK_URL=http://localhost:3001/payment/callback
```

### Step 2: Restart Your Server

**IMPORTANT:** After adding the payment routes, you MUST restart your server:

1. Stop your current server (Ctrl+C)
2. Start it again:
   ```bash
   cd backend
   node server.js
   ```

### Step 3: Verify Server Started Successfully

Check the console output. You should see:
```
Server running on port 3000
API Documentation: http://localhost:3000/api
```

If you see any errors about missing modules or syntax errors, fix those first.

### Step 4: Test the Route

After restarting, test if the route is available:

```bash
# Using curl
curl -X POST http://localhost:3000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"orderId": "test"}'

# You should get a response (even if it's an error about order not found)
# If you still get "Cannot POST", the route isn't registered
```

### Step 5: Check Server Logs

Look for any errors when the server starts. Common issues:

1. **Missing PAYSTACK_SECRET_KEY**
   - Error: "Cannot read property of undefined"
   - Solution: Add PAYSTACK_SECRET_KEY to .env

2. **Module not found**
   - Error: "Cannot find module 'paystack'"
   - Solution: Run `npm install paystack` in backend directory

3. **Syntax error**
   - Error: "Unexpected token" or similar
   - Solution: Check for syntax errors in payment files

### Step 6: Verify Route Registration

Check if the route is in server.js:

```javascript
// Should be near the end of the routes section
app.use("/api/payments", paymentRoutes);
```

### Common Issues and Solutions

#### Issue 1: Route not found after restart
**Solution:** 
- Make sure you saved all files
- Check that `paymentRoutes` is imported in server.js
- Verify `paymentRoutes.js` exists and exports the router

#### Issue 2: "Cannot find module 'paystack'"
**Solution:**
```bash
cd backend
npm install paystack
```

#### Issue 3: "PAYSTACK_SECRET_KEY is not defined"
**Solution:**
- Create/update `.env` file in backend directory
- Add `PAYSTACK_SECRET_KEY=sk_test_...`
- Restart server

#### Issue 4: Server crashes on startup
**Solution:**
- Check server console for error messages
- Verify all required files exist
- Check for syntax errors in payment-related files

### Quick Test

1. **Check if server is running:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"success":true,"message":"Server is running"}`

2. **Check if payment route exists:**
   ```bash
   curl -X POST http://localhost:3000/api/payments/initialize \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"orderId": "test"}'
   ```
   Should return an error about order not found (not "Cannot POST")

### Still Not Working?

1. **Check server.js** - Make sure paymentRoutes is imported and registered
2. **Check paymentRoutes.js** - Verify the file exists and exports router
3. **Check paymentController.js** - Verify all functions are exported
4. **Check config/paystack.js** - Verify it can load without errors
5. **Restart server** - Always restart after making changes

### Need Help?

Check:
- Server console for error messages
- Network tab in browser/Postman for actual response
- Verify you're using POST (not GET) method
- Verify Authorization header is included
- Verify Content-Type is application/json

