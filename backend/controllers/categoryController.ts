/**
 * Category Controller
 * Handles all category-related operations
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category, { ICategory } from '../models/Category';
import User from '../models/User';
import Product from '../models/Product';

interface CreateCategoryBody {
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  parentCategory?: string | null;
  displayOrder?: number;
}

interface UpdateCategoryBody {
  name?: string;
  description?: string;
  image?: string;
  icon?: string;
  parentCategory?: string | null;
  displayOrder?: number;
}

/* ============================================================
   GET ALL CATEGORIES
============================================================ */
const getAllCategories = async (req: Request<{}, {}, {}, { search?: string }>, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    let query: any = {};

    // Search by name or description
    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    const categories = await Category.find(query)
      .populate('parentCategory', 'name')
      .sort({ displayOrder: 1, name: 1 });

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET TOP-LEVEL CATEGORIES ONLY (For Category Tabs)
============================================================ */
const getTopLevelCategories = async (req: Request, res: Response): Promise<void> => {
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get top-level categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   CREATE CATEGORY (Admin Only)
============================================================ */
const createCategory = async (req: Request<{}, {}, CreateCategoryBody>, res: Response): Promise<void> => {
  try {
    const { name, description, image, icon, parentCategory, displayOrder } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
      return;
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
      return;
    }

    // Handle parentCategory - validate if provided
    let validParentCategory: mongoose.Types.ObjectId | null = null;
    
    if (parentCategory) {
      // If parentCategory is provided, validate it
      if (typeof parentCategory === 'string' && parentCategory.trim() === '') {
        // Empty string means no parent category
        validParentCategory = null;
      } else if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
        res.status(400).json({
          success: false,
          message: 'Invalid parent category ID format. Please provide a valid category ID or leave it empty for a top-level category.',
          error: `"${parentCategory}" is not a valid MongoDB ObjectId`
        });
        return;
      } else {
        // Validate that parent category exists
        const parentExists = await Category.findById(parentCategory);
        if (!parentExists) {
          res.status(404).json({
            success: false,
            message: 'Parent category not found',
            error: `Category with ID "${parentCategory}" does not exist`
          });
          return;
        }
        validParentCategory = new mongoose.Types.ObjectId(parentCategory);
      }
    }

    const category = await Category.create({
      name,
      description: description || undefined,
      image: image || undefined,
      icon: icon || undefined,
      parentCategory: validParentCategory || undefined,
      displayOrder: displayOrder || 0
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error('Create category error:', error);
    
    // Handle MongoDB cast errors
    if (error instanceof Error && (error as any).name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        error: error.message
      });
      return;
    }

    // Handle validation errors
    if (error instanceof Error && (error as any).name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET CATEGORY BY ID (Tracks last selected category for authenticated users)
============================================================ */
const getCategoryById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).populate('parentCategory', 'name');

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
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
    console.error('Get category error:', error);
    
    // Handle MongoDB cast errors
    if (error instanceof Error && (error as any).name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
        error: error.message
      });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET USER'S ACTIVE CATEGORY (Returns last selected or first category)
============================================================ */
const getActiveCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    let category: ICategory | null = null;

    // For authenticated users, get their last selected category
    if (req.user && req.user._id) {
      const user = await User.findById(req.user._id).populate('lastSelectedCategory');
      
      if (user && user.lastSelectedCategory) {
        // Verify category still exists
        const categoryId = typeof user.lastSelectedCategory === 'object' 
          ? (user.lastSelectedCategory as any)._id 
          : user.lastSelectedCategory;
        category = await Category.findById(categoryId);
        if (category) {
          const populatedCategory = await Category.findById(category._id).populate('parentCategory', 'name');
          res.json({
            success: true,
            category: populatedCategory
          });
          return;
        }
      }
    }

    // If no last selected category (or user not authenticated), get first category
    category = await Category.findOne({ parentCategory: null })
      .sort({ displayOrder: 1, name: 1 });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'No categories available'
      });
      return;
    }

    const populatedCategory = await Category.findById(category._id).populate('parentCategory', 'name');

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get active category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE CATEGORY (Admin Only)
============================================================ */
const updateCategory = async (req: Request<{ id: string }, {}, UpdateCategoryBody>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, image, icon, parentCategory, displayOrder } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    // If name is being updated, check for duplicates
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
        return;
      }
    }

    // Handle parentCategory validation
    let validParentCategory: mongoose.Types.ObjectId | null | undefined = category.parentCategory;
    if (parentCategory !== undefined) {
      if (parentCategory === null || parentCategory === '') {
        validParentCategory = null;
      } else if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
        res.status(400).json({
          success: false,
          message: 'Invalid parent category ID format'
        });
        return;
      } else {
        // Prevent setting itself as parent
        if (parentCategory === id) {
          res.status(400).json({
            success: false,
            message: 'Category cannot be its own parent'
          });
          return;
        }
        const parentExists = await Category.findById(parentCategory);
        if (!parentExists) {
          res.status(404).json({
            success: false,
            message: 'Parent category not found'
          });
          return;
        }
        validParentCategory = new mongoose.Types.ObjectId(parentCategory);
      }
    }

    // Update category
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (icon !== undefined) updateData.icon = icon;
    if (parentCategory !== undefined) updateData.parentCategory = validParentCategory;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name');

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Update category error:', error);
    
    if (error instanceof Error && (error as any).name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        error: error.message
      });
      return;
    }

    if (error instanceof Error && (error as any).name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   DELETE CATEGORY (Admin Only)
============================================================ */
const deleteCategory = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productCount} product(s) associated with it. Please remove or reassign products first.`
      });
      return;
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentCategory: id });
    if (subcategoryCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${subcategoryCount} subcategory(ies). Please delete or reassign subcategories first.`
      });
      return;
    }

    // Remove from users' lastSelectedCategory if set
    await User.updateMany(
      { lastSelectedCategory: id },
      { $unset: { lastSelectedCategory: 1 } } as any
    );

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    
    if (error instanceof Error && (error as any).name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        error: error.message
      });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  getAllCategories,
  getTopLevelCategories,
  createCategory,
  getCategoryById,
  getActiveCategory,
  updateCategory,
  deleteCategory
};
