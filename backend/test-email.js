// test-email.js - Quick email test script
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n🧪 Testing Email Configuration...\n');

// Show what we have
console.log('Environment Variables:');
console.log('  EMAIL_USER:', process.env.EMAIL_USER);
console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');
console.log('  Password Length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
console.log('');

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Test connection
console.log('Testing SMTP connection...\n');

transporter.verify(function (error, success) {
    if (error) {
        console.log('❌ Connection Failed!');
        console.log('Error:', error.message);
        console.log('\nPossible issues:');
        console.log('1. App Password is incorrect');
        console.log('2. 2-Factor Authentication not enabled');
        console.log('3. Email address is wrong');
        console.log('\nSteps to fix:');
        console.log('1. Go to: https://myaccount.google.com/apppasswords');
        console.log('2. Generate a NEW App Password');
        console.log('3. Update .env file with the new password');
        console.log('4. Make sure there are no extra spaces or quotes');
    } else {
        console.log('✅ Connection Successful!');
        console.log('Email service is ready to send messages.');

        // Try sending a test email
        console.log('\n📧 Sending test email...\n');

        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: 'Test Email from McGeorge LX',
            text: 'If you receive this, your email configuration is working perfectly!',
            html: '<h1>Success!</h1><p>Your email configuration is working perfectly!</p>'
        }, (err, info) => {
            if (err) {
                console.log('❌ Failed to send test email:', err.message);
            } else {
                console.log('✅ Test email sent successfully!');
                console.log('   Message ID:', info.messageId);
                console.log('   Check your inbox:', process.env.EMAIL_USER);
            }
        });
    }
});
