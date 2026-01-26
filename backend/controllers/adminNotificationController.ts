/**
 * Admin Notification Management Controller
 * Handles admin notification creation, scheduling, and management
 */

import { Request, Response } from 'express';
import Notification, { RecipientType, NotificationType, DeliveryMethod } from '../models/Notification';
import User from '../models/User';

interface CreateNotificationBody {
  recipientType: RecipientType;
  title: string;
  message: string;
  header?: string;
  body?: string;
  type?: NotificationType;
  relatedId?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  deliveryMethod?: DeliveryMethod[];
  isScheduled?: boolean;
  userId?: string;
}

/* ============================================================
   GET ALL NOTIFICATIONS (Admin - All Users)
============================================================ */
const getAllNotifications = async (req: Request<{}, {}, {}, { recipientType?: string; isSent?: string; page?: string; limit?: string }>, res: Response): Promise<void> => {
  try {
    const { recipientType, isSent, page = '1', limit = '50' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query: any = {};
    if (recipientType) query.recipientType = recipientType;
    if (isSent !== undefined) query.isSent = isSent === 'true';

    const notifications = await Notification.find(query)
      .populate('user', 'firstname lastname email')
      .populate('createdBy', 'firstname lastname email')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Notification.countDocuments(query);

    res.json({
      success: true,
      notifications,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   CREATE NOTIFICATION (Admin)
============================================================ */
const createNotification = async (req: Request<{}, {}, CreateNotificationBody>, res: Response): Promise<void> => {
  try {
    const {
      recipientType,
      title,
      message,
      header,
      body,
      type,
      relatedId,
      scheduledDate,
      scheduledTime,
      deliveryMethod,
      isScheduled,
      userId
    } = req.body;

    if (!title || !message) {
      res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
      return;
    }

    // Parse scheduled date and time
    let scheduledDateTime: Date | null = null;
    if (scheduledDate && scheduledTime) {
      const [time, period] = scheduledTime.split(' ');
      const [hours, minutes] = time.split(':');
      let hour24 = parseInt(hours);
      if (period === 'pm' && hour24 !== 12) hour24 += 12;
      if (period === 'am' && hour24 === 12) hour24 = 0;

      scheduledDateTime = new Date(scheduledDate);
      scheduledDateTime.setHours(hour24, parseInt(minutes), 0, 0);
    }

    // If recipientType is "all", "users", or "admins", create notification template
    // Otherwise, create for specific user
    if (['all', 'users', 'admins'].includes(recipientType)) {
      // Create a template notification (will be sent to users later)
      const notification = await Notification.create({
        recipientType,
        title,
        message,
        header: header || title,
        body: body || message,
        type: type || 'system',
        relatedId,
        scheduledDate: scheduledDateTime || undefined,
        scheduledTime,
        deliveryMethod: deliveryMethod || ['push'],
        isScheduled: isScheduled || false,
        isSent: false,
        createdBy: req.user!._id
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate('createdBy', 'firstname lastname email');

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        notification: populatedNotification
      });
    } else {
      // Create for specific user
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required for specific user notifications'
        });
        return;
      }

      const notification = await Notification.create({
        user: userId,
        recipientType: 'user',
        title,
        message,
        header: header || title,
        body: body || message,
        type: type || 'system',
        relatedId,
        scheduledDate: scheduledDateTime || undefined,
        scheduledTime,
        deliveryMethod: deliveryMethod || ['push'],
        isScheduled: isScheduled || false,
        isSent: !isScheduled, // If not scheduled, mark as sent
        sentAt: !isScheduled ? new Date() : undefined,
        createdBy: req.user!._id
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate('user', 'firstname lastname email')
        .populate('createdBy', 'firstname lastname email');

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        notification: populatedNotification
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE NOTIFICATION (Admin)
============================================================ */
const updateNotification = async (req: Request<{ id: string }, {}, Partial<CreateNotificationBody>>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: any = req.body;

    // Parse scheduled date and time if provided
    if (updates.scheduledDate && updates.scheduledTime) {
      const [time, period] = updates.scheduledTime.split(' ');
      const [hours, minutes] = time.split(':');
      let hour24 = parseInt(hours);
      if (period === 'pm' && hour24 !== 12) hour24 += 12;
      if (period === 'am' && hour24 === 12) hour24 = 0;

      const scheduledDateTime = new Date(updates.scheduledDate);
      scheduledDateTime.setHours(hour24, parseInt(minutes), 0, 0);
      updates.scheduledDate = scheduledDateTime;
    }

    const notification = await Notification.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate('user', 'firstname lastname email')
      .populate('createdBy', 'firstname lastname email');

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Notification updated successfully',
      notification
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   DELETE NOTIFICATION (Admin)
============================================================ */
const deleteNotification = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   SEND NOTIFICATION (Admin - Send scheduled or immediate)
============================================================ */
const sendNotification = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    // If broadcast notification, send to all users
    if (['all', 'users', 'admins'].includes(notification.recipientType)) {
      let userQuery: any = {};
      if (notification.recipientType === 'users') {
        userQuery.role = 'user';
      } else if (notification.recipientType === 'admins') {
        userQuery.role = 'admin';
      }

      const users = await User.find(userQuery).select('_id');

      // Create notifications for all users
      const notificationsToCreate = users.map(user => ({
        user: user._id,
        title: notification.title,
        message: notification.message,
        header: notification.header,
        body: notification.body,
        type: notification.type,
        relatedId: notification.relatedId,
        deliveryMethod: notification.deliveryMethod,
        isRead: false,
        isSent: true,
        sentAt: new Date()
      }));

      await Notification.insertMany(notificationsToCreate);

      // Mark original as sent
      notification.isSent = true;
      notification.sentAt = new Date();
      await notification.save();
    } else {
      // Single user notification
      notification.isSent = true;
      notification.sentAt = new Date();
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Notification sent successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification
};
