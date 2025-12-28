/**
 * Admin Notification Management Controller
 * Handles admin notification creation, scheduling, and management
 */

const Notification = require("../models/Notification");
const User = require("../models/User");

/* ============================================================
   GET ALL NOTIFICATIONS (Admin - All Users)
============================================================ */
const getAllNotifications = async (req, res) => {
    try {
        const { recipientType, isSent, page = 1, limit = 50 } = req.query;

        let query = {};
        if (recipientType) query.recipientType = recipientType;
        if (isSent !== undefined) query.isSent = isSent === 'true';

        const notifications = await Notification.find(query)
            .populate("user", "firstname lastname email")
            .populate("createdBy", "firstname lastname email")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Notification.countDocuments(query);

        res.json({
            success: true,
            notifications,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get all notifications error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CREATE NOTIFICATION (Admin)
============================================================ */
const createNotification = async (req, res) => {
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
            isScheduled
        } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required"
            });
        }

        // Parse scheduled date and time
        let scheduledDateTime = null;
        if (scheduledDate && scheduledTime) {
            const [time, period] = scheduledTime.split(" ");
            const [hours, minutes] = time.split(":");
            let hour24 = parseInt(hours);
            if (period === "pm" && hour24 !== 12) hour24 += 12;
            if (period === "am" && hour24 === 12) hour24 = 0;

            scheduledDateTime = new Date(scheduledDate);
            scheduledDateTime.setHours(hour24, parseInt(minutes), 0, 0);
        }

        // If recipientType is "all", "users", or "admins", create notification template
        // Otherwise, create for specific user
        if (["all", "users", "admins"].includes(recipientType)) {
            // Create a template notification (will be sent to users later)
            const notification = await Notification.create({
                recipientType,
                title,
                message,
                header: header || title,
                body: body || message,
                type: type || "system",
                relatedId,
                scheduledDate: scheduledDateTime,
                scheduledTime,
                deliveryMethod: deliveryMethod || ["push"],
                isScheduled: isScheduled || false,
                isSent: false,
                createdBy: req.user._id
            });

            const populatedNotification = await Notification.findById(notification._id)
                .populate("createdBy", "firstname lastname email");

            res.status(201).json({
                success: true,
                message: "Notification created successfully",
                notification: populatedNotification
            });
        } else {
            // Create for specific user
            if (!req.body.userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required for specific user notifications"
                });
            }

            const notification = await Notification.create({
                user: req.body.userId,
                recipientType: "user",
                title,
                message,
                header: header || title,
                body: body || message,
                type: type || "system",
                relatedId,
                scheduledDate: scheduledDateTime,
                scheduledTime,
                deliveryMethod: deliveryMethod || ["push"],
                isScheduled: isScheduled || false,
                isSent: !isScheduled, // If not scheduled, mark as sent
                sentAt: !isScheduled ? new Date() : null,
                createdBy: req.user._id
            });

            const populatedNotification = await Notification.findById(notification._id)
                .populate("user", "firstname lastname email")
                .populate("createdBy", "firstname lastname email");

            res.status(201).json({
                success: true,
                message: "Notification created successfully",
                notification: populatedNotification
            });
        }

    } catch (error) {
        console.error("Create notification error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UPDATE NOTIFICATION (Admin)
============================================================ */
const updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Parse scheduled date and time if provided
        if (updates.scheduledDate && updates.scheduledTime) {
            const [time, period] = updates.scheduledTime.split(" ");
            const [hours, minutes] = time.split(":");
            let hour24 = parseInt(hours);
            if (period === "pm" && hour24 !== 12) hour24 += 12;
            if (period === "am" && hour24 === 12) hour24 = 0;

            const scheduledDateTime = new Date(updates.scheduledDate);
            scheduledDateTime.setHours(hour24, parseInt(minutes), 0, 0);
            updates.scheduledDate = scheduledDateTime;
        }

        const notification = await Notification.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        })
            .populate("user", "firstname lastname email")
            .populate("createdBy", "firstname lastname email");

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.json({
            success: true,
            message: "Notification updated successfully",
            notification
        });

    } catch (error) {
        console.error("Update notification error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   DELETE NOTIFICATION (Admin)
============================================================ */
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.json({
            success: true,
            message: "Notification deleted successfully"
        });

    } catch (error) {
        console.error("Delete notification error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   SEND NOTIFICATION (Admin - Send scheduled or immediate)
============================================================ */
const sendNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        // If broadcast notification, send to all users
        if (["all", "users", "admins"].includes(notification.recipientType)) {
            let userQuery = {};
            if (notification.recipientType === "users") {
                userQuery.role = "user";
            } else if (notification.recipientType === "admins") {
                userQuery.role = "admin";
            }

            const users = await User.find(userQuery).select("_id");

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
            message: "Notification sent successfully"
        });

    } catch (error) {
        console.error("Send notification error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getAllNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    sendNotification
};


