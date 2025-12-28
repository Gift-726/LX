const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true }, // Base price
        currency: { type: String, default: "NGN" },
        displayCurrency: { type: String, default: "USD" }, // Display currency (e.g., "$56.99")
        displayPrice: { type: Number }, // Display price in displayCurrency
        discountPercentage: { type: Number, default: 0 },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        brand: { type: String }, // Brand name (e.g., "Gagnon")
        releaseDate: { type: Date }, // Product release date
        images: [{ type: String }], // Array of image URLs
        tags: [{ type: String }], // Array of tags (e.g., "Men", "Winter", "Office")
        rating: { type: Number, default: 0, min: 0, max: 5 },
        salesCount: { type: Number, default: 0 }, // Number of units sold
        stock: { type: Number, default: 0 }, // Total stock (sum of all variants)
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who created it
        // Featured product fields
        isFeatured: { type: Boolean, default: false },
        featuredAt: { type: Date },
        featuredUntil: { type: Date },
        // Product badges (HOT, NEW, SALE, etc.)
        badges: [{ 
            type: String, 
            enum: ["HOT", "NEW", "SALE", "BESTSELLER", "LIMITED"] 
        }],
        // Variant support
        hasVariants: { type: Boolean, default: false }, // Whether product has size/color variants
        // Product availability
        isAvailable: { type: Boolean, default: true } // Whether product is available for purchase
    },
    { timestamps: true }
);

// Index for search
productSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
