const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        type: { type: String, enum: ["order", "promotion", "system"], default: "system" },
        relatedId: { type: mongoose.Schema.Types.ObjectId } // ID of related entity (e.g., order ID)
    },
    { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
