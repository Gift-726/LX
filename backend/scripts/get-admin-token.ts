// backend/scripts/get-admin-token.ts - Quick script to get admin token
import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';

config();

const ADMIN_EMAIL = 'gianosamsung@gmail.com';
const ADMIN_PASSWORD = 'Admin@LX2024';

const getAdminToken = async (): Promise<void> => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('✅ Connected to MongoDB\n');

        // Check if admin exists
        let admin = await User.findOne({ email: ADMIN_EMAIL });

        if (!admin) {
            console.log('📝 Admin account does not exist. Creating...');
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

            admin = await User.create({
                firstname: 'Admin',
                lastname: 'Admin',
                email: ADMIN_EMAIL,
                phone: '1234567890',
                password: hashedPassword,
                role: 'admin'
            });

            console.log('✅ Admin account created!\n');
        } else {
            console.log('✅ Admin account found!\n');
        }

        // Generate token
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET!, {
            expiresIn: '7d'
        });

        console.log('🔑 ADMIN TOKEN:');
        console.log('━'.repeat(80));
        console.log(token);
        console.log('━'.repeat(80));
        console.log('\n📋 Admin Details:');
        console.log('   Email:', ADMIN_EMAIL);
        console.log('   Password:', ADMIN_PASSWORD);
        console.log('   Role:', admin.role);
        console.log('   ID:', admin._id);

        console.log('\n💡 Usage:');
        console.log('   Authorization: Bearer ' + token);

        console.log('\n📝 Example cURL:');
        console.log(`   curl -X POST http://localhost:3000/api/products \\`);
        console.log(`     -H "Authorization: Bearer ${token}" \\`);
        console.log(`     -H "Content-Type: application/json" \\`);
        console.log(`     -d '{"title":"Test Product","description":"Test","price":100,"category":"<categoryId>"}'`);

        await mongoose.connection.close();
        process.exit(0);

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

getAdminToken();
