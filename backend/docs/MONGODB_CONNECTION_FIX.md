# 🔧 MongoDB Connection Fix Guide

## ❌ Error You're Seeing

```
MongoServerSelectionError: Socket 'secureConnect' timed out after 30586ms
type: 'ReplicaSetNoPrimary'
```

This means your application cannot connect to MongoDB Atlas.

---

## ✅ Quick Fixes

### **Fix 1: Whitelist Your IP Address in MongoDB Atlas**

This is the **most common cause** of connection timeouts.

1. **Go to MongoDB Atlas Dashboard:**
   - Visit: https://cloud.mongodb.com/
   - Sign in to your account

2. **Navigate to Network Access:**
   - Click on **"Network Access"** in the left sidebar
   - Or go to: **Security → Network Access**

3. **Add Your IP Address:**
   - Click **"Add IP Address"** button
   - Click **"Add Current IP Address"** (recommended)
   - Or manually enter your IP: `0.0.0.0/0` (⚠️ **Only for development - allows all IPs**)
   - Click **"Confirm"**

4. **Wait 1-2 minutes** for changes to propagate

5. **Restart your server:**
   ```bash
   npm run dev
   ```

---

### **Fix 2: Verify Your Connection String**

1. **Check your `.env` file:**
   ```env
   MONGODB_URI='mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority'
   ```

2. **Get the correct connection string from MongoDB Atlas:**
   - Go to: **Clusters → Connect**
   - Select: **"Connect your application"**
   - Copy the connection string
   - Replace `<password>` with your actual database password
   - Replace `<database>` with your database name (or remove it)

3. **Update `.env` file** with the correct connection string

---

### **Fix 3: Check Database User Credentials**

1. **Go to MongoDB Atlas:**
   - **Security → Database Access**

2. **Verify your database user:**
   - Make sure the username and password match your connection string
   - If unsure, create a new database user:
     - Click **"Add New Database User"**
     - Choose **"Password"** authentication
     - Set username and password
     - Set privileges: **"Atlas admin"** (for development) or specific database access
     - Click **"Add User"**

3. **Update your connection string** with the new credentials

---

### **Fix 4: Check Cluster Status**

1. **Go to MongoDB Atlas Dashboard**
2. **Check your cluster:**
   - Make sure the cluster is **running** (not paused)
   - If paused, click **"Resume"** to start it
   - Wait for cluster to fully start (2-3 minutes)

---

### **Fix 5: Network/Firewall Issues**

If you're behind a corporate firewall or VPN:

1. **Try disconnecting VPN** temporarily
2. **Check if your firewall is blocking MongoDB ports:**
   - MongoDB Atlas uses port **27017** (standard) or **443** (SRV)
   - Make sure these ports are not blocked

3. **Try from a different network** (mobile hotspot) to test if it's network-specific

---

## 🔍 Verify Your Setup

### **Test 1: Check Connection String Format**

Your `MONGODB_URI` should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Common mistakes:**
- ❌ Missing `mongodb+srv://` prefix
- ❌ Incorrect password (with special characters not URL-encoded)
- ❌ Missing database name or query parameters

### **Test 2: Test Connection from MongoDB Atlas**

1. Go to **Clusters → Connect → Connect with MongoDB Compass**
2. Copy the connection string
3. Try connecting with MongoDB Compass desktop app
4. If Compass works but your app doesn't, it's likely an IP whitelist issue

---

## 📝 Updated Connection Configuration

I've updated the database configuration with:

✅ **Increased timeouts** (60 seconds instead of 30)
✅ **Better connection pooling** (5-10 connections)
✅ **Retry logic** for failed operations
✅ **Helpful error messages** with troubleshooting tips
✅ **Non-blocking startup** (server starts even if DB connection fails initially)

The server will now:
- Try to connect with longer timeouts
- Show helpful error messages
- Continue running even if initial connection fails
- Retry connections automatically

---

## 🚨 Still Not Working?

If you've tried all the above:

1. **Check MongoDB Atlas Status:**
   - Visit: https://status.mongodb.com/
   - Make sure there are no outages

2. **Verify Connection String:**
   - Make sure there are no extra spaces or quotes
   - Special characters in password should be URL-encoded
   - Example: `@` becomes `%40`, `#` becomes `%23`

3. **Try Creating a New Cluster:**
   - Sometimes clusters can have configuration issues
   - Create a new free tier cluster and test with that

4. **Check Server Logs:**
   - Look for more detailed error messages
   - The new configuration will show specific connection issues

---

## ✅ Success Indicators

When it's working, you should see:

```
🔄 Connecting to MongoDB...
✅ MongoDB connected: ac-j0waup4-shard-00-00.zegwrle.mongodb.net
📊 Database: your-database-name
✅ Mongoose connected to MongoDB
```

---

## 💡 Pro Tips

1. **For Development:** Use `0.0.0.0/0` in Network Access (allows all IPs) - **only for local development!**

2. **For Production:** Whitelist specific IP addresses or IP ranges

3. **Connection String:** Keep it in `.env` file, never commit it to Git

4. **Password:** Use a strong password and URL-encode special characters

5. **Monitoring:** Check MongoDB Atlas dashboard regularly for connection issues

---

## 📞 Need More Help?

If the connection still fails after trying all fixes:

1. Share the **exact error message** from your console
2. Verify your **IP address is whitelisted** in MongoDB Atlas
3. Check if you can **access MongoDB Atlas dashboard** (rules out network issues)
4. Try connecting with **MongoDB Compass** to isolate the issue
