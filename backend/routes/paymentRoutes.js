const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    initializePayment,
    verifyPayment,
    getPaymentStatus,
    refundPayment
} = require("../controllers/paymentController");

// User routes (require authentication)
router.post("/initialize", protect, initializePayment);
router.get("/verify/:reference", protect, verifyPayment);
router.get("/status/:orderId", protect, getPaymentStatus);

// Admin routes
router.post("/refund/:orderId", protect, admin, refundPayment);

module.exports = router;

