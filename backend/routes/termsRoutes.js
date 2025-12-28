const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    getAllTerms,
    getActiveTerms,
    getTermsById,
    createTerms,
    updateTerms,
    deleteTerms
} = require("../controllers/termsController");

// Public routes
router.get("/active", getActiveTerms);

// Admin routes
router.get("/", protect, admin, getAllTerms);
router.post("/", protect, admin, createTerms);
router.get("/:id", protect, admin, getTermsById);
router.put("/:id", protect, admin, updateTerms);
router.delete("/:id", protect, admin, deleteTerms);

module.exports = router;


