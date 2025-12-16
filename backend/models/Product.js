const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        currency: { type: String, default: "NGN" },
        discountPercentage: { type: Number, default: 0 },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        images: [{ type: String }], // Array of image URLs
        tags: [{ type: String }], // Array of tags (e.g., "Men", "Winter", "Office")
        rating: { type: Number, default: 0, min: 0, max: 5 },
        stock: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who created it
        // Featured product fields
        isFeatured: { type: Boolean, default: false },
        featuredAt: { type: Date },
        featuredUntil: { type: Date },
        // Product badges (HOT, NEW, SALE, etc.)
        badges: [{ 
            type: String, 
            enum: ["HOT", "NEW", "SALE", "BESTSELLER", "LIMITED"] 
        }]
    },
    { timestamps: true }
);

// Index for search
productSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
