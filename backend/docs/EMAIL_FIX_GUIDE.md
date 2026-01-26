# 🔧 Email Authentication Fix Guide

## ❌ Error You're Seeing

```
Error: Missing credentials for "PLAIN"
code: 'EAUTH'
```

This means your Gmail App Password is not working correctly.

---

## ✅ Solution: Generate New Gmail App Password

### **Step 1: Enable 2-Factor Authentication**

1. Go to: **https://myaccount.google.com/security**
2. Scroll to "How you sign in to Google"
3. Click on **"2-Step Verification"**
4. Follow the prompts to enable it (if not already enabled)

### **Step 2: Generate App Password**

1. Go to: **https://myaccount.google.com/apppasswords**
   - Or: Google Account → Security → 2-Step Verification → App passwords

2. You might need to sign in again

3. Select app: **"Mail"**

4. Select device: **"Other (Custom name)"**
   - Enter name: `McGeorge LX Backend`

5. Click **"Generate"**

6. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)
   - ⚠️ **Important**: Copy it immediately, you won't see it again!

### **Step 3: Update .env File**

Open your `.env` file and update:

```env
EMAIL_USER='ayanogift@gmail.com'
EMAIL_PASSWORD='abcd efgh ijkl mnop'
```

**Replace with your actual 16-character App Password** (remove spaces or keep them, both work)

### **Step 4: Restart Your Server**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🔍 Verification

When you restart the server, you should see:

```
✅ Email service is ready
Server running on port 3000
```

If you see:
```
❌ Email service verification failed
```

Then the App Password is still incorrect.

---

## 🚨 Common Issues

### **Issue 1: "Sign in with App Password" page not available**

**Solution:**
- Make sure 2-Factor Authentication is enabled first
- Wait a few minutes after enabling 2FA
- Try this direct link: https://myaccount.google.com/apppasswords

### **Issue 2: App Password not working**

**Solutions:**
1. **Remove spaces** from the password in .env:
   ```env
   # Instead of: 'abcd efgh ijkl mnop'
   EMAIL_PASSWORD='abcdefghijklmnop'
   ```

2. **Regenerate** a new App Password:
   - Delete the old one
   - Create a new one
   - Update .env

3. **Check email address** is correct:
   ```env
   EMAIL_USER='ayanogift@gmail.com'  # ✅ Correct
   EMAIL_USER='ayanogift'             # ❌ Wrong
   ```

### **Issue 3: "Less secure app access"**

**Note:** Google removed this option. You **MUST** use App Passwords now.

---

## 🧪 Test After Fixing

### **1. Restart Server**
```bash
npm run dev
```

### **2. Test Forgot Password**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "ayanogift@gmail.com"}'
```

### **3. Check Your Email**
You should receive an email with a 4-digit code!

---

## 📧 Alternative: Use Different Email Provider

If Gmail is giving you trouble, you can use other providers:

### **Outlook/Hotmail**
```javascript
// In config/email.js
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### **Yahoo**
```javascript
const transporter = nodemailer.createTransport({
  service: "yahoo",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### **Custom SMTP**
```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.your-provider.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

---

## ✅ Checklist

- [ ] 2-Factor Authentication enabled on Google account
- [ ] Generated new App Password
- [ ] Copied 16-character password correctly
- [ ] Updated .env file with correct EMAIL_USER
- [ ] Updated .env file with correct EMAIL_PASSWORD
- [ ] Restarted server
- [ ] Saw "✅ Email service is ready" message
- [ ] Tested forgot-password endpoint
- [ ] Received email successfully

---

## 🎯 Quick Fix Summary

1. **Go to**: https://myaccount.google.com/apppasswords
2. **Generate** new App Password for "Mail"
3. **Copy** the 16-character password
4. **Update** .env file:
   ```env
   EMAIL_PASSWORD='your-16-char-password'
   ```
5. **Restart** server: `npm run dev`
6. **Look for**: `✅ Email service is ready`

---

## 💡 Still Not Working?

If you've tried everything and it's still not working:

1. **Double-check** the App Password was copied correctly
2. **Try removing spaces** from the password in .env
3. **Generate a new** App Password
4. **Verify** your Gmail account doesn't have any security restrictions
5. **Check** if your account requires additional verification

---

## 📞 Need Help?

Common error codes:
- `EAUTH` → Wrong username/password
- `ECONNECTION` → Network/firewall issue
- `ETIMEDOUT` → SMTP server not reachable

**The fix is almost always**: Generate a fresh App Password and update .env correctly.
