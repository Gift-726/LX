# TypeScript Migration Troubleshooting Guide

## Common Issues When Running `npm run dev`

### Issue 1: Module Not Found Errors

**Error:**
```
Cannot find module './config/db'
Error: Cannot find module './routes/authRoutes'
```

**Solution:**
- Make sure all `.ts` files exist (not `.js`)
- Check that imports use `.ts` extension or no extension (TypeScript handles this)
- Verify `tsconfig.json` is correct

### Issue 2: Type Errors

**Error:**
```
Type 'X' is not assignable to type 'Y'
Property 'X' does not exist on type 'Y'
```

**Solution:**
```bash
# Run type checking to see all errors
npm run type-check
```

### Issue 3: ts-node-dev Not Found

**Error:**
```
'ts-node-dev' is not recognized as an internal or external command
```

**Solution:**
```bash
# Reinstall dependencies
npm install
```

### Issue 4: MongoDB Connection Issues

**Error:**
```
MongoDB connection error: ...
```

**Solution:**
- Check `.env` file has `MONGO_URI` or `MONGODB_URI`
- Verify MongoDB is running
- Check connection string format

### Issue 5: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change PORT in .env file
PORT=3001
```

### Issue 6: Environment Variables Not Loading

**Error:**
```
MongoDB URI is not defined in environment variables
```

**Solution:**
- Create `.env` file in `backend/` directory
- Add required variables:
  ```env
  MONGO_URI=mongodb://localhost:27017/lx
  JWT_SECRET=your-secret-key
  PORT=3000
  ```

## Quick Diagnostic Commands

### 1. Check TypeScript Compilation
```bash
npm run type-check
```

### 2. Check for Linter Errors
```bash
# If you have ESLint configured
npx eslint . --ext .ts
```

### 3. Verify All Files Are TypeScript
```bash
# Windows PowerShell
Get-ChildItem -Recurse -Filter *.js | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch 'dist' }
```

### 4. Test Server Startup
```bash
npm run dev
```

Expected output:
```
✅ MongoDB connected: localhost
✓ Email service ready
✓ Server running on port 3000
✓ Health check: http://localhost:3000/health
```

## Verification Checklist

- [ ] All `.js` files removed (except node_modules)
- [ ] All `.ts` files exist
- [ ] `tsconfig.json` is valid
- [ ] `package.json` scripts are correct
- [ ] `.env` file exists with required variables
- [ ] MongoDB is running
- [ ] Dependencies installed (`npm install`)

## Getting Help

If you encounter an error:

1. **Copy the full error message**
2. **Check which file is causing the issue**
3. **Run `npm run type-check` to see TypeScript errors**
4. **Verify the file exists and is a `.ts` file**

## Common Fixes

### Fix Import Errors
```typescript
// ❌ Wrong
import User from './models/User.js';

// ✅ Correct
import User from './models/User';
```

### Fix Type Errors
```typescript
// ❌ Wrong
const user: any = await User.findById(id);

// ✅ Correct
const user = await User.findById(id);
```

### Fix Async/Await Issues
```typescript
// ❌ Wrong
connectDB();

// ✅ Correct
connectDB().catch((error) => {
  console.error('Database connection failed:', error);
  process.exit(1);
});
```
