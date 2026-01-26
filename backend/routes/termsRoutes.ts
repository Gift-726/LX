import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  getAllTerms,
  getActiveTerms,
  getTermsById,
  createTerms,
  updateTerms,
  deleteTerms
} from '../controllers/termsController';

const router = express.Router();

// Public routes
router.get('/active', getActiveTerms);

// Admin routes
router.get('/', protect, admin, getAllTerms);
router.post('/', protect, admin, createTerms);
router.get('/:id', protect, admin, getTermsById);
router.put('/:id', protect, admin, updateTerms);
router.delete('/:id', protect, admin, deleteTerms);

export default router;
