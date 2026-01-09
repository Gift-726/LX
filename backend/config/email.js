/**
 * Email Service Configuration
 * Handles Gmail email delivery for 2FA and password reset
 * Falls back to Ethereal for testing if Gmail fails
 */

const nodemailer = require("nodemailer");

let transporter;
let isReady = false;
let isGmail = false;
let initializationPromise = null;

// Create email transporter - Gmail ONLY (no Ethereal fallback)
const createTransporter = async (forceEthereal = false) => {
  // If forcing Ethereal, skip Gmail
  if (forceEthereal) {
    try {
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
      isReady = true;
      isGmail = false;
      return true;
    } catch (error) {
      console.error("❌ Failed to create Ethereal account:", error.message);
      return false;
    }
  }

  // Gmail configuration - MUST have credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error("❌ ERROR: EMAIL_USER and EMAIL_PASSWORD must be set in .env file");
    throw new Error("Gmail credentials not configured");
  }

  // Clean the password (remove spaces, quotes, etc.)
  const cleanPassword = process.env.EMAIL_PASSWORD.trim().replace(/['"]/g, '');
  const cleanUser = process.env.EMAIL_USER.trim().replace(/['"]/g, '');

  // Try multiple Gmail configurations
  const gmailConfigs = [
    {
      name: "Gmail SMTP (Port 587)",
      config: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: cleanUser,
          pass: cleanPassword,
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        }
      }
    },
    {
      name: "Gmail SMTP (Port 465)",
      config: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: cleanUser,
          pass: cleanPassword,
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    },
    {
      name: "Gmail Service",
      config: {
        service: "gmail",
        auth: {
          user: cleanUser,
          pass: cleanPassword
        }
      }
    }
  ];

  // Try each configuration
  for (const { name, config } of gmailConfigs) {
    try {
      transporter = nodemailer.createTransport(config);

      // Test connection with timeout
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Connection timeout after 15 seconds")), 15000)
        )
      ]);

      isReady = true;
      isGmail = true;
      console.log(`✓ Email service ready (${name})`);
      return true;
    } catch (error) {
      transporter = null;
      // Continue to next configuration
    }
  }

  // If all Gmail configs failed, show error
  console.error("❌ Gmail configuration failed. Please check your credentials in .env file");

  // Only fallback to Ethereal if explicitly requested (for testing)
  throw new Error("Gmail configuration failed. Please check your credentials and try again.");
};

// Initialize transporter - ensure it's ready before use
const ensureTransporterReady = async () => {
  if (isReady && transporter && isGmail) {
    // Quick check if Gmail is still working
    try {
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Quick verify timeout")), 3000)
        )
      ]);
      return true;
    } catch (error) {
      isReady = false;
      transporter = null;
    }
  }

  // If initialization is already in progress, wait for it
  if (initializationPromise) {
    try {
      return await initializationPromise;
    } catch (error) {
      initializationPromise = null;
      throw error;
    }
  }

  // Start initialization
  try {
    initializationPromise = createTransporter(false);
    const result = await initializationPromise;
    initializationPromise = null;
    return result;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
};

// Initialize transporter on module load (but don't block if it fails)
ensureTransporterReady().catch(() => {
  // Silent initialization - will retry when first email is sent
});

// Generate email template based on type
const getEmailTemplate = (code, type = "password-reset") => {
  const templates = {
    "registration": {
      subject: "Verify Your Account - LX",
      title: "Welcome to LX!",
      message: "Thank you for registering. Please verify your email address using the code below:",
      action: "Complete Registration"
    },
    "login": {
      subject: "Login Verification Code - LX",
      title: "Login Verification",
      message: "You're logging into your account. Please enter the verification code below:",
      action: "Complete Login"
    },
    "password-reset": {
      subject: "Password Reset Verification Code - LX",
      title: "Password Reset Request",
      message: "You requested to reset your password. Use the code below to proceed:",
      action: "Reset Password"
    }
  };

  const template = templates[type] || templates["password-reset"];

  return {
    subject: template.subject,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${template.subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            color: #333;
          }
          .code-box {
            background-color: #f8f9fa;
            border: 2px dashed #007bff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            letter-spacing: 8px;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${template.title}</h1>
            <p>${template.message}</p>
          </div>
          
          <div class="code-box">
            <p style="margin: 0; color: #666;">Your verification code is:</p>
            <div class="code">${code}</div>
          </div>
          
          <p style="text-align: center; color: #666;">
            This code will expire in <strong>10 minutes</strong>.
          </p>
          
          <p style="text-align: center; color: #666;">
            If you didn't request this, please ignore this email.
          </p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} LX. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Send verification code email
const sendVerificationCode = async (email, code, type = "password-reset") => {
  try {
    // Ensure transporter is ready before sending
    const ready = await ensureTransporterReady();
    
    if (!ready || !transporter) {
      // Try to reinitialize if not ready
      const reinit = await createTransporter(false);
      if (!reinit || !transporter) {
        return {
          success: false,
          error: "Email service not available. Please check your Gmail configuration in .env file."
        };
      }
    }

    // If using Gmail, verify connection before sending
    if (isGmail && transporter) {
      try {
        await Promise.race([
          transporter.verify(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Verification timeout")), 5000)
          )
        ]);
      } catch (verifyError) {
        // Reinitialize Gmail connection
        await createTransporter(false);
        if (!transporter || !isGmail) {
          return {
            success: false,
            error: "Gmail connection failed. Please check your credentials."
          };
        }
      }
    }

    const emailTemplate = getEmailTemplate(code, type);
    const cleanUserEmail = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
    const fromEmail = isGmail && cleanUserEmail
      ? `"LX" <${cleanUserEmail}>`
      : '"LX" <noreply@lx.com>';

    // Create plain text version for better deliverability
    const plainText = `
${emailTemplate.title}

${emailTemplate.message}

Your verification code is: ${code}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

© ${new Date().getFullYear()} LX. All rights reserved.
    `.trim();

    const mailOptions = {
      from: fromEmail,
      to: email,
      replyTo: isGmail && cleanUserEmail ? cleanUserEmail : undefined,
      subject: emailTemplate.subject,
      text: plainText, // Plain text version for better deliverability
      html: emailTemplate.html,
      // Mark as important/priority to avoid spam
      priority: 'high',
      headers: {
        'X-Priority': '1', // 1 = High priority
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'LX Authentication System',
        'X-Auto-Response-Suppress': 'All', // Suppress auto-replies
        'Auto-Submitted': 'auto-generated', // Mark as system-generated
      },
      // Add message options for better deliverability
      date: new Date(),
    };

    const info = await transporter.sendMail(mailOptions);

    // Get preview URL if using Ethereal
    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
      return { success: true, previewUrl, isFallback: true };
    } else {
      return { success: true, previewUrl: null, isFallback: false };
    }
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    return { 
      success: false, 
      error: error.message,
      details: error.code || error.response || 'Unknown error'
    };
  }
};

// Verify email connection
const verifyEmailConnection = async () => {
  if (!transporter) {
    return await createTransporter();
  }
  return isReady;
};

module.exports = {
  sendVerificationCode,
  verifyEmailConnection
};
