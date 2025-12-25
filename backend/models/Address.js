const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        title: { 
            type: String, 
            enum: ["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof", ""],
            default: ""
        },
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        country: { type: String, default: "Nigeria" },
        region: { type: String }, // State/Province
        city: { type: String, required: true },
        address: { type: String, required: true }, // Street address
        postalCode: { type: String },
        isDefault: { type: Boolean, default: false }, // Default shipping address
        addressType: { 
            type: String, 
            enum: ["home", "work", "other"],
            default: "home"
        }
    },
    { timestamps: true }
);

// Index for faster queries
addressSchema.index({ user: 1 });
addressSchema.index({ user: 1, isDefault: 1 });

module.exports = mongoose.model("Address", addressSchema);

