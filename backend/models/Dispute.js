/**
 * Dispute Model
 * Handles order disputes and refund requests
 */

const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema(
    {
        order: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Order", 
            required: true 
        },
        orderItem: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "OrderItem" 
        }, // Optional - specific item in dispute
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        goodsUniqueId: { type: String }, // Unique ID of the goods (order number or product ID)
        reasons: [{
            type: String,
            enum: [
                "didnt_receive",
                "took_longer_than_expected",
                "not_what_ordered",
                "damage_bad_goods",
                "apply_for_refund",
                "others"
            ]
        }],
        detailedExplanation: { type: String, required: true },
        status: { 
            type: String, 
            enum: ["pending", "under_review", "resolved", "rejected", "refunded"],
            default: "pending"
        },
        adminResponse: { type: String }, // Admin's response to the dispute
        refundAmount: { type: Number }, // Refund amount if approved
        resolvedAt: { type: Date },
        resolvedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        } // Admin who resolved it
    },
    { timestamps: true }
);

// Index for faster queries
disputeSchema.index({ user: 1, createdAt: -1 });
disputeSchema.index({ order: 1 });
disputeSchema.index({ status: 1 });

module.exports = mongoose.model("Dispute", disputeSchema);

