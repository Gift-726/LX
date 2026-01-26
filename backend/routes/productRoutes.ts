import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  createProduct,
  getProducts,
  getAdminProducts,
  getRecommendedProducts,
  getFeaturedProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/recommended', getRecommendedProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

// Admin routes
router.get('/admin/all', protect, admin, getAdminProducts);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
