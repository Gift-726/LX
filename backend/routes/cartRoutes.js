const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require("../controllers/cartController");

// All routes require authentication
router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.put("/:id", protect, updateCartItem);
router.delete("/:id", protect, removeFromCart);
router.delete("/", protect, clearCart);

module.exports = router;

