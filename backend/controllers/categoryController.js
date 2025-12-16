/**
 * Category Controller
 * Handles all category-related operations
 */

const mongoose = require("mongoose");
const Category = require("../models/Category");

/* ============================================================
   GET ALL CATEGORIES
============================================================ */
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .populate("parentCategory", "name")
            .sort({ displayOrder: 1, name: 1 });

        res.json({
            success: true,
            categories
        });

    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET TOP-LEVEL CATEGORIES ONLY (For Category Tabs)
============================================================ */
const getTopLevelCategories = async (req, res) => {
    try {
        const categories = await Category.find({ 
            parentCategory: null 
        })
            .sort({ displayOrder: 1, name: 1 });

        res.json({
            success: true,
            categories
        });

    } catch (error) {
        console.error("Get top-level categories error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CREATE CATEGORY (Admin Only)
============================================================ */
const createCategory = async (req, res) => {
    try {
        const { name, image, parentCategory } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }

        // Handle parentCategory - validate if provided
        let validParentCategory = null;
        
        if (parentCategory) {
            // If parentCategory is provided, validate it
            if (typeof parentCategory === 'string' && parentCategory.trim() === '') {
                // Empty string means no parent category
                validParentCategory = null;
            } else if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parent category ID format. Please provide a valid category ID or leave it empty for a top-level category.",
                    error: `"${parentCategory}" is not a valid MongoDB ObjectId`
                });
            } else {
                // Validate that parent category exists
                const parentExists = await Category.findById(parentCategory);
                if (!parentExists) {
                    return res.status(404).json({
                        success: false,
                        message: "Parent category not found",
                        error: `Category with ID "${parentCategory}" does not exist`
                    });
                }
                validParentCategory = parentCategory;
            }
        }

        const category = await Category.create({
            name,
            image: image || undefined,
            parentCategory: validParentCategory
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });

    } catch (error) {
        console.error("Create category error:", error);
        
        // Handle MongoDB cast errors
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
                error: error.message
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: error.message
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
   GET CATEGORY BY ID
============================================================ */
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id).populate("parentCategory", "name");

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.json({
            success: true,
            category
        });

    } catch (error) {
        console.error("Get category error:", error);
        
        // Handle MongoDB cast errors
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID format",
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getAllCategories,
    getTopLevelCategories,
    createCategory,
    getCategoryById
};
