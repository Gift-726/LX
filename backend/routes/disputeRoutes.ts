import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  createDispute,
  getUserDisputes,
  getDisputeById,
  getAllDisputes,
  updateDisputeStatus
} from '../controllers/disputeController';

const router = express.Router();

// User routes (require authentication)
router.post('/', protect, createDispute);
router.get('/', protect, getUserDisputes);
router.get('/:id', protect, getDisputeById);

// Admin routes
router.get('/admin/all', protect, admin, getAllDisputes);
router.put('/:id/status', protect, admin, updateDisputeStatus);

export default router;
