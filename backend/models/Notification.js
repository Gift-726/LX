const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for broadcast notifications
        recipientType: { 
            type: String, 
            enum: ["user", "admin", "all", "users", "admins"], 
            default: "all" 
        }, // For admin-created notifications
        title: { type: String, required: true },
        message: { type: String, required: true },
        header: { type: String }, // Notification header
        body: { type: String }, // Notification body
        isRead: { type: Boolean, default: false },
        type: { type: String, enum: ["order", "promotion", "system", "alert"], default: "system" },
        relatedId: { type: mongoose.Schema.Types.ObjectId }, // ID of related entity (e.g., order ID)
        scheduledDate: { type: Date }, // When to send notification
        scheduledTime: { type: String }, // Time string (e.g., "10:00 am")
        deliveryMethod: [{ 
            type: String, 
            enum: ["push", "email", "sms"] 
        }], // How to deliver notification
        isScheduled: { type: Boolean, default: false },
        isSent: { type: Boolean, default: false },
        sentAt: { type: Date },
        createdBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        } // Admin who created it
    },
    { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
