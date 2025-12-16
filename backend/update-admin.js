// backend/update-admin.js - Update existing admin account to be verified
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_EMAIL = 'gianosamsung@gmail.com';

const updateAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find and update admin account
        const admin = await User.findOne({ email: ADMIN_EMAIL });

        if (!admin) {
            console.log('❌ Admin account not found!');
            console.log('💡 Run: node backend/seed-admin.js to create admin account');
            process.exit(1);
        }

        // Update admin to be verified
        admin.isVerified = true;
        admin.verificationCode = undefined;
        admin.verificationCodeExpiry = undefined;
        await admin.save();

        console.log('✅ Admin account updated successfully!');
        console.log('   Email:', admin.email);
        console.log('   Role:', admin.role);
        console.log('   Verified:', admin.isVerified);

        process.exit(0);

    } catch (error) {
        console.error('❌ Update error:', error);
        process.exit(1);
    }
};

updateAdmin();
