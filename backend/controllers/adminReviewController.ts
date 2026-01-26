/**
 * Admin Reviews and Feedback Controller
 * Handles admin review management with statistics
 */

import { Request, Response } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';

/* ============================================================
   GET REVIEWS AND FEEDBACK OVERVIEW (Admin)
============================================================ */
const getReviewsOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get overall statistics
    const totalReviews = await Review.countDocuments({ isPublished: true });
    
    // Calculate average rating
    const reviews = await Review.find({ isPublished: true });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? parseFloat((totalRating / totalReviews).toFixed(1)) : 0;

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
        averageRating,
        totalReviews,
        ratingDistribution
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get reviews overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET ALL REVIEWS WITH STATISTICS (Admin)
============================================================ */
const getReviewsAndFeedback = async (req: Request<{}, {}, {}, { productId?: string; rating?: string; isPublished?: string; page?: string; limit?: string }>, res: Response): Promise<void> => {
  try {
    const { productId, rating, isPublished, page = '1', limit = '20' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query: any = {};
    if (productId) query.product = productId;
    if (rating) query.rating = parseInt(rating);
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const reviews = await Review.find(query)
      .populate('product', 'title images')
      .populate('user', 'firstname lastname avatar')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Review.countDocuments(query);

    // Get statistics
    const allReviews = await Review.find({ isPublished: true });
    const totalReviews = allReviews.length;
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? parseFloat((totalRating / totalReviews).toFixed(1)) : 0;

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
        averageRating,
        totalReviews,
        ratingDistribution
      },
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get reviews and feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   REPLY TO REVIEW (Admin)
============================================================ */
const replyToReview = async (req: Request<{ id: string }, {}, { adminResponse: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;

    if (!adminResponse) {
      res.status(400).json({
        success: false,
        message: 'Admin response is required'
      });
      return;
    }

    const review = await Review.findByIdAndUpdate(id, {
      adminResponse,
      responseDate: new Date()
    }, { new: true })
      .populate('product', 'title images')
      .populate('user', 'firstname lastname email');

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Reply added successfully',
      review
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Reply to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  getReviewsOverview,
  getReviewsAndFeedback,
  replyToReview
};
