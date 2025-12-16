// test-gmail-config.js - Diagnostic script for Gmail configuration
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n🔍 Gmail Configuration Diagnostic Tool\n');
console.log('=' .repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || '❌ NOT SET'}`);
console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : '❌ NOT SET'}`);
console.log(`   Password Length: ${process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0}`);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('\n❌ ERROR: EMAIL_USER and EMAIL_PASSWORD must be set in .env file');
  console.error('\n📝 Steps to fix:');
  console.error('1. Create/update .env file in backend directory');
  console.error('2. Add: EMAIL_USER=\'your-email@gmail.com\'');
  console.error('3. Add: EMAIL_PASSWORD=\'your-16-char-app-password\'');
  console.error('4. Restart this script');
  process.exit(1);
}

// Clean credentials
const cleanUser = process.env.EMAIL_USER.trim().replace(/['"]/g, '');
const cleanPassword = process.env.EMAIL_PASSWORD.trim().replace(/['"]/g, '');

console.log('\n🧹 Cleaned Credentials:');
console.log(`   User: ${cleanUser}`);
console.log(`   Password Length: ${cleanPassword.length}`);

// Test configurations
const configs = [
  {
    name: "Gmail SMTP (Port 587 - STARTTLS)",
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
    name: "Gmail SMTP (Port 465 - SSL)",
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
    name: "Gmail Service (Auto-detect)",
    config: {
      service: "gmail",
      auth: {
        user: cleanUser,
        pass: cleanPassword,
      }
    }
  }
];

let successConfig = null;

// Test each configuration
for (const { name, config } of configs) {
  console.log(`\n🧪 Testing: ${name}...`);
  try {
    const transporter = nodemailer.createTransport(config);
    
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection timeout")), 15000)
      )
    ]);

    console.log(`   ✅ ${name} - SUCCESS!`);
    successConfig = { name, config, transporter };
    break;
  } catch (error) {
    console.log(`   ❌ ${name} - FAILED`);
    console.log(`      Error: ${error.message}`);
    if (error.code) {
      console.log(`      Code: ${error.code}`);
    }
    if (error.response) {
      console.log(`      Response: ${error.response}`);
    }
  }
}

if (!successConfig) {
  console.error('\n❌ ALL Gmail configurations failed!');
  console.error('\n🔧 Troubleshooting Steps:');
  console.error('1. Verify 2-Factor Authentication is enabled:');
  console.error('   https://myaccount.google.com/security');
  console.error('');
  console.error('2. Generate a NEW App Password:');
  console.error('   https://myaccount.google.com/apppasswords');
  console.error('   - Select "Mail"');
  console.error('   - Select "Other (Custom name)"');
  console.error('   - Name it: "McGeorge LX"');
  console.error('   - Copy the 16-character password');
  console.error('');
  console.error('3. Update .env file:');
  console.error(`   EMAIL_USER='${cleanUser}'`);
  console.error('   EMAIL_PASSWORD=\'your-16-char-app-password\'');
  console.error('');
  console.error('4. Make sure:');
  console.error('   - No extra spaces or quotes');
  console.error('   - Password is exactly 16 characters (or 16 with spaces)');
  console.error('   - Email is your full Gmail address');
  console.error('');
  console.error('5. Restart this script after updating .env');
  process.exit(1);
}

// If we got here, Gmail is working - try sending a test email
console.log('\n📧 Sending test email...');
try {
  const info = await successConfig.transporter.sendMail({
    from: `"McGeorge LX Test" <${cleanUser}>`,
    to: cleanUser, // Send to yourself
    subject: 'Gmail Configuration Test - McGeorge LX',
    html: `
      <h1>✅ Gmail Configuration Successful!</h1>
      <p>Your Gmail email service is working correctly.</p>
      <p>This email was sent using: <strong>${successConfig.name}</strong></p>
      <p>You can now use Gmail for 2FA authentication in your application.</p>
    `
  });

  console.log('   ✅ Test email sent successfully!');
  console.log(`   Message ID: ${info.messageId}`);
  console.log(`   Response: ${info.response || 'Sent'}`);
  console.log(`\n📬 Check your inbox: ${cleanUser}`);
  console.log('\n✅ Gmail configuration is working perfectly!');
  console.log(`   Working configuration: ${successConfig.name}`);
} catch (error) {
  console.error('   ❌ Failed to send test email:', error.message);
  if (error.code) {
    console.error(`   Error code: ${error.code}`);
  }
  if (error.response) {
    console.error(`   SMTP Response: ${error.response}`);
  }
  console.error('\n⚠️ Connection works but sending failed. Check Gmail account settings.');
  process.exit(1);
}

