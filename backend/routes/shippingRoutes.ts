import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  getShippingMethods,
  getShippingMethodById,
  calculateShippingCost,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod
} from '../controllers/shippingController';

const router = express.Router();

// Public routes
router.get('/', getShippingMethods);
router.get('/:id', getShippingMethodById);

// Authenticated routes
router.post('/calculate', protect, calculateShippingCost);

// Admin routes
router.post('/', protect, admin, createShippingMethod);
router.put('/:id', protect, admin, updateShippingMethod);
router.delete('/:id', protect, admin, deleteShippingMethod);

export default router;
