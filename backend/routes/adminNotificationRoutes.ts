import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification
} from '../controllers/adminNotificationController';

const router = express.Router();

// All routes require admin authentication
router.get('/', protect, admin, getAllNotifications);
router.post('/', protect, admin, createNotification);
router.put('/:id', protect, admin, updateNotification);
router.post('/:id/send', protect, admin, sendNotification);
router.delete('/:id', protect, admin, deleteNotification);

export default router;
