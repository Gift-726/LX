/**
 * User Controller
 * Handles user profile, search history, and notifications
 */

const User = require("../models/User");
const SearchHistory = require("../models/SearchHistory");
const Notification = require("../models/Notification");
const Wishlist = require("../models/Wishlist");

/* ============================================================
   GET USER PROFILE
============================================================ */
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -resetCode -resetCodeExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET SEARCH HISTORY
============================================================ */
const getSearchHistory = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const history = await SearchHistory.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.json({
            success: true,
            history
        });

    } catch (error) {
        console.error("Get search history error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   SAVE SEARCH HISTORY
============================================================ */
const saveSearchHistory = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        // Check if this exact query already exists recently (within last hour)
        const existingSearch = await SearchHistory.findOne({
            user: req.user._id,
            query,
            createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
        });

        if (!existingSearch) {
            await SearchHistory.create({
                user: req.user._id,
                query
            });
        }

        res.json({
            success: true,
            message: "Search history saved"
        });

    } catch (error) {
        console.error("Save search history error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CLEAR SEARCH HISTORY
============================================================ */
const clearSearchHistory = async (req, res) => {
    try {
        await SearchHistory.deleteMany({ user: req.user._id });

        res.json({
            success: true,
            message: "Search history cleared"
        });

    } catch (error) {
        console.error("Clear search history error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET NOTIFICATIONS
============================================================ */
const getNotifications = async (req, res) => {
    try {
        const { limit = 20, page = 1 } = req.query;

        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Notification.countDocuments({ user: req.user._id });

        res.json({
            success: true,
            notifications,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET UNREAD NOTIFICATION COUNT
============================================================ */
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user._id,
            isRead: false
        });

        res.json({
            success: true,
            count
        });

    } catch (error) {
        console.error("Get unread count error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   MARK NOTIFICATION AS READ
============================================================ */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.json({
            success: true,
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        console.error("Mark as read error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET WISHLIST
============================================================ */
const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.find({ user: req.user._id })
            .populate("product")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            wishlist: wishlist.map(item => item.product)
        });

    } catch (error) {
        console.error("Get wishlist error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   ADD TO WISHLIST
============================================================ */
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Validate product ID format
        const mongoose = require("mongoose");
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        // Check if product exists
        const Product = require("../models/Product");
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if already in wishlist
        const existing = await Wishlist.findOne({
            user: req.user._id,
            product: productId
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        await Wishlist.create({
            user: req.user._id,
            product: productId
        });

        res.json({
            success: true,
            message: "Product added to wishlist"
        });

    } catch (error) {
        console.error("Add to wishlist error:", error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Product already in wishlist"
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
   REMOVE FROM WISHLIST
============================================================ */
const removeFromWishlist = async (req, res) => {
    try {
        const { id } = req.params;

        const wishlistItem = await Wishlist.findOneAndDelete({
            user: req.user._id,
            product: id
        });

        if (!wishlistItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        res.json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {
        console.error("Remove from wishlist error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    getSearchHistory,
    saveSearchHistory,
    clearSearchHistory,
    getNotifications,
    getUnreadCount,
    markAsRead,
    getWishlist,
    addToWishlist,
    removeFromWishlist
};
