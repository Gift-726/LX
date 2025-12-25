const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    getAllCategories,
    getTopLevelCategories,
    createCategory,
    getCategoryById,
    getActiveCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

// Public routes
router.get("/", getAllCategories);
router.get("/top-level", getTopLevelCategories);
router.get("/active", getActiveCategory); // Returns user's last selected category or first category
router.get("/:id", getCategoryById);

// Admin routes
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;
