/**
 * Product Controller
 * Handles all product-related operations (CRUD)
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product, { IProduct, ProductBadge } from '../models/Product';
import ProductVariant, { VariantSize } from '../models/ProductVariant';
import Category from '../models/Category';
import SearchHistory from '../models/SearchHistory';
import Favorites from '../models/Favorites';

interface CreateProductBody {
  title: string;
  description: string;
  price: number;
  currency?: string;
  discountPercentage?: number;
  category: string;
  images?: string[];
  tags?: string[];
  stock?: number;
  isAvailable?: boolean;
  sizes?: string[];
  colors?: string[];
  brand?: string;
  releaseDate?: string;
  displayCurrency?: string;
  displayPrice?: number;
  badges?: ProductBadge[];
  isFeatured?: boolean;
  featuredAt?: Date;
  featuredUntil?: Date;
}

interface ProductQueryParams {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  tags?: string;
  page?: string;
  limit?: string;
}

interface AdminProductQueryParams extends ProductQueryParams {
  minStock?: string;
  maxStock?: string;
  isAvailable?: string;
}

/* ============================================================
   CREATE PRODUCT (Admin Only)
============================================================ */
const createProduct = async (req: Request<{}, {}, CreateProductBody>, res: Response): Promise<void> => {
  try {
    const { 
      title, 
      description, 
      price, 
      currency, 
      discountPercentage, 
      category, 
      images, 
      tags, 
      stock,
      isAvailable = true,
      sizes = [],
      colors = []
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category) {
      res.status(400).json({
        success: false,
        message: 'Title, description, price, and category are required'
      });
      return;
    }

    // Validate category is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(category)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category ID format. Please provide a valid category ID.',
        error: `"${category}" is not a valid MongoDB ObjectId`
      });
      return;
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
        error: `Category with ID "${category}" does not exist`
      });
      return;
    }

    // Validate sizes if provided
    const validSizes: VariantSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'];
    if (sizes.length > 0) {
      const invalidSizes = sizes.filter(size => !validSizes.includes(size as VariantSize));
      if (invalidSizes.length > 0) {
        res.status(400).json({
          success: false,
          message: `Invalid sizes: ${invalidSizes.join(', ')}. Valid sizes are: ${validSizes.join(', ')}`
        });
        return;
      }
    }

    // Create product
    const hasVariants = sizes.length > 0 && colors.length > 0;
    const product = await Product.create({
      title,
      description,
      price,
      currency: currency || 'NGN',
      discountPercentage: discountPercentage || 0,
      category,
      images: images || [],
      tags: tags || [],
      stock: stock || 0,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      hasVariants,
      createdBy: req.user!._id
    });

    // Create variants if sizes and colors are provided
    const variants = [];
    if (hasVariants) {
      for (const size of sizes) {
        for (const color of colors) {
          // Generate SKU
          const sku = `${product._id.toString().substring(0, 8).toUpperCase()}-${size}-${color.substring(0, 3).toUpperCase()}`;
          
          const variant = await ProductVariant.create({
            product: product._id,
            size: size as VariantSize,
            color,
            price: price,
            stock: 0,
            sku
          });
          variants.push(variant);
        }
      }
    }

    // Calculate total stock from variants if they exist
    if (variants.length > 0) {
      const totalVariantStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      product.stock = totalVariantStock;
      await product.save();
    }

    // Populate product for response
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('createdBy', 'firstname lastname');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: populatedProduct,
      variants: variants.length > 0 ? variants : undefined
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle MongoDB cast errors
    if (error instanceof Error && (error as any).name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        error: error.message
      });
      return;
    }

    // Handle duplicate key errors (e.g., SKU)
    if (error instanceof Error && (error as any).code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Duplicate entry. A product with similar attributes already exists.',
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
   CALCULATE PRODUCT BADGES
============================================================ */
const calculateProductBadges = (product: IProduct | any): ProductBadge[] => {
  const badges: ProductBadge[] = [];
  const productObj = product.toObject ? product.toObject() : product;
  
  // Use manual badges if set
  if (productObj.badges && productObj.badges.length > 0) {
    return productObj.badges;
  }
  
  // Calculate badges based on product properties
  if (productObj.discountPercentage >= 40) {
    badges.push('HOT');
  } else if (productObj.discountPercentage > 0) {
    badges.push('SALE');
  }
  
  // Check if product is new (created within last 7 days)
  if (productObj.createdAt) {
    const daysSinceCreation = (Date.now() - new Date(productObj.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 7) {
      badges.push('NEW');
    }
  }
  
  // Check if low stock (limited availability)
  if (productObj.stock > 0 && productObj.stock <= 5) {
    badges.push('LIMITED');
  }
  
  return badges;
};

/* ============================================================
   GET ALL PRODUCTS (with filters)
============================================================ */
const getProducts = async (req: Request<{}, {}, {}, ProductQueryParams>, res: Response): Promise<void> => {
  try {
    const { category, search, minPrice, maxPrice, tags, page = '1', limit = '20' } = req.query;

    let query: any = {};

    // Filter by category
    if (category) {
      // Validate category ID format
      if (!mongoose.Types.ObjectId.isValid(category)) {
        res.status(400).json({
          success: false,
          message: 'Invalid category ID format in query parameter',
          error: `"${category}" is not a valid MongoDB ObjectId`
        });
        return;
      }
      query.category = category;
    }

    // Search by text - use regex for flexible matching across title, description, and tags
    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      
      // Search in title, description, and tags
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
      
      // Save search history for authenticated users (asynchronously, don't block response)
      if (req.user && req.user._id) {
        setImmediate(async () => {
          try {
            // Check if this exact query already exists recently (within last hour)
            const existingSearch = await SearchHistory.findOne({
              user: req.user!._id,
              query: searchTerm,
              createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
            });

            if (!existingSearch) {
              await SearchHistory.create({
                user: req.user!._id,
                query: searchTerm
              });
            }
          } catch (err) {
            console.error('Error saving search history:', err);
            // Don't throw - search history saving shouldn't break the search
          }
        });
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let products = await Product.find(query)
      .populate('category', 'name image')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });

    // Get user's favorites if authenticated
    let userFavorites: string[] = [];
    if (req.user && req.user._id) {
      const favoriteItems = await Favorites.find({ user: req.user._id }).select('product');
      userFavorites = favoriteItems.map(item => item.product.toString());
    }

    // Add calculated badges and favorites status to products
    const productsWithBadges = products.map(product => {
      const productObj: any = product.toObject();
      productObj.calculatedBadges = calculateProductBadges(product);
      productObj.isInFavorites = req.user && req.user._id 
        ? userFavorites.includes(productObj._id.toString())
        : false;
      return productObj;
    });

    const count = await Product.countDocuments(query);

    res.json({
      success: true,
      products: productsWithBadges,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET RECOMMENDED PRODUCTS
============================================================ */
const getRecommendedProducts = async (req: Request<{}, {}, {}, { limit?: string }>, res: Response): Promise<void> => {
  try {
    const { limit = '10' } = req.query;

    // For now, return most recent products
    // In future, implement ML-based recommendations
    const products = await Product.find()
      .populate('category', 'name image')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    // Add calculated badges to products
    const productsWithBadges = products.map(product => {
      const productObj: any = product.toObject();
      productObj.calculatedBadges = calculateProductBadges(product);
      return productObj;
    });

    res.json({
      success: true,
      products: productsWithBadges
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get recommended products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET FEATURED PRODUCTS (For "Best Offer" Banner)
============================================================ */
const getFeaturedProducts = async (req: Request<{}, {}, {}, { limit?: string }>, res: Response): Promise<void> => {
  try {
    const { limit = '10' } = req.query;

    const products = await Product.find({ 
      isFeatured: true,
      $or: [
        { featuredUntil: { $gte: new Date() } },
        { featuredUntil: null }
      ]
    })
      .populate('category', 'name image')
      .sort({ featuredAt: -1, createdAt: -1 })
      .limit(Number(limit));

    // Get user's favorites if authenticated
    let userFavorites: string[] = [];
    if (req.user && req.user._id) {
      const favoriteItems = await Favorites.find({ user: req.user._id }).select('product');
      userFavorites = favoriteItems.map(item => item.product.toString());
    }

    // Add calculated badges and favorites status
    const productsWithBadges = products.map(product => {
      const productObj: any = product.toObject();
      productObj.calculatedBadges = calculateProductBadges(product);
      productObj.isInFavorites = req.user && req.user._id 
        ? userFavorites.includes(productObj._id.toString())
        : false;
      return productObj;
    });

    res.json({
      success: true,
      products: productsWithBadges
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET PRODUCT BY ID
============================================================ */
const getProductById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let product = await Product.findById(id).populate('category', 'name image');
    
    if (product) {
      const productObj: any = product.toObject();
      productObj.calculatedBadges = calculateProductBadges(product);
      
      // Get product variants if they exist
      if (product.hasVariants) {
        const variants = await ProductVariant.find({ product: product._id })
          .sort({ size: 1, color: 1 });
        productObj.variants = variants;
      } else {
        productObj.variants = [];
      }
      
      // Check if in favorites (if user is authenticated)
      if (req.user && req.user._id) {
        const favoriteItem = await Favorites.findOne({
          user: req.user._id,
          product: productObj._id
        });
        productObj.isInFavorites = !!favoriteItem;
      } else {
        productObj.isInFavorites = false;
      }
      
      product = productObj as any;
    }

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Get product by ID error:', error);
    
    // Handle MongoDB cast errors
    if (error instanceof Error && (error as any).name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
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
   UPDATE PRODUCT (Admin Only)
============================================================ */
const updateProduct = async (req: Request<{ id: string }, {}, Partial<CreateProductBody>>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
      return;
    }

    // If category is being updated, validate it
    if (updates.category) {
      if (!mongoose.Types.ObjectId.isValid(updates.category)) {
        res.status(400).json({
          success: false,
          message: 'Invalid category ID format. Please provide a valid category ID.',
          error: `"${updates.category}" is not a valid MongoDB ObjectId`
        });
        return;
      }

      // Verify category exists
      const categoryExists = await Category.findById(updates.category);
      if (!categoryExists) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
          error: `Category with ID "${updates.category}" does not exist`
        });
        return;
      }
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    // Handle MongoDB cast errors
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

/* ============================================================
   DELETE PRODUCT (Admin Only)
============================================================ */
const deleteProduct = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET ALL PRODUCTS (Admin - with advanced filters)
============================================================ */
const getAdminProducts = async (req: Request<{}, {}, {}, AdminProductQueryParams>, res: Response): Promise<void> => {
  try {
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      minStock, 
      maxStock,
      isAvailable,
      page = '1', 
      limit = '50' 
    } = req.query;

    let query: any = {};

    // Search by text
    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Filter by category
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by stock range
    if (minStock !== undefined || maxStock !== undefined) {
      query.stock = {};
      if (minStock !== undefined) query.stock.$gte = parseInt(minStock);
      if (maxStock !== undefined) query.stock.$lte = parseInt(maxStock);
    }

    // Filter by availability status
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('createdBy', 'firstname lastname')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Product.countDocuments(query);

    // Format products for admin view
    const formattedProducts = products.map(product => {
      const productObj = product.toObject();
      return {
        ...productObj,
        status: productObj.isAvailable ? 'active' : 'inactive'
      };
    });

    res.json({
      success: true,
      products: formattedProducts,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  createProduct,
  getProducts,
  getAdminProducts,
  getRecommendedProducts,
  getFeaturedProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
