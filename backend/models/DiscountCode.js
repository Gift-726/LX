const mongoose = require("mongoose");

const discountCodeSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true },
        description: { type: String },
        discountType: { 
            type: String, 
            enum: ["percentage", "fixed"],
            required: true 
        }, // Percentage or fixed amount
        discountValue: { type: Number, required: true }, // Percentage (0-100) or fixed amount
        minOrderValue: { type: Number, default: 0 }, // Minimum order value to use code
        maxDiscount: { type: Number }, // Maximum discount amount (for percentage)
        validFrom: { type: Date, required: true },
        validUntil: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        usageLimit: { type: Number }, // Total usage limit (null = unlimited)
        usageCount: { type: Number, default: 0 }, // Current usage count
        userLimit: { type: Number, default: 1 }, // Usage limit per user
        applicableCategories: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Category" 
        }], // Categories this code applies to (empty = all)
        applicableProducts: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Product" 
        }] // Specific products (empty = all)
    },
    { timestamps: true }
);

// Index for faster lookups
discountCodeSchema.index({ code: 1, isActive: 1 });
discountCodeSchema.index({ validFrom: 1, validUntil: 1 });

module.exports = mongoose.model("DiscountCode", discountCodeSchema);

