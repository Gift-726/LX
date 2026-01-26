import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  getSystemSettings,
  updateSystemSettings
} from '../controllers/systemSettingsController';

const router = express.Router();

// All routes require admin authentication
router.get('/', protect, admin, getSystemSettings);
router.put('/', protect, admin, updateSystemSettings);

export default router;
