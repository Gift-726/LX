const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
    {
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Product", 
            required: true 
        },
        size: { 
            type: String, 
            required: true,
            enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"]
        },
        color: { 
            type: String, 
            required: true 
        }, // Color name (e.g., "Rose pink", "White", "Red")
        colorCode: { type: String }, // Hex color code (e.g., "#FF69B4")
        price: { type: Number }, // Variant-specific price (if different from base)
        stock: { type: Number, default: 0, min: 0 }, // Stock for this specific variant
        images: [{ type: String }], // Variant-specific images
        sku: { type: String, unique: true, sparse: true } // Stock Keeping Unit
    },
    { timestamps: true }
);

// Index for faster queries
productVariantSchema.index({ product: 1, size: 1, color: 1 }, { unique: true });
productVariantSchema.index({ product: 1 });

module.exports = mongoose.model("ProductVariant", productVariantSchema);

