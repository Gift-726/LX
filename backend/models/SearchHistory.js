const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        query: { type: String, required: true }
    },
    { timestamps: true }
);

// Index for faster queries
searchHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
