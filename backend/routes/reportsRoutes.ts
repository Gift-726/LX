import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  getReports,
  getReportsOverview,
  getRevenueChart,
  getSalesTrendChart,
  getUserEngagementChart,
  exportAsPDF,
  exportAsExcel
} from '../controllers/reportsController';

const router = express.Router();

// All routes require admin authentication
router.get('/', protect, admin, getReports);
router.get('/overview', protect, admin, getReportsOverview);
router.get('/revenue-chart', protect, admin, getRevenueChart);
router.get('/sales-trend-chart', protect, admin, getSalesTrendChart);
router.get('/user-engagement-chart', protect, admin, getUserEngagementChart);
router.get('/export/pdf', protect, admin, exportAsPDF);
router.get('/export/excel', protect, admin, exportAsExcel);

export default router;
