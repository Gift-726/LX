// backend/test-api.js - Test all API endpoints
require('dotenv').config();

const BASE_URL = 'http://localhost:3000/api';

// Test credentials
const ADMIN_EMAIL = 'gianosamsung@gmail.com';
const ADMIN_PASSWORD = 'Admin@McGeorge2024';

let adminToken = '';
let userToken = '';
let categoryId = '';
let productId = '';

console.log('🧪 Testing McGeorge LX API...\n');

// Helper function to make requests
const request = async (method, endpoint, data = null, token = null) => {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return { status: response.status, data: result };
    } catch (error) {
        return { status: 500, error: error.message };
    }
};

const runTests = async () => {
    try {
        // 1. Test Admin Login
        console.log('1️⃣  Testing Admin Login...');
        const loginResult = await request('POST', '/auth/login', {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        if (loginResult.data.success) {
            adminToken = loginResult.data.token;
            console.log('   ✅ Admin login successful');
            console.log('   Token:', adminToken.substring(0, 20) + '...');
        } else {
            console.log('   ❌ Admin login failed:', loginResult.data.message);
            console.log('   💡 Run: node backend/seed-admin.js to create admin account');
            return;
        }

        // 2. Test Get Profile
        console.log('\n2️⃣  Testing Get Profile...');
        const profileResult = await request('GET', '/user/profile', null, adminToken);
        if (profileResult.data.success) {
            console.log('   ✅ Profile retrieved');
            console.log('   Role:', profileResult.data.user.role);
        } else {
            console.log('   ❌ Failed:', profileResult.data.message);
        }

        // 3. Test Get Categories
        console.log('\n3️⃣  Testing Get Categories...');
        const categoriesResult = await request('GET', '/categories');
        if (categoriesResult.data.success) {
            console.log('   ✅ Categories retrieved:', categoriesResult.data.categories.length);
            if (categoriesResult.data.categories.length > 0) {
                categoryId = categoriesResult.data.categories[0]._id;
            }
        } else {
            console.log('   ❌ Failed:', categoriesResult.data.message);
        }

        // 4. Test Create Category (Admin)
        console.log('\n4️⃣  Testing Create Category (Admin)...');
        const newCategoryResult = await request('POST', '/categories', {
            name: 'Test Category ' + Date.now(),
            image: 'https://via.placeholder.com/150'
        }, adminToken);

        if (newCategoryResult.data.success) {
            console.log('   ✅ Category created');
            categoryId = newCategoryResult.data.category._id;
        } else {
            console.log('   ❌ Failed:', newCategoryResult.data.message);
        }

        // 5. Test Create Product (Admin)
        console.log('\n5️⃣  Testing Create Product (Admin)...');
        if (!categoryId) {
            console.log('   ⚠️  No category ID available, skipping...');
        } else {
            const newProductResult = await request('POST', '/products', {
                title: 'Test Product ' + Date.now(),
                description: 'This is a test product',
                price: 499.99,
                category: categoryId,
                images: ['https://via.placeholder.com/400'],
                tags: ['Test', 'Sample'],
                stock: 10
            }, adminToken);

            if (newProductResult.data.success) {
                console.log('   ✅ Product created');
                productId = newProductResult.data.product._id;
            } else {
                console.log('   ❌ Failed:', newProductResult.data.message);
            }
        }

        // 6. Test Get Products
        console.log('\n6️⃣  Testing Get Products...');
        const productsResult = await request('GET', '/products');
        if (productsResult.data.success) {
            console.log('   ✅ Products retrieved:', productsResult.data.products.length);
        } else {
            console.log('   ❌ Failed:', productsResult.data.message);
        }

        // 7. Test Get Recommended Products
        console.log('\n7️⃣  Testing Get Recommended Products...');
        const recommendedResult = await request('GET', '/products/recommended');
        if (recommendedResult.data.success) {
            console.log('   ✅ Recommended products retrieved:', recommendedResult.data.products.length);
        } else {
            console.log('   ❌ Failed:', recommendedResult.data.message);
        }

        // 8. Test Search History
        console.log('\n8️⃣  Testing Search History...');
        const saveSearchResult = await request('POST', '/user/search-history', {
            query: 'test search'
        }, adminToken);

        if (saveSearchResult.data.success) {
            console.log('   ✅ Search history saved');
        } else {
            console.log('   ❌ Failed:', saveSearchResult.data.message);
        }

        const getSearchResult = await request('GET', '/user/search-history', null, adminToken);
        if (getSearchResult.data.success) {
            console.log('   ✅ Search history retrieved:', getSearchResult.data.history.length);
        } else {
            console.log('   ❌ Failed:', getSearchResult.data.message);
        }

        // 9. Test Notifications
        console.log('\n9️⃣  Testing Notifications...');
        const notificationsResult = await request('GET', '/user/notifications', null, adminToken);
        if (notificationsResult.data.success) {
            console.log('   ✅ Notifications retrieved:', notificationsResult.data.notifications.length);
        } else {
            console.log('   ❌ Failed:', notificationsResult.data.message);
        }

        const unreadCountResult = await request('GET', '/user/notifications/unread-count', null, adminToken);
        if (unreadCountResult.data.success) {
            console.log('   ✅ Unread count:', unreadCountResult.data.count);
        } else {
            console.log('   ❌ Failed:', unreadCountResult.data.message);
        }

        // 10. Test Non-Admin Access (should fail)
        console.log('\n🔒 Testing Access Control...');
        console.log('   Testing product creation without admin token...');
        const unauthorizedResult = await request('POST', '/products', {
            title: 'Unauthorized Product',
            description: 'Should fail',
            price: 99.99,
            category: categoryId
        });

        if (unauthorizedResult.status === 401 || unauthorizedResult.status === 403) {
            console.log('   ✅ Access control working (unauthorized request blocked)');
        } else {
            console.log('   ❌ Access control issue - unauthorized request succeeded');
        }

        console.log('\n✅ All tests completed!');
        console.log('\n📋 Summary:');
        console.log('   Admin Email:', ADMIN_EMAIL);
        console.log('   Admin Password:', ADMIN_PASSWORD);
        console.log('   Base URL:', BASE_URL);

    } catch (error) {
        console.error('\n❌ Test error:', error);
    }
};

// Check if server is running
console.log('Checking if server is running...');
fetch(`${BASE_URL}/categories`)
    .then(() => {
        console.log('✅ Server is running\n');
        runTests();
    })
    .catch(() => {
        console.log('❌ Server is not running!');
        console.log('💡 Start the server first: node backend/server.js');
    });
