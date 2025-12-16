const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    createProduct,
    getProducts,
    getRecommendedProducts,
    getFeaturedProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

// Public routes
router.get("/", getProducts);
router.get("/recommended", getRecommendedProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);

// Admin routes
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
