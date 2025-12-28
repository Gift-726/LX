const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    createReview,
    getProductReviews,
    getUserReviews,
    updateReview,
    deleteReview,
    getAllReviews,
    updateReviewStatus
} = require("../controllers/reviewController");

// Public routes
router.get("/product/:productId", getProductReviews);

// User routes (require authentication)
router.post("/", protect, createReview);
router.get("/my-reviews", protect, getUserReviews);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

// Admin routes
router.get("/admin/all", protect, admin, getAllReviews);
router.put("/:id/status", protect, admin, updateReviewStatus);

module.exports = router;

