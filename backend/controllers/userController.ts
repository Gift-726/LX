/**
 * User Controller
 * Handles user profile, search history, and notifications
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import SearchHistory from '../models/SearchHistory';
import Notification from '../models/Notification';
import Favorites from '../models/Favorites';
import Product from '../models/Product';

interface UpdateProfileBody {
  title?: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Dr' | 'Prof' | '';
  firstname?: string;
  lastname?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other' | '';
  avatar?: string;
  marketingPreferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

interface SaveSearchHistoryBody {
  query: string;
}

interface AddToFavoritesBody {
  productId: string;
}

/* ============================================================
   GET USER PROFILE
============================================================ */
const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id)
      .select('-password -resetCode -resetCodeExpiry')
      .populate('defaultAddress')
      .populate('lastSelectedCategory', 'name image');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE USER PROFILE
============================================================ */
const updateProfile = async (req: Request<{}, {}, UpdateProfileBody>, res: Response): Promise<void> => {
  try {
    const { title, firstname, lastname, phone, gender, avatar, marketingPreferences } = req.body;

    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Validate gender if provided
    if (gender !== undefined && gender !== '' && !['Male', 'Female', 'Other'].includes(gender)) {
      res.status(400).json({
        success: false,
        message: 'Invalid gender value. Must be one of: Male, Female, Other'
      });
      return;
    }

    // Update allowed fields
    if (title !== undefined) user.title = title;
    if (firstname !== undefined) user.firstname = firstname;
    if (lastname !== undefined) user.lastname = lastname;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (avatar !== undefined) user.avatar = avatar;
    if (marketingPreferences !== undefined) {
      user.marketingPreferences = {
        email: user.marketingPreferences?.email ?? false,
        sms: user.marketingPreferences?.sms ?? false,
        push: user.marketingPreferences?.push ?? false,
        ...marketingPreferences
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET SEARCH HISTORY
============================================================ */
const getSearchHistory = async (req: Request<{}, {}, {}, { limit?: string }>, res: Response): Promise<void> => {
  try {
    const { limit = '10' } = req.query;

    const history = await SearchHistory.find({ user: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      history
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   SAVE SEARCH HISTORY
============================================================ */
const saveSearchHistory = async (req: Request<{}, {}, SaveSearchHistoryBody>, res: Response): Promise<void> => {
  try {
    const { query } = req.body;

    if (!query) {
      res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
      return;
    }

    // Check if this exact query already exists recently (within last hour)
    const existingSearch = await SearchHistory.findOne({
      user: req.user!._id,
      query,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    if (!existingSearch) {
      await SearchHistory.create({
        user: req.user!._id,
        query
      });
    }

    res.json({
      success: true,
      message: 'Search history saved'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Save search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   CLEAR SEARCH HISTORY
============================================================ */
const clearSearchHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    await SearchHistory.deleteMany({ user: req.user!._id });

    res.json({
      success: true,
      message: 'Search history cleared'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Clear search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET NOTIFICATIONS
============================================================ */
const getNotifications = async (req: Request<{}, {}, {}, { limit?: string; page?: string }>, res: Response): Promise<void> => {
  try {
    const { limit = '20', page = '1' } = req.query;

    const limitNum = Number(limit);
    const pageNum = Number(page);

    const notifications = await Notification.find({ user: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Notification.countDocuments({ user: req.user!._id });

    res.json({
      success: true,
      notifications,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET UNREAD NOTIFICATION COUNT
============================================================ */
const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await Notification.countDocuments({
      user: req.user!._id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   MARK NOTIFICATION AS READ
============================================================ */
const markAsRead = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user!._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET FAVORITES (Favorite Stores)
============================================================ */
const getFavorites = async (req: Request<{}, {}, {}, { page?: string; limit?: string }>, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const favorites = await Favorites.find({ user: req.user!._id })
      .populate({
        path: 'product',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Favorites.countDocuments({ user: req.user!._id });

    // Format products with badges and discount info
    const formattedProducts = favorites.map(item => {
      if (!item.product || typeof item.product === 'string') return null;
      
      const product = (item.product as any).toObject ? (item.product as any).toObject() : item.product;
      
      // Calculate badges
      const badges: string[] = [];
      if ((product as any).isNew) badges.push('NEW');
      if ((product as any).isHot) badges.push('HOT');
      if ((product as any).isSale) badges.push('SALE');
      if ((product as any).isLimited) badges.push('LIMITED');
      
      // Calculate discount percentage if originalPrice exists
      let discountPercentage = 0;
      if ((product as any).originalPrice && (product as any).originalPrice > product.price) {
        discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      }
      
      return {
        _id: product._id,
        title: product.title,
        brand: product.brand,
        images: product.images,
        price: product.price,
        originalPrice: (product as any).originalPrice,
        discountPercentage: discountPercentage > 0 ? `${discountPercentage}% OFF` : null,
        badges,
        category: product.category,
        stock: product.stock,
        rating: product.rating || 0,
        reviewCount: (product as any).reviewCount || 0,
        isInFavorites: true,
        addedToFavoritesAt: item.createdAt
      };
    }).filter(Boolean);

    res.json({
      success: true,
      favorites: formattedProducts,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   ADD TO FAVORITES
============================================================ */
const addToFavorites = async (req: Request<{}, {}, AddToFavoritesBody>, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
      return;
    }

    // Validate product ID format
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

    // Check if already in favorites
    const existing = await Favorites.findOne({
      user: req.user!._id,
      product: productId
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'Product already in favorites'
      });
      return;
    }

    await Favorites.create({
      user: req.user!._id,
      product: productId
    });

    res.json({
      success: true,
      message: 'Product added to favorites'
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    
    // Handle duplicate key error
    if (error instanceof Error && (error as any).code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Product already in favorites'
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
   REMOVE FROM FAVORITES
============================================================ */
const removeFromFavorites = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const favoriteItem = await Favorites.findOneAndDelete({
      user: req.user!._id,
      product: id
    });

    if (!favoriteItem) {
      res.status(404).json({
        success: false,
        message: 'Product not found in favorites'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Product removed from favorites'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  getProfile,
  updateProfile,
  getSearchHistory,
  saveSearchHistory,
  clearSearchHistory,
  getNotifications,
  getUnreadCount,
  markAsRead,
  getFavorites,
  addToFavorites,
  removeFromFavorites
};
