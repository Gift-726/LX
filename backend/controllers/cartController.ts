/**
 * Cart Controller
 * Handles shopping cart operations
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart';
import CartItem from '../models/CartItem';
import Product from '../models/Product';
import ProductVariant from '../models/ProductVariant';

interface AddToCartBody {
  productId: string;
  variantId?: string;
  size?: string;
  color?: string;
  quantity?: number;
}

interface UpdateCartItemBody {
  quantity: number;
}

/* ============================================================
   GET CART
============================================================ */
const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    let cart = await Cart.findOne({ user: req.user!._id });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await Cart.create({ user: req.user!._id });
    }

    // Get all cart items with populated product and variant
    const cartItems = await CartItem.find({ cart: cart._id })
      .populate('product', 'title price currency images brand')
      .populate('variant', 'size color colorCode price stock images');

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   ADD TO CART
============================================================ */
const addToCart = async (req: Request<{}, {}, AddToCartBody>, res: Response): Promise<void> => {
  try {
    const { productId, variantId, size, color, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
      return;
    }

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
      return;
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user!._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user!._id });
    }

    let price = product.price;
    let stock = product.stock;
    let finalVariant: any = null;

    // If variant is provided, validate it
    if (variantId) {
      if (!mongoose.Types.ObjectId.isValid(variantId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid variant ID format'
        });
        return;
      }

      const variant = await ProductVariant.findOne({
        _id: variantId,
        product: productId
      });

      if (!variant) {
        res.status(404).json({
          success: false,
          message: 'Product variant not found'
        });
        return;
      }

      finalVariant = variant;
      price = variant.price || product.price;
      stock = variant.stock;
    } else if (size || color) {
      // Legacy support: if size/color provided but no variant, try to find variant
      const variantQuery: any = { product: productId };
      if (size) variantQuery.size = size;
      if (color) variantQuery.color = color;

      const variant = await ProductVariant.findOne(variantQuery);

      if (variant) {
        finalVariant = variant;
        price = variant.price || product.price;
        stock = variant.stock;
      }
    }

    // Check stock availability
    if (stock < quantity) {
      res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${stock} available.`
      });
      return;
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
        res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${stock} available.`
        });
        return;
      }

      existingItem.quantity = newQuantity;
      await existingItem.save();

      res.json({
        success: true,
        message: 'Cart updated',
        cartItem: existingItem
      });
      return;
    }

    // Create new cart item
    const cartItem = await CartItem.create({
      cart: cart._id,
      product: productId,
      variant: finalVariant ? finalVariant._id : undefined,
      size: size || (finalVariant ? finalVariant.size : undefined),
      color: color || (finalVariant ? finalVariant.color : undefined),
      quantity,
      price
    });

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      cartItem
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE CART ITEM
============================================================ */
const updateCartItem = async (req: Request<{ id: string }, {}, UpdateCartItemBody>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
      return;
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user!._id });
    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
      return;
    }

    // Get cart item
    const cartItem = await CartItem.findOne({
      _id: id,
      cart: cart._id
    }).populate('variant').populate('product');

    if (!cartItem) {
      res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
      return;
    }

    // Check stock availability
    const product = cartItem.product as any;
    const variant = cartItem.variant as any;
    
    let stock = product.stock;
    if (variant) {
      stock = variant.stock;
    }

    if (stock < quantity) {
      res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${stock} available.`
      });
      return;
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      success: true,
      message: 'Cart item updated',
      cartItem
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   REMOVE FROM CART
============================================================ */
const removeFromCart = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get cart
    const cart = await Cart.findOne({ user: req.user!._id });
    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
      return;
    }

    // Remove cart item
    const cartItem = await CartItem.findOneAndDelete({
      _id: id,
      cart: cart._id
    });

    if (!cartItem) {
      res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   CLEAR CART
============================================================ */
const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!._id });
    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
      return;
    }

    await CartItem.deleteMany({ cart: cart._id });

    res.json({
      success: true,
      message: 'Cart cleared'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
