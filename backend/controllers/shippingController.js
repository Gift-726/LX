/**
 * Shipping Controller
 * Handles shipping methods and cost calculations
 */

const mongoose = require("mongoose");
const ShippingMethod = require("../models/ShippingMethod");

/* ============================================================
   GET ALL SHIPPING METHODS
============================================================ */
const getShippingMethods = async (req, res) => {
    try {
        const { country } = req.query;

        let query = { isActive: true };
        
        // Filter by country if provided
        if (country) {
            query.$or = [
                { availableCountries: { $in: [country] } },
                { availableCountries: { $size: 0 } } // Empty array means all countries
            ];
        }

        const methods = await ShippingMethod.find(query)
            .sort({ baseCost: 1 });

        res.json({
            success: true,
            methods
        });

    } catch (error) {
        console.error("Get shipping methods error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET SHIPPING METHOD BY ID
============================================================ */
const getShippingMethodById = async (req, res) => {
    try {
        const { id } = req.params;

        const method = await ShippingMethod.findById(id);

        if (!method) {
            return res.status(404).json({
                success: false,
                message: "Shipping method not found"
            });
        }

        res.json({
            success: true,
            method
        });

    } catch (error) {
        console.error("Get shipping method error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid shipping method ID format"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CALCULATE SHIPPING COST
============================================================ */
const calculateShippingCost = async (req, res) => {
    try {
        const { methodId, weight, orderValue, country } = req.body;

        if (!methodId) {
            return res.status(400).json({
                success: false,
                message: "Shipping method ID is required"
            });
        }

        // Validate method ID format
        if (!mongoose.Types.ObjectId.isValid(methodId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid shipping method ID format"
            });
        }

        const method = await ShippingMethod.findById(methodId);

        if (!method || !method.isActive) {
            return res.status(404).json({
                success: false,
                message: "Shipping method not found or inactive"
            });
        }

        // Check if method is available for country
        if (country && method.availableCountries.length > 0) {
            if (!method.availableCountries.includes(country)) {
                return res.status(400).json({
                    success: false,
                    message: "Shipping method not available for this country"
                });
            }
        }

        // Check minimum order value for free shipping
        if (method.minOrderValue > 0 && orderValue >= method.minOrderValue) {
            return res.json({
                success: true,
                cost: 0,
                method: method.name,
                message: "Free shipping applied"
            });
        }

        // Calculate cost
        let cost = method.baseCost || 0;
        
        if (method.costPerKg > 0 && weight) {
            cost += method.costPerKg * weight;
        }

        // Check max weight
        if (method.maxWeight && weight > method.maxWeight) {
            return res.status(400).json({
                success: false,
                message: `Weight exceeds maximum allowed (${method.maxWeight}kg)`
            });
        }

        res.json({
            success: true,
            cost,
            method: method.name,
            deliveryTime: method.deliveryTime,
            deliveryTimeDays: method.deliveryTimeDays
        });

    } catch (error) {
        console.error("Calculate shipping cost error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CREATE SHIPPING METHOD (Admin Only)
============================================================ */
const createShippingMethod = async (req, res) => {
    try {
        const {
            name, description, deliveryTime, deliveryTimeDays,
            baseCost, costPerKg, availableCountries, minOrderValue,
            maxWeight, icon
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Shipping method name is required"
            });
        }

        const method = await ShippingMethod.create({
            name,
            description,
            deliveryTime,
            deliveryTimeDays,
            baseCost: baseCost || 0,
            costPerKg: costPerKg || 0,
            availableCountries: availableCountries || [],
            minOrderValue: minOrderValue || 0,
            maxWeight,
            icon,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: "Shipping method created",
            method
        });

    } catch (error) {
        console.error("Create shipping method error:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Shipping method with this name already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UPDATE SHIPPING METHOD (Admin Only)
============================================================ */
const updateShippingMethod = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const method = await ShippingMethod.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!method) {
            return res.status(404).json({
                success: false,
                message: "Shipping method not found"
            });
        }

        res.json({
            success: true,
            message: "Shipping method updated",
            method
        });

    } catch (error) {
        console.error("Update shipping method error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   DELETE SHIPPING METHOD (Admin Only)
============================================================ */
const deleteShippingMethod = async (req, res) => {
    try {
        const { id } = req.params;

        const method = await ShippingMethod.findByIdAndDelete(id);

        if (!method) {
            return res.status(404).json({
                success: false,
                message: "Shipping method not found"
            });
        }

        res.json({
            success: true,
            message: "Shipping method deleted"
        });

    } catch (error) {
        console.error("Delete shipping method error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getShippingMethods,
    getShippingMethodById,
    calculateShippingCost,
    createShippingMethod,
    updateShippingMethod,
    deleteShippingMethod
};

