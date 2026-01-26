import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  initializePayment,
  verifyPayment,
  getPaymentStatus,
  refundPayment
} from '../controllers/paymentController';

const router = express.Router();

// User routes (require authentication)
router.post('/initialize', protect, initializePayment);
router.get('/verify/:reference', protect, verifyPayment);
router.get('/status/:orderId', protect, getPaymentStatus);

// Admin routes
router.post('/refund/:orderId', protect, admin, refundPayment);

export default router;
