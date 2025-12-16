// backend/seed-admin.js - Create admin account and sample data
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

const ADMIN_EMAIL = 'gianosamsung@gmail.com';
const ADMIN_PASSWORD = 'Admin@McGeorge2024';

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Create Admin Account
        console.log('\n📝 Creating admin account...');

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

        if (existingAdmin) {
            console.log('⚠️  Admin account already exists');
        } else {
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

            await User.create({
                firstname: 'Admin',
                lastname: 'McGeorge',
                email: ADMIN_EMAIL,
                phone: '1234567890',
                password: hashedPassword,
                role: 'admin',
                isVerified: true  // Admin is pre-verified
            });

            console.log('✅ Admin account created');
            console.log('   Email:', ADMIN_EMAIL);
            console.log('   Password:', ADMIN_PASSWORD);
        }

        // 2. Create Sample Categories
        console.log('\n📦 Creating sample categories...');

        const categoryData = [
            { name: 'Men', image: 'https://via.placeholder.com/150' },
            { name: 'Women', image: 'https://via.placeholder.com/150' },
            { name: 'Kids', image: 'https://via.placeholder.com/150' },
            { name: 'Accessories', image: 'https://via.placeholder.com/150' },
            { name: 'Winter', image: 'https://via.placeholder.com/150' }
        ];

        for (const cat of categoryData) {
            const existing = await Category.findOne({ name: cat.name });
            if (!existing) {
                await Category.create(cat);
                console.log(`   ✅ Created category: ${cat.name}`);
            }
        }

        // 3. Create Sample Products
        console.log('\n🛍️  Creating sample products...');

        const menCategory = await Category.findOne({ name: 'Men' });
        const womenCategory = await Category.findOne({ name: 'Women' });
        const admin = await User.findOne({ email: ADMIN_EMAIL });

        const productData = [
            {
                title: 'Aayush Rawat',
                description: 'Premium traditional wear for special occasions',
                price: 999.99,
                currency: 'NGN',
                discountPercentage: 0,
                category: menCategory._id,
                images: ['https://via.placeholder.com/400'],
                tags: ['Men', 'Traditional', 'Premium'],
                stock: 50,
                rating: 4.5,
                createdBy: admin._id
            },
            {
                title: 'Italian Suite',
                description: 'Elegant Italian-style business suit',
                price: 2999.99,
                currency: 'NGN',
                discountPercentage: 20,
                category: menCategory._id,
                images: ['https://via.placeholder.com/400'],
                tags: ['Men', 'Formal', 'Business'],
                stock: 30,
                rating: 4.8,
                createdBy: admin._id
            },
            {
                title: 'Basics Collection',
                description: 'Essential wardrobe basics',
                price: 250.99,
                currency: 'NGN',
                discountPercentage: 0,
                category: womenCategory._id,
                images: ['https://via.placeholder.com/400'],
                tags: ['Women', 'Casual', 'Basics'],
                stock: 100,
                rating: 4.2,
                createdBy: admin._id
            },
            {
                title: 'Bottoms Collection',
                description: 'Comfortable and stylish bottoms',
                price: 350.99,
                currency: 'NGN',
                discountPercentage: 0,
                category: womenCategory._id,
                images: ['https://via.placeholder.com/400'],
                tags: ['Women', 'Bottoms', 'Casual'],
                stock: 75,
                rating: 4.3,
                createdBy: admin._id
            }
        ];

        for (const prod of productData) {
            const existing = await Product.findOne({ title: prod.title });
            if (!existing) {
                await Product.create(prod);
                console.log(`   ✅ Created product: ${prod.title}`);
            }
        }

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📋 Summary:');
        console.log('   Admin Email:', ADMIN_EMAIL);
        console.log('   Admin Password:', ADMIN_PASSWORD);
        console.log('   Categories:', await Category.countDocuments());
        console.log('   Products:', await Product.countDocuments());

        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();
