/**
 * Review Model
 * Handles product reviews and feedback
 */

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Product", 
            required: true 
        },
        order: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Order" 
        }, // Optional - link to order if review is from purchase
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        rating: { 
            type: Number, 
            required: true, 
            min: 1, 
            max: 5 
        },
        title: { type: String }, // Review title
        comment: { type: String, required: true },
        images: [{ type: String }], // Review images
        isVerifiedPurchase: { type: Boolean, default: false }, // Verified purchase badge
        helpfulCount: { type: Number, default: 0 }, // Number of helpful votes
        isPublished: { type: Boolean, default: true }, // Admin can hide reviews
        adminResponse: { type: String }, // Admin response to review
        responseDate: { type: Date }
    },
    { timestamps: true }
);

// Prevent duplicate reviews from same user for same product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for faster queries
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isPublished: 1 });

module.exports = mongoose.model("Review", reviewSchema);

