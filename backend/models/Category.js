const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        image: { type: String }, // Thumbnail image URL
        icon: { type: String }, // Icon URL for circular category icons
        parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // For nested categories
        displayOrder: { type: Number, default: 0 } // For sorting categories
    },
    { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
