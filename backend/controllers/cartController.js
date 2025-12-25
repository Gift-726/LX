/**
 * Cart Controller
 * Handles shopping cart operations
 */

const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");

/* ============================================================
   GET CART
============================================================ */
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });

        // Create cart if it doesn't exist
        if (!cart) {
            cart = await Cart.create({ user: req.user._id });
        }

        // Get all cart items with populated product and variant
        const cartItems = await CartItem.find({ cart: cart._id })
            .populate("product", "title price currency images brand")
            .populate("variant", "size color colorCode price stock images");

        // Calculate totals
        let subtotal = 0;
        const items = cartItems.map(item => {
            const itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;
            
            return {
                _id: item._id,
                product: item.product,
                variant: item.variant,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                price: item.price,
                subtotal: itemSubtotal
            };
        });

        res.json({
            success: true,
            cart: {
                _id: cart._id,
                items,
                subtotal,
                itemCount: items.length,
                totalItems: items.reduce((sum, item) => sum + item.quantity, 0)
            }
        });

    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   ADD TO CART
============================================================ */
const addToCart = async (req, res) => {
    try {
        const { productId, variantId, size, color, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Get or create cart
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id });
        }

        let price = product.price;
        let stock = product.stock;
        let finalVariant = null;

        // If variant is provided, validate it
        if (variantId) {
            if (!mongoose.Types.ObjectId.isValid(variantId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid variant ID format"
                });
            }

            const variant = await ProductVariant.findOne({
                _id: variantId,
                product: productId
            });

            if (!variant) {
                return res.status(404).json({
                    success: false,
                    message: "Product variant not found"
                });
            }

            finalVariant = variant;
            price = variant.price || product.price;
            stock = variant.stock;
        } else if (size || color) {
            // Legacy support: if size/color provided but no variant, try to find variant
            const variant = await ProductVariant.findOne({
                product: productId,
                size: size || { $exists: false },
                color: color || { $exists: false }
            });

            if (variant) {
                finalVariant = variant;
                price = variant.price || product.price;
                stock = variant.stock;
            }
        }

        // Check stock availability
        if (stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Only ${stock} available.`
            });
        }

        // Check if item already exists in cart
        const existingItem = await CartItem.findOne({
            cart: cart._id,
            product: productId,
            variant: finalVariant ? finalVariant._id : null
        });

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            
            if (stock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock. Only ${stock} available.`
                });
            }

            existingItem.quantity = newQuantity;
            await existingItem.save();

            return res.json({
                success: true,
                message: "Cart updated",
                cartItem: existingItem
            });
        }

        // Create new cart item
        const cartItem = await CartItem.create({
            cart: cart._id,
            product: productId,
            variant: finalVariant ? finalVariant._id : null,
            size: size || (finalVariant ? finalVariant.size : null),
            color: color || (finalVariant ? finalVariant.color : null),
            quantity,
            price
        });

        res.status(201).json({
            success: true,
            message: "Item added to cart",
            cartItem
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UPDATE CART ITEM
============================================================ */
const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        // Get cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Get cart item
        const cartItem = await CartItem.findOne({
            _id: id,
            cart: cart._id
        }).populate("variant").populate("product");

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        // Check stock availability
        let stock = cartItem.product.stock;
        if (cartItem.variant) {
            stock = cartItem.variant.stock;
        }

        if (stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Only ${stock} available.`
            });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        res.json({
            success: true,
            message: "Cart item updated",
            cartItem
        });

    } catch (error) {
        console.error("Update cart item error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   REMOVE FROM CART
============================================================ */
const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;

        // Get cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Remove cart item
        const cartItem = await CartItem.findOneAndDelete({
            _id: id,
            cart: cart._id
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        res.json({
            success: true,
            message: "Item removed from cart"
        });

    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CLEAR CART
============================================================ */
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        await CartItem.deleteMany({ cart: cart._id });

        res.json({
            success: true,
            message: "Cart cleared"
        });

    } catch (error) {
        console.error("Clear cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};

