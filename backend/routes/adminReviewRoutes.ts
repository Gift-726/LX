import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  getReviewsOverview,
  getReviewsAndFeedback,
  replyToReview
} from '../controllers/adminReviewController';

const router = express.Router();

// All routes require admin authentication
router.get('/overview', protect, admin, getReviewsOverview);
router.get('/', protect, admin, getReviewsAndFeedback);
router.put('/:id/reply', protect, admin, replyToReview);

export default router;
