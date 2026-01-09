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
        paymentMethod: { type: String }, // e.g., "card", "bank_transfer", "paypal", "paystack"
        paymentReference: { type: String }, // Payment gateway reference
        paystackReference: { type: String }, // Paystack transaction reference
        paystackAuthorizationUrl: { type: String }, // Paystack payment URL
        paymentVerifiedAt: { type: Date }, // When payment was verified
        refundReference: { type: String }, // Refund reference if refunded
        refundReason: { type: String }, // Reason for refund
        refundedAt: { type: Date }, // When refund was processed
        notes: { type: String }, // Order notes
        estimatedDelivery: { type: Date }, // Estimated delivery date
        trackingSteps: {
            packaging: { completed: { type: Boolean, default: false }, completedAt: { type: Date } },
            checking: { completed: { type: Boolean, default: false }, completedAt: { type: Date } },
            shipping: { completed: { type: Boolean, default: false }, completedAt: { type: Date } },
            delivery: { completed: { type: Boolean, default: false }, completedAt: { type: Date } },
            readyForPickup: { completed: { type: Boolean, default: false }, completedAt: { type: Date } }
        },
        dispute: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Dispute" 
        } // Reference to dispute if one exists
    },
    { timestamps: true }
);

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
// orderNumber already has unique index from unique: true
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);

