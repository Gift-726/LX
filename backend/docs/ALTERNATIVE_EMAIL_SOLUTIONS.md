# 🔧 Alternative Email Solution - Using Ethereal (Testing)

Since Gmail App Passwords are causing issues, let's use **Ethereal Email** for testing. It's a fake SMTP service perfect for development.

## ✅ Quick Setup (No Gmail needed!)

### **Option 1: Use Ethereal (Recommended for Testing)**

Ethereal creates a fake inbox where you can see all sent emails. Perfect for development!

**Update your `config/email.js`:**

```javascript
// config/email.js
const nodemailer = require("nodemailer");

// For development: Create test account automatically
let transporter;

const createTestAccount = async () => {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log("✅ Email service ready (Ethereal Test Account)");
    console.log("   Preview emails at: https://ethereal.email/messages");
    return true;
  } catch (error) {
    console.error("❌ Failed to create test account:", error.message);
    return false;
  }
};

// Initialize on startup
createTestAccount();

const sendVerificationCode = async (email, code) => {
  if (!transporter) {
    await createTestAccount();
  }

  const mailOptions = {
    from: '"McGeorge LX" <noreply@mcgeorgelx.com>',
    to: email,
    subject: "Password Reset Verification Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 50px auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; color: #333; }
          .code-box { background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
          .code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p>You requested to reset your password. Use the code below to proceed:</p>
          </div>
          <div class="code-box">
            <p style="margin: 0; color: #666;">Your verification code is:</p>
            <div class="code">${code}</div>
          </div>
          <p style="text-align: center; color: #666;">This code will expire in <strong>10 minutes</strong>.</p>
          <p style="text-align: center; color: #666;">If you didn't request this, please ignore this email.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} McGeorge LX. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    // Get preview URL for Ethereal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    
    console.log("✅ Email sent successfully!");
    console.log("   Preview URL:", previewUrl);
    
    return { success: true, previewUrl };
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationCode,
};
```

**Benefits:**
- ✅ No Gmail setup needed
- ✅ Works immediately
- ✅ View emails in browser
- ✅ Perfect for testing
- ✅ No authentication issues

---

## 🎯 Option 2: Use Mailtrap (Professional Testing)

Mailtrap is a professional email testing service.

1. **Sign up**: https://mailtrap.io (Free tier available)
2. **Get credentials** from your inbox
3. **Update .env**:
```env
EMAIL_HOST='smtp.mailtrap.io'
EMAIL_PORT=2525
EMAIL_USER='your-mailtrap-username'
EMAIL_PASSWORD='your-mailtrap-password'
```

4. **Update config/email.js**:
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

---

## 🚀 Option 3: Try SendGrid (Production Ready)

SendGrid offers 100 free emails/day.

1. **Sign up**: https://sendgrid.com
2. **Create API Key**
3. **Install**: `npm install @sendgrid/mail`
4. **Update .env**: `SENDGRID_API_KEY='your-api-key'`

**Create `config/sendgrid.js`:**
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationCode = async (email, code) => {
  const msg = {
    to: email,
    from: 'noreply@mcgeorgelx.com', // Use your verified sender
    subject: 'Password Reset Verification Code',
    html: `<h1>Your code: ${code}</h1>`,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendVerificationCode };
```

---

## 💡 Recommended: Use Ethereal for Now

For development and testing, **Ethereal is the best choice** because:
- No signup required
- Works instantly
- No authentication issues
- You can see all emails in browser

Once you're ready for production, switch to:
- **SendGrid** (100 emails/day free)
- **Mailgun** (Good deliverability)
- **Amazon SES** (Very cheap)

---

## 🔄 Quick Switch to Ethereal

I can update your code to use Ethereal right now. It will:
- ✅ Work immediately
- ✅ Show preview URLs in console
- ✅ Let you test the full flow
- ✅ No Gmail setup needed

Would you like me to switch to Ethereal for testing?
