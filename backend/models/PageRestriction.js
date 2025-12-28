/**
 * Page Restriction Model
 * Handles page access restrictions for users/admins
 */

const mongoose = require("mongoose");

const pageRestrictionSchema = new mongoose.Schema(
    {
        pageName: { 
            type: String, 
            required: true, 
            unique: true 
        }, // e.g., "System Settings", "Banner", "Terms and Condition", "Reviews and Feedback"
        allowedRoles: [{ 
            type: String, 
            enum: ["user", "admin", "all"] 
        }], // Who can access this page
        isRestricted: { type: Boolean, default: false }, // Whether page is restricted
        restrictionType: { 
            type: String, 
            enum: ["all", "users", "admins", "search_users", "search_admins"], 
            default: "all" 
        }, // Type of restriction
        updatedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }
    },
    { timestamps: true }
);

// Index for faster queries
pageRestrictionSchema.index({ pageName: 1 });

module.exports = mongoose.model("PageRestriction", pageRestrictionSchema);


