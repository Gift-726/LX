/**
 * Terms and Conditions Model
 * Handles terms and conditions content
 */

const mongoose = require("mongoose");

const termsAndConditionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true }, // e.g., "Service Agreement", "Acceptance Agreement"
        content: { type: String, required: true }, // The actual terms content
        version: { type: Number, default: 1 }, // Version number for tracking changes
        isActive: { type: Boolean, default: true }, // Whether this version is currently active
        effectiveDate: { type: Date, default: Date.now }, // When these terms become effective
        createdBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        },
        updatedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }
    },
    { timestamps: true }
);

// Index for faster queries
termsAndConditionSchema.index({ isActive: 1, effectiveDate: -1 });

module.exports = mongoose.model("TermsAndCondition", termsAndConditionSchema);

