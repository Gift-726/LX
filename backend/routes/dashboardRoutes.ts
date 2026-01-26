import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  getDashboard,
  getDashboardOverview,
  getSalesTrend,
  getPopularItems
} from '../controllers/dashboardController';

const router = express.Router();

// All routes require admin authentication
router.get('/', protect, admin, getDashboard);
router.get('/overview', protect, admin, getDashboardOverview);
router.get('/sales-trend', protect, admin, getSalesTrend);
router.get('/popular-items', protect, admin, getPopularItems);

export default router;
