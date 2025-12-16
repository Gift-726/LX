// backend/test-fallback.js
require('dotenv').config();

// Store original env vars
const originalUser = process.env.EMAIL_USER;
const originalPass = process.env.EMAIL_PASSWORD;

console.log('🧪 Testing Ethereal Fallback Mechanism...\n');

// 1. Simulate Bad Credentials
console.log('1️⃣  Simulating Bad Gmail Credentials...');
process.env.EMAIL_USER = 'invalid@gmail.com';
process.env.EMAIL_PASSWORD = 'wrong_password';

// Clear require cache to ensure email.js re-initializes
delete require.cache[require.resolve('./config/email')];

const { sendVerificationCode } = require('./config/email');

const testFallback = async () => {
    try {
        console.log('   Attempting to send email...');
        const result = await sendVerificationCode('test@example.com', '1234');

        if (result.success && result.previewUrl) {
            console.log('\n✅ Fallback SUCCESS!');
            console.log('   Email sent via Ethereal despite bad Gmail credentials.');
            console.log('   Preview URL:', result.previewUrl);
        } else {
            console.log('\n❌ Fallback FAILED.');
            console.log('   Result:', result);
        }
    } catch (error) {
        console.error('\n❌ Unexpected Error:', error);
    } finally {
        // Restore env vars (though process will exit)
        process.env.EMAIL_USER = originalUser;
        process.env.EMAIL_PASSWORD = originalPass;
    }
};

testFallback();
