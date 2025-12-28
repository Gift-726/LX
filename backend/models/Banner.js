/**
 * Banner Model
 * Handles promotional banners and announcements
 */

const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        heading: { type: String }, // Main heading text
        bodyText: { type: String }, // Body/description text
        buttonText: { type: String }, // Button label (e.g., "Check it Out", "Best Offer")
        buttonUrl: { type: String }, // Button link URL
        image: { type: String }, // Banner image URL
        backgroundColor: { type: String, default: "#8B5CF6" }, // Purple default
        textColor: { type: String, default: "#FFFFFF" }, // White default
        status: { 
            type: String, 
            enum: ["active", "inactive"], 
            default: "active" 
        },
        displayOrder: { type: Number, default: 0 }, // For sorting multiple banners
        startDate: { type: Date }, // When banner should start showing
        endDate: { type: Date }, // When banner should stop showing
        createdBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }
    },
    { timestamps: true }
);

// Index for faster queries
bannerSchema.index({ status: 1, displayOrder: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("Banner", bannerSchema);


