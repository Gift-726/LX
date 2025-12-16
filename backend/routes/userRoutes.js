const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
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
} = require("../controllers/userController");

// All routes require authentication
router.get("/profile", protect, getProfile);

// Search history routes
router.get("/search-history", protect, getSearchHistory);
router.post("/search-history", protect, saveSearchHistory);
router.delete("/search-history", protect, clearSearchHistory);

// Notification routes
router.get("/notifications", protect, getNotifications);
router.get("/notifications/unread-count", protect, getUnreadCount);
router.put("/notifications/:id/read", protect, markAsRead);

// Wishlist routes
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist", protect, addToWishlist);
router.delete("/wishlist/:id", protect, removeFromWishlist);

module.exports = router;
