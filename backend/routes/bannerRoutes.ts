import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  getAllBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  previewBanner
} from '../controllers/bannerController';

const router = express.Router();

// Public routes
router.get('/active', getActiveBanners);

// Admin routes
router.get('/', protect, admin, getAllBanners);
router.post('/', protect, admin, createBanner);
router.get('/:id', protect, admin, getBannerById);
router.get('/:id/preview', protect, admin, previewBanner);
router.put('/:id', protect, admin, updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

export default router;
