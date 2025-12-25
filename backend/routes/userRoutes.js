const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
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
} = require("../controllers/userController");

// All routes require authentication
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Search history routes
router.get("/search-history", protect, getSearchHistory);
router.post("/search-history", protect, saveSearchHistory);
router.delete("/search-history", protect, clearSearchHistory);

// Notification routes
router.get("/notifications", protect, getNotifications);
router.get("/notifications/unread-count", protect, getUnreadCount);
router.put("/notifications/:id/read", protect, markAsRead);

// Favorites routes
router.get("/favorites", protect, getFavorites);
router.post("/favorites", protect, addToFavorites);
router.delete("/favorites/:id", protect, removeFromFavorites);

module.exports = router;
