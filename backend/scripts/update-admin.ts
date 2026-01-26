// backend/scripts/update-admin.ts - Update existing admin account to be verified
import { config } from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';

config();

const ADMIN_EMAIL = 'gianosamsung@gmail.com';

const updateAdmin = async (): Promise<void> => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('✅ Connected to MongoDB');

        // Find and update admin account
        const admin = await User.findOne({ email: ADMIN_EMAIL });

        if (!admin) {
            console.log('❌ Admin account not found!');
            console.log('💡 Run: npm run seed to create admin account');
            await mongoose.connection.close();
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

        await mongoose.connection.close();
        process.exit(0);

    } catch (error: any) {
        console.error('❌ Update error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

updateAdmin();
