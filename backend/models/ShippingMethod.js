const mongoose = require("mongoose");

const shippingMethodSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true }, // e.g., "DHL EXPRESS INTERNATIONAL"
        description: { type: String },
        deliveryTime: { type: String }, // e.g., "10 business days"
        deliveryTimeDays: { type: Number }, // Number of days for calculation
        baseCost: { type: Number, default: 0 }, // Base shipping cost
        costPerKg: { type: Number, default: 0 }, // Cost per kilogram
        isActive: { type: Boolean, default: true },
        availableCountries: [{ type: String }], // Countries where this method is available
        minOrderValue: { type: Number, default: 0 }, // Minimum order value for free shipping
        maxWeight: { type: Number }, // Maximum weight in kg
        icon: { type: String } // Icon URL
    },
    { timestamps: true }
);

module.exports = mongoose.model("ShippingMethod", shippingMethodSchema);

