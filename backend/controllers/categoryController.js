/**
 * Category Controller
 * Handles all category-related operations
 */

const mongoose = require("mongoose");
const Category = require("../models/Category");
const User = require("../models/User");

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
   GET CATEGORY BY ID (Tracks last selected category for authenticated users)
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

        // Track last selected category for authenticated users
        if (req.user && req.user._id) {
            await User.findByIdAndUpdate(req.user._id, {
                lastSelectedCategory: id
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

/* ============================================================
   GET USER'S ACTIVE CATEGORY (Returns last selected or first category)
============================================================ */
const getActiveCategory = async (req, res) => {
    try {
        let category = null;

        // For authenticated users, get their last selected category
        if (req.user && req.user._id) {
            const user = await User.findById(req.user._id).populate("lastSelectedCategory");
            
            if (user && user.lastSelectedCategory) {
                // Verify category still exists
                category = await Category.findById(user.lastSelectedCategory._id);
                if (category) {
                    return res.json({
                        success: true,
                        category: await Category.findById(category._id).populate("parentCategory", "name")
                    });
                }
            }
        }

        // If no last selected category (or user not authenticated), get first category
        category = await Category.findOne({ parentCategory: null })
            .sort({ displayOrder: 1, name: 1 });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "No categories available"
            });
        }

        const populatedCategory = await Category.findById(category._id).populate("parentCategory", "name");

        // Track this as last selected for authenticated users
        if (req.user && req.user._id) {
            await User.findByIdAndUpdate(req.user._id, {
                lastSelectedCategory: category._id
            });
        }

        res.json({
            success: true,
            category: populatedCategory
        });

    } catch (error) {
        console.error("Get active category error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UPDATE CATEGORY (Admin Only)
============================================================ */
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, icon, parentCategory, displayOrder } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // If name is being updated, check for duplicates
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Category name already exists"
                });
            }
        }

        // Handle parentCategory validation
        let validParentCategory = category.parentCategory;
        if (parentCategory !== undefined) {
            if (parentCategory === null || parentCategory === '') {
                validParentCategory = null;
            } else if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parent category ID format"
                });
            } else {
                // Prevent setting itself as parent
                if (parentCategory === id) {
                    return res.status(400).json({
                        success: false,
                        message: "Category cannot be its own parent"
                    });
                }
                const parentExists = await Category.findById(parentCategory);
                if (!parentExists) {
                    return res.status(404).json({
                        success: false,
                        message: "Parent category not found"
                    });
                }
                validParentCategory = parentCategory;
            }
        }

        // Update category
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (image !== undefined) updateData.image = image;
        if (icon !== undefined) updateData.icon = icon;
        if (parentCategory !== undefined) updateData.parentCategory = validParentCategory;
        if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate("parentCategory", "name");

        res.json({
            success: true,
            message: "Category updated successfully",
            category: updatedCategory
        });

    } catch (error) {
        console.error("Update category error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
                error: error.message
            });
        }

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
   DELETE CATEGORY (Admin Only)
============================================================ */
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Check if category has products
        const Product = require("../models/Product");
        const productCount = await Product.countDocuments({ category: id });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It has ${productCount} product(s) associated with it. Please remove or reassign products first.`
            });
        }

        // Check if category has subcategories
        const subcategoryCount = await Category.countDocuments({ parentCategory: id });
        if (subcategoryCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It has ${subcategoryCount} subcategory(ies). Please delete or reassign subcategories first.`
            });
        }

        // Remove from users' lastSelectedCategory if set
        await User.updateMany(
            { lastSelectedCategory: id },
            { $unset: { lastSelectedCategory: 1 } }
        );

        await Category.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error("Delete category error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
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
    getCategoryById,
    getActiveCategory,
    updateCategory,
    deleteCategory
};
