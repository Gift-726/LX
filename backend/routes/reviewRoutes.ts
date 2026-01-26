import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  updateReviewStatus
} from '../controllers/reviewController';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// User routes (require authentication)
router.post('/', protect, createReview);
router.get('/my-reviews', protect, getUserReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin routes
router.get('/admin/all', protect, admin, getAllReviews);
router.put('/:id/status', protect, admin, updateReviewStatus);

export default router;
