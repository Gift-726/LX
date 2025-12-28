/**
 * Product Controller
 * Handles all product-related operations (CRUD)
 */

const mongoose = require("mongoose");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const Category = require("../models/Category");
const SearchHistory = require("../models/SearchHistory");

/* ============================================================
   CREATE PRODUCT (Admin Only)
============================================================ */
const createProduct = async (req, res) => {
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
            return res.status(400).json({
                success: false,
                message: "Title, description, price, and category are required"
            });
        }

        // Validate category is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID format. Please provide a valid category ID.",
                error: `"${category}" is not a valid MongoDB ObjectId`
            });
        }

        // Verify category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
                error: `Category with ID "${category}" does not exist`
            });
        }

        // Validate sizes if provided
        const validSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"];
        if (sizes.length > 0) {
            const invalidSizes = sizes.filter(size => !validSizes.includes(size));
            if (invalidSizes.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid sizes: ${invalidSizes.join(", ")}. Valid sizes are: ${validSizes.join(", ")}`
                });
            }
        }

        // Create product
        const hasVariants = sizes.length > 0 && colors.length > 0;
        const product = await Product.create({
            title,
            description,
            price,
            currency: currency || "NGN",
            discountPercentage: discountPercentage || 0,
            category,
            images: images || [],
            tags: tags || [],
            stock: stock || 0,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            hasVariants,
            createdBy: req.user._id
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
                        size,
                        color,
                        price: price, // Use base price, can be overridden
                        stock: 0, // Default stock per variant
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
            .populate("category", "name")
            .populate("createdBy", "firstname lastname");

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: populatedProduct,
            variants: variants.length > 0 ? variants : undefined
        });

    } catch (error) {
        console.error("Create product error:", error);
        
        // Handle MongoDB cast errors
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
                error: error.message
            });
        }

        // Handle duplicate key errors (e.g., SKU)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplicate entry. A product with similar attributes already exists.",
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
   GET ALL PRODUCTS (with filters)
============================================================ */
const getProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, tags, page = 1, limit = 20 } = req.query;

        let query = {};

        // Filter by category
        if (category) {
            // Validate category ID format
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID format in query parameter",
                    error: `"${category}" is not a valid MongoDB ObjectId`
                });
            }
            query.category = category;
        }

        // Search by text - use regex for flexible matching across title, description, and tags
        if (search && search.trim().length > 0) {
            const searchTerm = search.trim();
            const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i"); // Escape special chars, case-insensitive
            
            // Search in title, description, and tags
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { tags: { $in: [new RegExp(searchTerm, "i")] } }
            ];
            
            // Save search history for authenticated users (asynchronously, don't block response)
            if (req.user && req.user._id) {
                setImmediate(async () => {
                    try {
                        // Check if this exact query already exists recently (within last hour)
                        const existingSearch = await SearchHistory.findOne({
                            user: req.user._id,
                            query: searchTerm,
                            createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
                        });

                        if (!existingSearch) {
                            await SearchHistory.create({
                                user: req.user._id,
                                query: searchTerm
                            });
                        }
                    } catch (err) {
                        console.error("Error saving search history:", err);
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
            const tagArray = tags.split(",");
            query.tags = { $in: tagArray };
        }

        let products = await Product.find(query)
            .populate("category", "name image")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        // Get user's favorites if authenticated
        let userFavorites = [];
        if (req.user && req.user._id) {
            const Favorites = require("../models/Favorites");
            const favoriteItems = await Favorites.find({ user: req.user._id }).select("product");
            userFavorites = favoriteItems.map(item => item.product.toString());
        }

        // Add calculated badges and favorites status to products
        products = products.map(product => {
            const productObj = product.toObject();
            productObj.calculatedBadges = calculateProductBadges(product);
            productObj.isInFavorites = req.user && req.user._id 
                ? userFavorites.includes(productObj._id.toString())
                : false;
            return productObj;
        });

        const count = await Product.countDocuments(query);

        res.json({
            success: true,
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET RECOMMENDED PRODUCTS
============================================================ */
const getRecommendedProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // For now, return most recent products
        // In future, implement ML-based recommendations
        const products = await Product.find()
            .populate("category", "name image")
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        // Add calculated badges to products
        const productsWithBadges = products.map(product => {
            const productObj = product.toObject();
            productObj.calculatedBadges = calculateProductBadges(product);
            return productObj;
        });

        res.json({
            success: true,
            products: productsWithBadges
        });

    } catch (error) {
        console.error("Get recommended products error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET FEATURED PRODUCTS (For "Best Offer" Banner)
============================================================ */
const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const products = await Product.find({ 
            isFeatured: true,
            $or: [
                { featuredUntil: { $gte: new Date() } },
                { featuredUntil: null }
            ]
        })
            .populate("category", "name image")
            .sort({ featuredAt: -1, createdAt: -1 })
            .limit(Number(limit));

        // Get user's favorites if authenticated
        let userFavorites = [];
        if (req.user && req.user._id) {
            const Favorites = require("../models/Favorites");
            const favoriteItems = await Favorites.find({ user: req.user._id }).select("product");
            userFavorites = favoriteItems.map(item => item.product.toString());
        }

        // Add calculated badges and favorites status
        const productsWithBadges = products.map(product => {
            const productObj = product.toObject();
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
        console.error("Get featured products error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CALCULATE PRODUCT BADGES
============================================================ */
const calculateProductBadges = (product) => {
    const badges = [];
    const productObj = product.toObject ? product.toObject() : product;
    
    // Use manual badges if set
    if (productObj.badges && productObj.badges.length > 0) {
        return productObj.badges;
    }
    
    // Calculate badges based on product properties
    if (productObj.discountPercentage >= 40) {
        badges.push("HOT");
    } else if (productObj.discountPercentage > 0) {
        badges.push("SALE");
    }
    
    // Check if product is new (created within last 7 days)
    if (productObj.createdAt) {
        const daysSinceCreation = (Date.now() - new Date(productObj.createdAt)) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation <= 7) {
            badges.push("NEW");
        }
    }
    
    // Check if low stock (limited availability)
    if (productObj.stock > 0 && productObj.stock <= 5) {
        badges.push("LIMITED");
    }
    
    return badges;
};

/* ============================================================
   GET PRODUCT BY ID
============================================================ */
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        let product = await Product.findById(id).populate("category", "name image");
        
        if (product) {
            const productObj = product.toObject();
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
                const Favorites = require("../models/Favorites");
                const favoriteItem = await Favorites.findOne({
                    user: req.user._id,
                    product: productObj._id
                });
                productObj.isInFavorites = !!favoriteItem;
            } else {
                productObj.isInFavorites = false;
            }
            
            product = productObj;
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Get product by ID error:", error);
        
        // Handle MongoDB cast errors
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format",
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
   UPDATE PRODUCT (Admin Only)
============================================================ */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        // If category is being updated, validate it
        if (updates.category) {
            if (!mongoose.Types.ObjectId.isValid(updates.category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID format. Please provide a valid category ID.",
                    error: `"${updates.category}" is not a valid MongoDB ObjectId`
                });
            }

            // Verify category exists
            const categoryExists = await Category.findById(updates.category);
            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                    error: `Category with ID "${updates.category}" does not exist`
                });
            }
        }

        const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        console.error("Update product error:", error);
        
        // Handle MongoDB cast errors
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

/* ============================================================
   DELETE PRODUCT (Admin Only)
============================================================ */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET ALL PRODUCTS (Admin - with advanced filters)
============================================================ */
const getAdminProducts = async (req, res) => {
    try {
        const { 
            search, 
            category, 
            minPrice, 
            maxPrice, 
            minStock, 
            maxStock,
            isAvailable,
            page = 1, 
            limit = 50 
        } = req.query;

        let query = {};

        // Search by text
        if (search && search.trim().length > 0) {
            const searchTerm = search.trim();
            const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
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

        const products = await Product.find(query)
            .populate("category", "name")
            .populate("createdBy", "firstname lastname")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Product.countDocuments(query);

        // Format products for admin view
        const formattedProducts = products.map(product => {
            const productObj = product.toObject();
            return {
                ...productObj,
                status: productObj.isAvailable ? "active" : "inactive"
            };
        });

        res.json({
            success: true,
            products: formattedProducts,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get admin products error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getAdminProducts,
    getRecommendedProducts,
    getFeaturedProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
