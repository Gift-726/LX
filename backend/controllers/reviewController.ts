/**
 * Review Controller
 * Handles product reviews and feedback
 */

import { Request, Response } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import Order from '../models/Order';

interface CreateReviewBody {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

interface UpdateReviewBody {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

/* ============================================================
   CREATE REVIEW
============================================================ */
const createReview = async (req: Request<{}, {}, CreateReviewBody>, res: Response): Promise<void> => {
  try {
    const { productId, orderId, rating, title, comment, images } = req.body;

    // Validate required fields
    if (!productId || !rating || !comment) {
      res.status(400).json({
        success: false,
        message: 'Product ID, rating, and comment are required'
      });
      return;
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
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

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user!._id,
      product: productId
    });

    if (existingReview) {
      res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
      return;
    }

    // Check if order exists and belongs to user (for verified purchase)
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        user: req.user!._id,
        status: 'delivered'
      });

      if (order) {
        isVerifiedPurchase = true;
      }
    }

    // Create review
    const review = await Review.create({
      product: productId,
      order: orderId || undefined,
      user: req.user!._id,
      rating,
      title: title || undefined,
      comment,
      images: images || [],
      isVerifiedPurchase
    });

    // Update product rating (calculate average)
    const reviews = await Review.find({ 
      product: productId, 
      isPublished: true 
    });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const reviewCount = reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: reviewCount as any
    });

    // Populate for response
    const populatedReview = await Review.findById(review._id)
      .populate('product', 'title images')
      .populate('user', 'firstname lastname')
      .populate('order', 'orderNumber');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: populatedReview
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET PRODUCT REVIEWS
============================================================ */
const getProductReviews = async (req: Request<{ productId: string }, {}, {}, { page?: string; limit?: string; rating?: string }>, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { page = '1', limit = '20', rating } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query: any = { 
      product: productId, 
      isPublished: true 
    };
    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .populate('user', 'firstname lastname')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Review.countDocuments(query);

    // Calculate rating distribution
    const allReviews = await Review.find({ 
      product: productId, 
      isPublished: true 
    });
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
      ratingDistribution,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET USER REVIEWS
============================================================ */
const getUserReviews = async (req: Request<{}, {}, {}, { page?: string; limit?: string }>, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const reviews = await Review.find({ user: req.user!._id })
      .populate('product', 'title images price')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Review.countDocuments({ user: req.user!._id });

    res.json({
      success: true,
      reviews,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE REVIEW
============================================================ */
const updateReview = async (req: Request<{ id: string }, {}, UpdateReviewBody>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;

    const review = await Review.findOne({
      _id: id,
      user: req.user!._id
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found'
      });
      return;
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
        return;
      }
      review.rating = rating;
    }
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;

    await review.save();

    // Update product rating
    const reviews = await Review.find({ 
      product: review.product, 
      isPublished: true 
    });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const reviewCount = reviews.length;

    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviewCount as any
    });

    const populatedReview = await Review.findById(review._id)
      .populate('product', 'title images')
      .populate('user', 'firstname lastname');

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: populatedReview
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   DELETE REVIEW
============================================================ */
const deleteReview = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findOne({
      _id: id,
      user: req.user!._id
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found'
      });
      return;
    }

    const productId = review.product;

    await Review.findByIdAndDelete(id);

    // Update product rating
    const reviews = await Review.find({ 
      product: productId, 
      isPublished: true 
    });
    
    if (reviews.length > 0) {
      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length as any
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0 as any
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET ALL REVIEWS (Admin Only)
============================================================ */
const getAllReviews = async (req: Request<{}, {}, {}, { productId?: string; isPublished?: string; page?: string; limit?: string }>, res: Response): Promise<void> => {
  try {
    const { productId, isPublished, page = '1', limit = '50' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query: any = {};
    if (productId) query.product = productId;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const reviews = await Review.find(query)
      .populate('product', 'title images')
      .populate('user', 'firstname lastname email')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Review.countDocuments(query);

    res.json({
      success: true,
      reviews,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE REVIEW STATUS (Admin Only)
============================================================ */
const updateReviewStatus = async (req: Request<{ id: string }, {}, { isPublished?: boolean; adminResponse?: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isPublished, adminResponse } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found'
      });
      return;
    }

    if (isPublished !== undefined) {
      review.isPublished = isPublished;
    }
    if (adminResponse !== undefined) {
      review.adminResponse = adminResponse;
      review.responseDate = new Date();
    }

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('product', 'title images')
      .populate('user', 'firstname lastname email');

    res.json({
      success: true,
      message: 'Review status updated',
      review: populatedReview
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update review status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  updateReviewStatus
};
