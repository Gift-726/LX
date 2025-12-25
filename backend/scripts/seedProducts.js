/**
 * Seed Script for Products
 * Creates 5-8 products for each of the 11 default categories
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");

// Product data for each category
const productsByCategory = {
    "Travel Essentials": [
        { title: "Comfortable Travel Joggers", description: "Perfect for long flights and travel days. Made with stretchy, breathable fabric.", price: 25000, stock: 50, images: ["https://via.placeholder.com/400x600?text=Travel+Joggers"], tags: ["travel", "comfort", "casual"] },
        { title: "Packable Lightweight Jacket", description: "Ultra-lightweight jacket that packs into its own pocket. Perfect for unpredictable weather.", price: 35000, stock: 30, images: ["https://via.placeholder.com/400x600?text=Packable+Jacket"], tags: ["travel", "jacket", "lightweight"] },
        { title: "Travel-Friendly Maxi Dress", description: "Wrinkle-resistant maxi dress perfect for travel. Comfortable and stylish.", price: 28000, stock: 40, images: ["https://via.placeholder.com/400x600?text=Maxi+Dress"], tags: ["travel", "dress", "comfortable"] },
        { title: "Versatile Travel Scarf", description: "Multi-purpose scarf that can be used as a blanket, pillow, or accessory.", price: 12000, stock: 60, images: ["https://via.placeholder.com/400x600?text=Travel+Scarf"], tags: ["travel", "accessory", "versatile"] },
        { title: "Quick-Dry Travel T-Shirt", description: "Moisture-wicking t-shirt that dries quickly. Perfect for active travel.", price: 15000, stock: 45, images: ["https://via.placeholder.com/400x600?text=Quick+Dry+Tee"], tags: ["travel", "activewear", "quick-dry"] },
        { title: "Travel Compression Socks", description: "Improve circulation during long flights with these comfortable compression socks.", price: 8000, stock: 70, images: ["https://via.placeholder.com/400x600?text=Compression+Socks"], tags: ["travel", "socks", "health"] },
        { title: "Foldable Travel Hat", description: "Packable sun hat that folds flat. Provides UV protection and style.", price: 10000, stock: 55, images: ["https://via.placeholder.com/400x600?text=Travel+Hat"], tags: ["travel", "hat", "sun protection"] }
    ],
    "Dresses": [
        { title: "Elegant Evening Gown", description: "Stunning floor-length gown perfect for special occasions. Flowing fabric with elegant design.", price: 45000, stock: 25, images: ["https://via.placeholder.com/400x600?text=Evening+Gown"], tags: ["formal", "elegant", "occasion"] },
        { title: "Casual Summer Sundress", description: "Light and airy sundress perfect for warm weather. Comfortable and stylish.", price: 22000, stock: 50, images: ["https://via.placeholder.com/400x600?text=Summer+Sundress"], tags: ["casual", "summer", "comfortable"] },
        { title: "Bodycon Mini Dress", description: "Fitted mini dress that hugs your curves. Perfect for a night out.", price: 28000, stock: 35, images: ["https://via.placeholder.com/400x600?text=Bodycon+Dress"], tags: ["party", "fitted", "stylish"] },
        { title: "Floral Midi Dress", description: "Beautiful floral print midi dress. Perfect for brunch or daytime events.", price: 30000, stock: 40, images: ["https://via.placeholder.com/400x600?text=Floral+Midi"], tags: ["casual", "floral", "daytime"] },
        { title: "Wrap Style Maxi Dress", description: "Flattering wrap-style maxi dress. Adjustable fit for all body types.", price: 32000, stock: 30, images: ["https://via.placeholder.com/400x600?text=Wrap+Maxi"], tags: ["maxi", "wrap", "flattering"] },
        { title: "A-Line Cocktail Dress", description: "Classic A-line silhouette perfect for cocktail parties and events.", price: 35000, stock: 28, images: ["https://via.placeholder.com/400x600?text=Cocktail+Dress"], tags: ["cocktail", "A-line", "classic"] },
        { title: "Off-Shoulder Party Dress", description: "Trendy off-shoulder dress with ruffle details. Perfect for parties.", price: 27000, stock: 38, images: ["https://via.placeholder.com/400x600?text=Off+Shoulder"], tags: ["party", "trendy", "ruffle"] }
    ],
    "Basics": [
        { title: "Classic White T-Shirt", description: "Essential white t-shirt. Soft cotton fabric, perfect fit.", price: 8000, stock: 100, images: ["https://via.placeholder.com/400x600?text=White+Tee"], tags: ["basic", "essential", "cotton"] },
        { title: "Black Crew Neck Sweater", description: "Warm and cozy black sweater. Perfect for layering.", price: 18000, stock: 60, images: ["https://via.placeholder.com/400x600?text=Black+Sweater"], tags: ["basic", "warm", "layering"] },
        { title: "Navy Blue Jeans", description: "Classic fit navy blue jeans. Comfortable and versatile.", price: 25000, stock: 70, images: ["https://via.placeholder.com/400x600?text=Navy+Jeans"], tags: ["basic", "jeans", "versatile"] },
        { title: "Gray Hoodie", description: "Comfortable gray hoodie with front pocket. Perfect for casual days.", price: 20000, stock: 55, images: ["https://via.placeholder.com/400x600?text=Gray+Hoodie"], tags: ["basic", "casual", "comfortable"] },
        { title: "White Button-Down Shirt", description: "Crisp white button-down shirt. Perfect for office or casual wear.", price: 15000, stock: 65, images: ["https://via.placeholder.com/400x600?text=Button+Down"], tags: ["basic", "office", "versatile"] },
        { title: "Black Leggings", description: "Stretchy black leggings. Perfect for workouts or casual wear.", price: 12000, stock: 80, images: ["https://via.placeholder.com/400x600?text=Black+Leggings"], tags: ["basic", "activewear", "comfortable"] }
    ],
    "Body Suits": [
        { title: "Long Sleeve Bodysuit", description: "Comfortable long sleeve bodysuit. Perfect for layering or wearing alone.", price: 18000, stock: 45, images: ["https://via.placeholder.com/400x600?text=Long+Sleeve+Bodysuit"], tags: ["bodysuit", "long sleeve", "versatile"] },
        { title: "Sleeveless Bodysuit", description: "Classic sleeveless bodysuit. Smooth fit with snap closure.", price: 15000, stock: 50, images: ["https://via.placeholder.com/400x600?text=Sleeveless+Bodysuit"], tags: ["bodysuit", "sleeveless", "classic"] },
        { title: "V-Neck Bodysuit", description: "Flattering V-neck bodysuit. Perfect for pairing with high-waisted bottoms.", price: 16000, stock: 48, images: ["https://via.placeholder.com/400x600?text=V+Neck+Bodysuit"], tags: ["bodysuit", "V-neck", "flattering"] },
        { title: "Lace Trim Bodysuit", description: "Elegant bodysuit with delicate lace trim. Perfect for special occasions.", price: 22000, stock: 35, images: ["https://via.placeholder.com/400x600?text=Lace+Bodysuit"], tags: ["bodysuit", "lace", "elegant"] },
        { title: "Turtleneck Bodysuit", description: "Warm turtleneck bodysuit. Perfect for cooler weather.", price: 20000, stock: 40, images: ["https://via.placeholder.com/400x600?text=Turtleneck+Bodysuit"], tags: ["bodysuit", "turtleneck", "warm"] },
        { title: "Off-Shoulder Bodysuit", description: "Trendy off-shoulder bodysuit. Perfect for a night out.", price: 19000, stock: 42, images: ["https://via.placeholder.com/400x600?text=Off+Shoulder+Bodysuit"], tags: ["bodysuit", "off-shoulder", "trendy"] }
    ],
    "Co-ords": [
        { title: "Floral Print Co-ord Set", description: "Matching floral print top and bottom set. Perfect for a coordinated look.", price: 35000, stock: 30, images: ["https://via.placeholder.com/400x600?text=Floral+Co+ord"], tags: ["co-ord", "floral", "matching"] },
        { title: "Striped Co-ord Outfit", description: "Classic striped co-ord set. Modern and stylish.", price: 32000, stock: 35, images: ["https://via.placeholder.com/400x600?text=Striped+Co+ord"], tags: ["co-ord", "striped", "classic"] },
        { title: "Solid Color Co-ord Set", description: "Elegant solid color co-ord set. Versatile and timeless.", price: 30000, stock: 40, images: ["https://via.placeholder.com/400x600?text=Solid+Co+ord"], tags: ["co-ord", "solid", "elegant"] },
        { title: "Denim Co-ord Set", description: "Casual denim co-ord set. Perfect for everyday wear.", price: 38000, stock: 28, images: ["https://via.placeholder.com/400x600?text=Denim+Co+ord"], tags: ["co-ord", "denim", "casual"] },
        { title: "Linen Co-ord Set", description: "Breathable linen co-ord set. Perfect for warm weather.", price: 34000, stock: 32, images: ["https://via.placeholder.com/400x600?text=Linen+Co+ord"], tags: ["co-ord", "linen", "summer"] },
        { title: "Formal Co-ord Suit", description: "Professional co-ord suit set. Perfect for office or formal events.", price: 42000, stock: 25, images: ["https://via.placeholder.com/400x600?text=Formal+Co+ord"], tags: ["co-ord", "formal", "professional"] }
    ],
    "Tops": [
        { title: "Silk Blouse", description: "Luxurious silk blouse. Perfect for office or special occasions.", price: 28000, stock: 40, images: ["https://via.placeholder.com/400x600?text=Silk+Blouse"], tags: ["blouse", "silk", "luxury"] },
        { title: "Crop Top", description: "Trendy crop top. Perfect for pairing with high-waisted bottoms.", price: 12000, stock: 55, images: ["https://via.placeholder.com/400x600?text=Crop+Top"], tags: ["crop top", "trendy", "casual"] },
        { title: "Oversized Sweatshirt", description: "Comfortable oversized sweatshirt. Perfect for lounging.", price: 22000, stock: 50, images: ["https://via.placeholder.com/400x600?text=Oversized+Sweatshirt"], tags: ["sweatshirt", "oversized", "comfortable"] },
        { title: "Tank Top", description: "Classic tank top. Perfect for layering or wearing alone.", price: 10000, stock: 60, images: ["https://via.placeholder.com/400x600?text=Tank+Top"], tags: ["tank", "basic", "versatile"] },
        { title: "Long Sleeve Blouse", description: "Elegant long sleeve blouse. Perfect for professional settings.", price: 25000, stock: 45, images: ["https://via.placeholder.com/400x600?text=Long+Sleeve+Blouse"], tags: ["blouse", "long sleeve", "professional"] },
        { title: "Off-Shoulder Top", description: "Stylish off-shoulder top. Perfect for a night out.", price: 18000, stock: 48, images: ["https://via.placeholder.com/400x600?text=Off+Shoulder+Top"], tags: ["top", "off-shoulder", "stylish"] },
        { title: "Graphic T-Shirt", description: "Fun graphic t-shirt. Express your style.", price: 14000, stock: 52, images: ["https://via.placeholder.com/400x600?text=Graphic+Tee"], tags: ["t-shirt", "graphic", "casual"] }
    ],
    "Bottoms": [
        { title: "High-Waisted Jeans", description: "Flattering high-waisted jeans. Classic and comfortable.", price: 30000, stock: 45, images: ["https://via.placeholder.com/400x600?text=High+Waist+Jeans"], tags: ["jeans", "high-waisted", "classic"] },
        { title: "Wide Leg Pants", description: "Comfortable wide leg pants. Perfect for office or casual wear.", price: 28000, stock: 40, images: ["https://via.placeholder.com/400x600?text=Wide+Leg+Pants"], tags: ["pants", "wide leg", "comfortable"] },
        { title: "Midi Skirt", description: "Elegant midi skirt. Perfect for various occasions.", price: 22000, stock: 50, images: ["https://via.placeholder.com/400x600?text=Midi+Skirt"], tags: ["skirt", "midi", "elegant"] },
        { title: "Cargo Pants", description: "Functional cargo pants with multiple pockets. Perfect for active lifestyle.", price: 32000, stock: 35, images: ["https://via.placeholder.com/400x600?text=Cargo+Pants"], tags: ["pants", "cargo", "functional"] },
        { title: "Pleated Skirt", description: "Classic pleated skirt. Timeless and elegant.", price: 25000, stock: 42, images: ["https://via.placeholder.com/400x600?text=Pleated+Skirt"], tags: ["skirt", "pleated", "classic"] },
        { title: "Jogger Pants", description: "Comfortable jogger pants. Perfect for casual wear.", price: 20000, stock: 55, images: ["https://via.placeholder.com/400x600?text=Jogger+Pants"], tags: ["pants", "jogger", "casual"] },
        { title: "Leather Pants", description: "Stylish leather pants. Perfect for a night out.", price: 45000, stock: 25, images: ["https://via.placeholder.com/400x600?text=Leather+Pants"], tags: ["pants", "leather", "stylish"] }
    ],
    "Male": [
        { title: "Men's Classic Suit", description: "Professional men's suit. Perfect for business or formal events.", price: 55000, stock: 20, images: ["https://via.placeholder.com/400x600?text=Mens+Suit"], tags: ["suit", "formal", "professional"] },
        { title: "Men's Casual Shirt", description: "Comfortable men's casual shirt. Perfect for everyday wear.", price: 18000, stock: 50, images: ["https://via.placeholder.com/400x600?text=Mens+Shirt"], tags: ["shirt", "casual", "men"] },
        { title: "Men's Chinos", description: "Classic men's chinos. Versatile and comfortable.", price: 25000, stock: 45, images: ["https://via.placeholder.com/400x600?text=Mens+Chinos"], tags: ["pants", "chinos", "men"] },
        { title: "Men's Polo Shirt", description: "Classic men's polo shirt. Perfect for casual or semi-formal occasions.", price: 20000, stock: 48, images: ["https://via.placeholder.com/400x600?text=Mens+Polo"], tags: ["polo", "casual", "men"] },
        { title: "Men's Denim Jacket", description: "Stylish men's denim jacket. Perfect for layering.", price: 32000, stock: 35, images: ["https://via.placeholder.com/400x600?text=Mens+Denim+Jacket"], tags: ["jacket", "denim", "men"] },
        { title: "Men's Sneakers", description: "Comfortable men's sneakers. Perfect for everyday wear.", price: 28000, stock: 40, images: ["https://via.placeholder.com/400x600?text=Mens+Sneakers"], tags: ["shoes", "sneakers", "men"] }
    ],
    "Female": [
        { title: "Women's Blazer", description: "Professional women's blazer. Perfect for office wear.", price: 35000, stock: 30, images: ["https://via.placeholder.com/400x600?text=Womens+Blazer"], tags: ["blazer", "professional", "women"] },
        { title: "Women's Midi Dress", description: "Elegant women's midi dress. Perfect for various occasions.", price: 32000, stock: 40, images: ["https://via.placeholder.com/400x600?text=Womens+Midi+Dress"], tags: ["dress", "midi", "women"] },
        { title: "Women's High-Waisted Jeans", description: "Flattering high-waisted jeans for women. Classic fit.", price: 30000, stock: 45, images: ["https://via.placeholder.com/400x600?text=Womens+Jeans"], tags: ["jeans", "high-waisted", "women"] },
        { title: "Women's Blouse", description: "Elegant women's blouse. Perfect for office or casual wear.", price: 25000, stock: 50, images: ["https://via.placeholder.com/400x600?text=Womens+Blouse"], tags: ["blouse", "elegant", "women"] },
        { title: "Women's Cardigan", description: "Comfortable women's cardigan. Perfect for layering.", price: 22000, stock: 48, images: ["https://via.placeholder.com/400x600?text=Womens+Cardigan"], tags: ["cardigan", "layering", "women"] },
        { title: "Women's Jumpsuit", description: "Stylish women's jumpsuit. One-piece elegance.", price: 38000, stock: 32, images: ["https://via.placeholder.com/400x600?text=Womens+Jumpsuit"], tags: ["jumpsuit", "stylish", "women"] }
    ],
    "Kids": [
        { title: "Kids' T-Shirt Set", description: "Comfortable kids' t-shirt set. Perfect for playtime.", price: 8000, stock: 60, images: ["https://via.placeholder.com/400x600?text=Kids+Tee+Set"], tags: ["kids", "t-shirt", "playtime"] },
        { title: "Kids' Denim Shorts", description: "Durable kids' denim shorts. Perfect for active kids.", price: 12000, stock: 55, images: ["https://via.placeholder.com/400x600?text=Kids+Shorts"], tags: ["kids", "shorts", "denim"] },
        { title: "Kids' Dress", description: "Cute kids' dress. Perfect for special occasions.", price: 15000, stock: 50, images: ["https://via.placeholder.com/400x600?text=Kids+Dress"], tags: ["kids", "dress", "occasion"] },
        { title: "Kids' Hoodie", description: "Warm kids' hoodie. Perfect for cooler weather.", price: 18000, stock: 48, images: ["https://via.placeholder.com/400x600?text=Kids+Hoodie"], tags: ["kids", "hoodie", "warm"] },
        { title: "Kids' Leggings", description: "Comfortable kids' leggings. Perfect for active play.", price: 10000, stock: 58, images: ["https://via.placeholder.com/400x600?text=Kids+Leggings"], tags: ["kids", "leggings", "active"] },
        { title: "Kids' Pajama Set", description: "Cozy kids' pajama set. Perfect for bedtime.", price: 14000, stock: 52, images: ["https://via.placeholder.com/400x600?text=Kids+Pajamas"], tags: ["kids", "pajamas", "sleepwear"] }
    ],
    "Accessories": [
        { title: "Leather Handbag", description: "Elegant leather handbag. Perfect for everyday use.", price: 35000, stock: 30, images: ["https://via.placeholder.com/400x600?text=Leather+Handbag"], tags: ["bag", "leather", "elegant"] },
        { title: "Designer Sunglasses", description: "Stylish designer sunglasses. UV protection included.", price: 25000, stock: 40, images: ["https://via.placeholder.com/400x600?text=Sunglasses"], tags: ["sunglasses", "UV protection", "stylish"] },
        { title: "Silk Scarf", description: "Luxurious silk scarf. Perfect for adding elegance to any outfit.", price: 18000, stock: 45, images: ["https://via.placeholder.com/400x600?text=Silk+Scarf"], tags: ["scarf", "silk", "luxury"] },
        { title: "Leather Belt", description: "Classic leather belt. Versatile and timeless.", price: 15000, stock: 50, images: ["https://via.placeholder.com/400x600?text=Leather+Belt"], tags: ["belt", "leather", "classic"] },
        { title: "Statement Necklace", description: "Bold statement necklace. Perfect for special occasions.", price: 22000, stock: 35, images: ["https://via.placeholder.com/400x600?text=Statement+Necklace"], tags: ["necklace", "statement", "jewelry"] },
        { title: "Crossbody Bag", description: "Practical crossbody bag. Hands-free convenience.", price: 28000, stock: 38, images: ["https://via.placeholder.com/400x600?text=Crossbody+Bag"], tags: ["bag", "crossbody", "practical"] },
        { title: "Wide Brim Hat", description: "Stylish wide brim hat. Perfect for sun protection.", price: 20000, stock: 42, images: ["https://via.placeholder.com/400x600?text=Wide+Brim+Hat"], tags: ["hat", "sun protection", "stylish"] }
    ]
};

const seedProducts = async () => {
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

        let totalCreated = 0;
        let totalSkipped = 0;

        // Get all categories
        const categories = await Category.find();
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });

        // Create products for each category
        for (const [categoryName, products] of Object.entries(productsByCategory)) {
            const categoryId = categoryMap[categoryName];
            
            if (!categoryId) {
                console.log(`Category "${categoryName}" not found. Skipping products.`);
                continue;
            }

            console.log(`\nSeeding products for category: ${categoryName}`);
            
            for (const productData of products) {
                // Check if product already exists
                const existing = await Product.findOne({ 
                    title: productData.title,
                    category: categoryId 
                });

                if (!existing) {
                    const product = await Product.create({
                        ...productData,
                        category: categoryId,
                        currency: "NGN"
                    });
                    console.log(`   Created: ${product.title} (₦${product.price.toLocaleString()})`);
                    totalCreated++;
                } else {
                    console.log(`   Already exists: ${productData.title}`);
                    totalSkipped++;
                }
            }
        }

        console.log(`\nSuccessfully seeded products!`);
        console.log(`   Created: ${totalCreated} products`);
        console.log(`   Skipped: ${totalSkipped} products (already exist)`);

        process.exit(0);
    } catch (error) {
        console.error("\nError seeding products:");
        
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

seedProducts();

