const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    getShippingMethods,
    getShippingMethodById,
    calculateShippingCost,
    createShippingMethod,
    updateShippingMethod,
    deleteShippingMethod
} = require("../controllers/shippingController");

// Public routes
router.get("/", getShippingMethods);
router.get("/:id", getShippingMethodById);

// Authenticated routes
router.post("/calculate", protect, calculateShippingCost);

// Admin routes
router.post("/", protect, admin, createShippingMethod);
router.put("/:id", protect, admin, updateShippingMethod);
router.delete("/:id", protect, admin, deleteShippingMethod);

module.exports = router;

