const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    getAllNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    sendNotification
} = require("../controllers/adminNotificationController");

// All routes require admin authentication
router.get("/", protect, admin, getAllNotifications);
router.post("/", protect, admin, createNotification);
router.put("/:id", protect, admin, updateNotification);
router.post("/:id/send", protect, admin, sendNotification);
router.delete("/:id", protect, admin, deleteNotification);

module.exports = router;


