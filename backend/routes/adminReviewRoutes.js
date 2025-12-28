const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    getReviewsOverview,
    getReviewsAndFeedback,
    replyToReview
} = require("../controllers/adminReviewController");

// All routes require admin authentication
router.get("/overview", protect, admin, getReviewsOverview);
router.get("/", protect, admin, getReviewsAndFeedback);
router.put("/:id/reply", protect, admin, replyToReview);

module.exports = router;


