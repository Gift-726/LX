/**
 * Admin Reviews and Feedback Controller
 * Handles admin review management with statistics
 */

const Review = require("../models/Review");
const Product = require("../models/Product");

/* ============================================================
   GET REVIEWS AND FEEDBACK OVERVIEW (Admin)
============================================================ */
const getReviewsOverview = async (req, res) => {
    try {
        // Get overall statistics
        const totalReviews = await Review.countDocuments({ isPublished: true });
        
        // Calculate average rating
        const reviews = await Review.find({ isPublished: true });
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

        // Rating distribution
        const ratingDistribution = {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length
        };

        res.json({
            success: true,
            overview: {
                averageRating: parseFloat(averageRating),
                totalReviews,
                ratingDistribution
            }
        });

    } catch (error) {
        console.error("Get reviews overview error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET ALL REVIEWS WITH STATISTICS (Admin)
============================================================ */
const getReviewsAndFeedback = async (req, res) => {
    try {
        const { productId, rating, isPublished, page = 1, limit = 20 } = req.query;

        let query = {};
        if (productId) query.product = productId;
        if (rating) query.rating = parseInt(rating);
        if (isPublished !== undefined) query.isPublished = isPublished === 'true';

        const reviews = await Review.find(query)
            .populate("product", "title images")
            .populate("user", "firstname lastname avatar")
            .populate("order", "orderNumber")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Review.countDocuments(query);

        // Get statistics
        const allReviews = await Review.find({ isPublished: true });
        const totalReviews = allReviews.length;
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

        const ratingDistribution = {
            5: allReviews.filter(r => r.rating === 5).length,
            4: allReviews.filter(r => r.rating === 4).length,
            3: allReviews.filter(r => r.rating === 3).length,
            2: allReviews.filter(r => r.rating === 2).length,
            1: allReviews.filter(r => r.rating === 1).length
        };

        res.json({
            success: true,
            reviews,
            statistics: {
                averageRating: parseFloat(averageRating),
                totalReviews,
                ratingDistribution
            },
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get reviews and feedback error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   REPLY TO REVIEW (Admin)
============================================================ */
const replyToReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminResponse } = req.body;

        if (!adminResponse) {
            return res.status(400).json({
                success: false,
                message: "Admin response is required"
            });
        }

        const review = await Review.findByIdAndUpdate(id, {
            adminResponse,
            responseDate: new Date()
        }, { new: true })
            .populate("product", "title images")
            .populate("user", "firstname lastname email");

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.json({
            success: true,
            message: "Reply added successfully",
            review
        });

    } catch (error) {
        console.error("Reply to review error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getReviewsOverview,
    getReviewsAndFeedback,
    replyToReview
};


