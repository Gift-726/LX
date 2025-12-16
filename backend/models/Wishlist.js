/**
 * Wishlist Model
 * Stores user's favorite/wishlist items
 */

const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Product", 
            required: true 
        }
    },
    { timestamps: true }
);

// Prevent duplicate entries (user can't add same product twice)
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for faster queries
wishlistSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Wishlist", wishlistSchema);

