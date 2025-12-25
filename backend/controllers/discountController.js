/**
 * Discount Controller
 * Handles discount codes and promotions
 */

const mongoose = require("mongoose");
const DiscountCode = require("../models/DiscountCode");

/* ============================================================
   VALIDATE DISCOUNT CODE
============================================================ */
const validateDiscountCode = async (req, res) => {
    try {
        const { code, orderValue, productIds, categoryIds } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Discount code is required"
            });
        }

        const discountCode = await DiscountCode.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if (!discountCode) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired discount code"
            });
        }

        const now = new Date();

        // Check validity dates
        if (now < discountCode.validFrom || now > discountCode.validUntil) {
            return res.status(400).json({
                success: false,
                message: "Discount code is not valid at this time"
            });
        }

        // Check usage limit
        if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
            return res.status(400).json({
                success: false,
                message: "Discount code has reached its usage limit"
            });
        }

        // Check minimum order value
        if (orderValue && discountCode.minOrderValue > 0 && orderValue < discountCode.minOrderValue) {
            return res.status(400).json({
                success: false,
                message: `Minimum order value of ${discountCode.minOrderValue} required for this code`
            });
        }

        // Check if code applies to specific categories
        if (discountCode.applicableCategories.length > 0 && categoryIds) {
            const applicable = categoryIds.some(catId => 
                discountCode.applicableCategories.some(appCat => 
                    appCat.toString() === catId.toString()
                )
            );
            if (!applicable) {
                return res.status(400).json({
                    success: false,
                    message: "Discount code does not apply to selected categories"
                });
            }
        }

        // Check if code applies to specific products
        if (discountCode.applicableProducts.length > 0 && productIds) {
            const applicable = productIds.some(prodId => 
                discountCode.applicableProducts.some(appProd => 
                    appProd.toString() === prodId.toString()
                )
            );
            if (!applicable) {
                return res.status(400).json({
                    success: false,
                    message: "Discount code does not apply to selected products"
                });
            }
        }

        // Calculate discount amount (don't apply yet, just return info)
        let discountAmount = 0;
        if (orderValue) {
            if (discountCode.discountType === "percentage") {
                discountAmount = (orderValue * discountCode.discountValue) / 100;
                if (discountCode.maxDiscount) {
                    discountAmount = Math.min(discountAmount, discountCode.maxDiscount);
                }
            } else {
                discountAmount = discountCode.discountValue;
            }
        }

        res.json({
            success: true,
            valid: true,
            discountCode: {
                code: discountCode.code,
                discountType: discountCode.discountType,
                discountValue: discountCode.discountValue,
                discountAmount,
                description: discountCode.description
            }
        });

    } catch (error) {
        console.error("Validate discount code error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   APPLY DISCOUNT CODE
============================================================ */
const applyDiscountCode = async (req, res) => {
    try {
        const { code, orderValue, productIds, categoryIds, userId } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Discount code is required"
            });
        }

        const discountCode = await DiscountCode.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if (!discountCode) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired discount code"
            });
        }

        const now = new Date();

        // Check validity dates
        if (now < discountCode.validFrom || now > discountCode.validUntil) {
            return res.status(400).json({
                success: false,
                message: "Discount code is not valid at this time"
            });
        }

        // Check usage limit
        if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
            return res.status(400).json({
                success: false,
                message: "Discount code has reached its usage limit"
            });
        }

        // Check user limit (if authenticated)
        if (userId && discountCode.userLimit > 0) {
            // This would require tracking user usage - simplified for now
            // In production, you'd have a UserDiscountUsage model
        }

        // Check minimum order value
        if (orderValue && discountCode.minOrderValue > 0 && orderValue < discountCode.minOrderValue) {
            return res.status(400).json({
                success: false,
                message: `Minimum order value of ${discountCode.minOrderValue} required`
            });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (orderValue) {
            if (discountCode.discountType === "percentage") {
                discountAmount = (orderValue * discountCode.discountValue) / 100;
                if (discountCode.maxDiscount) {
                    discountAmount = Math.min(discountAmount, discountCode.maxDiscount);
                }
            } else {
                discountAmount = discountCode.discountValue;
            }
        }

        // Increment usage count
        discountCode.usageCount += 1;
        await discountCode.save();

        res.json({
            success: true,
            message: "Discount code applied",
            discount: {
                code: discountCode.code,
                discountType: discountCode.discountType,
                discountValue: discountCode.discountValue,
                discountAmount,
                description: discountCode.description
            }
        });

    } catch (error) {
        console.error("Apply discount code error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET ALL DISCOUNT CODES (Admin Only)
============================================================ */
const getDiscountCodes = async (req, res) => {
    try {
        const { active } = req.query;

        let query = {};
        if (active !== undefined) {
            query.isActive = active === "true";
        }

        const codes = await DiscountCode.find(query)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            codes
        });

    } catch (error) {
        console.error("Get discount codes error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CREATE DISCOUNT CODE (Admin Only)
============================================================ */
const createDiscountCode = async (req, res) => {
    try {
        const {
            code, description, discountType, discountValue,
            minOrderValue, maxDiscount, validFrom, validUntil,
            usageLimit, userLimit, applicableCategories, applicableProducts
        } = req.body;

        if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
            return res.status(400).json({
                success: false,
                message: "Code, discount type, discount value, valid from, and valid until are required"
            });
        }

        const discountCode = await DiscountCode.create({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            minOrderValue: minOrderValue || 0,
            maxDiscount,
            validFrom: new Date(validFrom),
            validUntil: new Date(validUntil),
            usageLimit,
            userLimit: userLimit || 1,
            applicableCategories: applicableCategories || [],
            applicableProducts: applicableProducts || [],
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: "Discount code created",
            code: discountCode
        });

    } catch (error) {
        console.error("Create discount code error:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Discount code already exists"
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
   UPDATE DISCOUNT CODE (Admin Only)
============================================================ */
const updateDiscountCode = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Convert code to uppercase if provided
        if (updates.code) {
            updates.code = updates.code.toUpperCase();
        }

        // Convert dates if provided
        if (updates.validFrom) {
            updates.validFrom = new Date(updates.validFrom);
        }
        if (updates.validUntil) {
            updates.validUntil = new Date(updates.validUntil);
        }

        const discountCode = await DiscountCode.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!discountCode) {
            return res.status(404).json({
                success: false,
                message: "Discount code not found"
            });
        }

        res.json({
            success: true,
            message: "Discount code updated",
            code: discountCode
        });

    } catch (error) {
        console.error("Update discount code error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   DELETE DISCOUNT CODE (Admin Only)
============================================================ */
const deleteDiscountCode = async (req, res) => {
    try {
        const { id } = req.params;

        const discountCode = await DiscountCode.findByIdAndDelete(id);

        if (!discountCode) {
            return res.status(404).json({
                success: false,
                message: "Discount code not found"
            });
        }

        res.json({
            success: true,
            message: "Discount code deleted"
        });

    } catch (error) {
        console.error("Delete discount code error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    validateDiscountCode,
    applyDiscountCode,
    getDiscountCodes,
    createDiscountCode,
    updateDiscountCode,
    deleteDiscountCode
};

