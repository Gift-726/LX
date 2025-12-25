const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, required: true, unique: true }, // Unique order number
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        shippingAddress: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Address", 
            required: true 
        },
        contactEmail: { type: String, required: true },
        contactPhone: { type: String, required: true },
        shippingMethod: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "ShippingMethod" 
        },
        shippingMethodName: { type: String }, // Store name for historical reference
        shippingCost: { type: Number, default: 0 },
        subtotal: { type: Number, required: true },
        discountCode: { type: String }, // Discount code used
        discountAmount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        total: { type: Number, required: true },
        currency: { type: String, default: "NGN" },
        status: { 
            type: String, 
            enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
            default: "pending"
        },
        paymentStatus: { 
            type: String, 
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending"
        },
        paymentMethod: { type: String }, // e.g., "card", "bank_transfer", "paypal"
        paymentReference: { type: String }, // Payment gateway reference
        notes: { type: String }, // Order notes
        estimatedDelivery: { type: Date } // Estimated delivery date
    },
    { timestamps: true }
);

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);

