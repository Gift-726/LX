import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  validateDiscountCode,
  applyDiscountCode,
  getAvailableCoupons,
  getDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode
} from '../controllers/discountController';

const router = express.Router();

// Public routes
router.post('/validate', validateDiscountCode);
router.get('/available', getAvailableCoupons); // User-facing coupons endpoint
router.post('/apply', protect, applyDiscountCode);

// Admin routes
router.get('/', protect, admin, getDiscountCodes);
router.post('/', protect, admin, createDiscountCode);
router.put('/:id', protect, admin, updateDiscountCode);
router.delete('/:id', protect, admin, deleteDiscountCode);

export default router;
