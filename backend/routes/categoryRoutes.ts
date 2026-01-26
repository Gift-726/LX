import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  getAllCategories,
  getTopLevelCategories,
  createCategory,
  getCategoryById,
  getActiveCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/top-level', getTopLevelCategories);
router.get('/active', getActiveCategory); // Returns user's last selected category or first category
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
