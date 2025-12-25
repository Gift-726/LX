/**
 * Favorites Model
 * Stores user's favorite products (favorite stores)
 */

const mongoose = require("mongoose");

const favoritesSchema = new mongoose.Schema(
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
favoritesSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for faster queries
favoritesSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Favorites", favoritesSchema);

