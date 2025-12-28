const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    createOrder,
    getUserOrders,
    getUserOrdersByStatus,
    getOrderById,
    getAdminOrderById,
    getOrderByNumber,
    trackOrder,
    acceptOrder,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
} = require("../controllers/orderController");

// User routes (require authentication)
router.post("/", protect, createOrder);
router.get("/", protect, getUserOrders);
router.get("/status/:status", protect, getUserOrdersByStatus);
router.get("/number/:orderNumber", protect, getOrderByNumber);
router.get("/:id/track", protect, trackOrder);
router.put("/:id/accept", protect, acceptOrder);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);

// Admin routes
router.get("/admin/all", protect, admin, getAllOrders);
router.get("/admin/:id", protect, admin, getAdminOrderById);
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;

