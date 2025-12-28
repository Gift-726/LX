const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    validateDiscountCode,
    applyDiscountCode,
    getAvailableCoupons,
    getDiscountCodes,
    createDiscountCode,
    updateDiscountCode,
    deleteDiscountCode
} = require("../controllers/discountController");

// Public routes
router.post("/validate", validateDiscountCode);
router.get("/available", getAvailableCoupons); // User-facing coupons endpoint
router.post("/apply", protect, applyDiscountCode);

// Admin routes
router.get("/", protect, admin, getDiscountCodes);
router.post("/", protect, admin, createDiscountCode);
router.put("/:id", protect, admin, updateDiscountCode);
router.delete("/:id", protect, admin, deleteDiscountCode);

module.exports = router;

