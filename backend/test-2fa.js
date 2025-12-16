// backend/test-2fa.js - Test 2FA authentication flow
const BASE_URL = 'http://localhost:3000/api';

const testEmail = `test${Date.now()}@example.com`;
const testPassword = 'Test@123';

console.log('🧪 Testing 2FA Authentication Flow...\n');
console.log('Test Email:', testEmail);
console.log('Test Password:', testPassword);
console.log('');

let verificationCode = '';

const test2FA = async () => {
    try {
        // ========================================
        // REGISTRATION FLOW
        // ========================================
        console.log('📝 STEP 1: Registration (sends 2FA code)');
        console.log('━'.repeat(60));

        const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstname: 'Test',
                lastname: 'User',
                email: testEmail,
                phone: '1234567890',
                password: testPassword,
                confirmPassword: testPassword
            })
        });

        const registerData = await registerResponse.json();
        console.log('Response:', JSON.stringify(registerData, null, 2));

        if (!registerData.success) {
            console.log('\n❌ Registration failed!');
            return;
        }

        console.log('\n✅ Registration initiated!');
        console.log('📧 Check your email for the 6-digit code');

        if (registerData.previewUrl) {
            console.log('🔗 Ethereal Preview:', registerData.previewUrl);
            console.log('💡 Open this URL to see the verification code');
        }

        // Prompt for code
        console.log('\n━'.repeat(60));
        console.log('⏸️  PAUSED: Please enter the 6-digit code from your email');
        console.log('━'.repeat(60));
        console.log('\n💡 To continue testing:');
        console.log('   1. Check your email (or Ethereal preview URL above)');
        console.log('   2. Copy the 6-digit code');
        console.log('   3. Run this in Node.js:');
        console.log(`\n   const code = "YOUR_CODE_HERE";`);
        console.log(`   fetch("${BASE_URL}/auth/verify-registration", {`);
        console.log(`     method: "POST",`);
        console.log(`     headers: { "Content-Type": "application/json" },`);
        console.log(`     body: JSON.stringify({ email: "${testEmail}", code })`);
        console.log(`   }).then(r => r.json()).then(console.log);`);

        console.log('\n\n📋 Quick Test Commands:');
        console.log('━'.repeat(60));
        console.log('\n# Verify Registration (replace 123456 with actual code):');
        console.log(`curl -X POST ${BASE_URL}/auth/verify-registration \\`);
        console.log(`  -H "Content-Type: application/json" \\`);
        console.log(`  -d '{"email":"${testEmail}","code":"123456"}'`);

        console.log('\n\n# After verification, test login:');
        console.log(`curl -X POST ${BASE_URL}/auth/login \\`);
        console.log(`  -H "Content-Type: application/json" \\`);
        console.log(`  -d '{"email":"${testEmail}","password":"${testPassword}"}'`);

        console.log('\n\n# Then verify login code:');
        console.log(`curl -X POST ${BASE_URL}/auth/verify-login \\`);
        console.log(`  -H "Content-Type: application/json" \\`);
        console.log(`  -d '{"email":"${testEmail}","code":"654321"}'`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\n💡 Make sure the server is running:');
        console.log('   node backend/server.js');
    }
};

// Check if server is running
console.log('Checking if server is running...');
fetch(`${BASE_URL}/categories`)
    .then(() => {
        console.log('✅ Server is running\n');
        console.log('━'.repeat(60));
        test2FA();
    })
    .catch(() => {
        console.log('❌ Server is not running!');
        console.log('💡 Start the server first: node backend/server.js');
    });
