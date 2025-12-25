// backend/login-admin.js - Login and get admin token
const ADMIN_EMAIL = 'gianosamsung@gmail.com';
const ADMIN_PASSWORD = 'Admin@LX2024';
const BASE_URL = 'http://localhost:3000/api';

console.log('🔐 Logging in as admin...\n');

const loginAdmin = async () => {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Login successful!\n');
            console.log('🔑 ADMIN TOKEN:');
            console.log('━'.repeat(80));
            console.log(result.token);
            console.log('━'.repeat(80));
            console.log('\n👤 User Info:');
            console.log('   Name:', result.user.firstname, result.user.lastname);
            console.log('   Email:', result.user.email);
            console.log('   Role:', result.user.role);
            console.log('   ID:', result.user.id);

            console.log('\n💡 Usage in Postman/Thunder Client:');
            console.log('   Header: Authorization');
            console.log('   Value: Bearer ' + result.token);

            console.log('\n📝 Example cURL:');
            console.log(`   curl -X GET http://localhost:3000/api/user/profile \\`);
            console.log(`     -H "Authorization: Bearer ${result.token}"`);

        } else {
            console.log('❌ Login failed:', result.message);
            console.log('\n💡 Possible solutions:');
            console.log('   1. Make sure the server is running: node backend/server.js');
            console.log('   2. Create admin account first: node backend/seed-admin.js');
            console.log('   3. Check if MongoDB is connected');
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('\n💡 Make sure the server is running:');
        console.log('   node backend/server.js');
    }
};

loginAdmin();
