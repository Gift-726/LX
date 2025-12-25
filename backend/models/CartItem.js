const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        cart: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Cart", 
            required: true 
        },
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Product", 
            required: true 
        },
        variant: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "ProductVariant" 
        }, // Optional - if product has variants
        size: { type: String }, // Size if no variant (for backward compatibility)
        color: { type: String }, // Color if no variant (for backward compatibility)
        quantity: { type: Number, required: true, min: 1, default: 1 },
        price: { type: Number, required: true } // Price at time of adding to cart
    },
    { timestamps: true }
);

// Index to prevent duplicate items
cartItemSchema.index({ cart: 1, product: 1, variant: 1 }, { unique: true });

module.exports = mongoose.model("CartItem", cartItemSchema);

