const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        order: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Order", 
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
        productTitle: { type: String, required: true }, // Store product title at time of order
        productBrand: { type: String }, // Store brand at time of order
        size: { type: String }, // Size
        color: { type: String }, // Color
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, // Price at time of order
        subtotal: { type: Number, required: true } // quantity * price
    },
    { timestamps: true }
);

// Index for faster queries
orderItemSchema.index({ order: 1 });

module.exports = mongoose.model("OrderItem", orderItemSchema);

