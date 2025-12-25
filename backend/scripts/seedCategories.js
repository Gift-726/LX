/**
 * Seed Script for Default Categories
 * Creates the 11 default categories as shown in the Figma design
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Category = require("../models/Category");

const defaultCategories = [
    { name: "Travel Essentials", displayOrder: 1 },
    { name: "Dresses", displayOrder: 2 },
    { name: "Basics", displayOrder: 3 },
    { name: "Body Suits", displayOrder: 4 },
    { name: "Co-ords", displayOrder: 5 },
    { name: "Tops", displayOrder: 6 },
    { name: "Bottoms", displayOrder: 7 },
    { name: "Male", displayOrder: 8 },
    { name: "Female", displayOrder: 9 },
    { name: "Kids", displayOrder: 10 },
    { name: "Accessories", displayOrder: 11 }
];

const seedCategories = async () => {
    try {
        // Check for MongoDB URI
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        
        if (!mongoUri) {
            console.error("Error: MONGO_URI not found in .env file");
            console.error("\nPlease add your MongoDB connection string to the .env file:");
            console.error("   MONGO_URI=mongodb://localhost:27017/lx");
            console.error("   OR for MongoDB Atlas:");
            console.error("   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lx");
            console.error("\nMake sure MongoDB is running if using localhost");
            process.exit(1);
        }

        console.log("Connecting to MongoDB...");
        console.log(`   URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide credentials
        
        // Connect to MongoDB
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        // Clear existing categories (optional - comment out if you want to keep existing)
        // await Category.deleteMany({});
        // console.log("🗑️  Cleared existing categories");

        // Create categories
        const createdCategories = [];
        for (const catData of defaultCategories) {
            // Check if category already exists
            let category = await Category.findOne({ name: catData.name });
            
            if (!category) {
                category = await Category.create(catData);
                console.log(`Created category: ${category.name}`);
            } else {
                // Update display order if it exists
                category.displayOrder = catData.displayOrder;
                await category.save();
                console.log(`Category already exists: ${category.name} (updated display order)`);
            }
            
            createdCategories.push(category);
        }

        console.log(`\nSuccessfully seeded ${createdCategories.length} categories`);
        console.log("\nCategories created:");
        createdCategories.forEach((cat, index) => {
            console.log(`   ${index + 1}. ${cat.name} (ID: ${cat._id})`);
        });

        process.exit(0);
    } catch (error) {
        console.error("\nError seeding categories:");
        
        if (error.name === 'MongooseServerSelectionError' || error.message.includes('ECONNREFUSED')) {
            console.error("\n🔴 MongoDB Connection Error:");
            console.error("   - MongoDB server is not running, OR");
            console.error("   - Incorrect MONGODB_URI in .env file");
            console.error("\nSolutions:");
            console.error("   1. If using local MongoDB:");
            console.error("      - Make sure MongoDB is installed and running");
            console.error("      - Start MongoDB: mongod (or use MongoDB service)");
            console.error("   2. If using MongoDB Atlas:");
            console.error("      - Check your connection string in .env");
            console.error("      - Make sure your IP is whitelisted");
            console.error("   3. Check your .env file has:");
            console.error("      MONGO_URI=your-connection-string");
        } else {
            console.error("   ", error.message);
        }
        
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedCategories();

