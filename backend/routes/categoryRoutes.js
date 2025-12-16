const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    getAllCategories,
    getTopLevelCategories,
    createCategory,
    getCategoryById
} = require("../controllers/categoryController");

// Public routes
router.get("/", getAllCategories);
router.get("/top-level", getTopLevelCategories);
router.get("/:id", getCategoryById);

// Admin routes
router.post("/", protect, admin, createCategory);

module.exports = router;
