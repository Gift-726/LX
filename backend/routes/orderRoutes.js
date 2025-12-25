const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    createOrder,
    getUserOrders,
    getOrderById,
    getOrderByNumber,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
} = require("../controllers/orderController");

// User routes (require authentication)
router.post("/", protect, createOrder);
router.get("/", protect, getUserOrders);
router.get("/number/:orderNumber", protect, getOrderByNumber);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);

// Admin routes
router.get("/admin/all", protect, admin, getAllOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;

