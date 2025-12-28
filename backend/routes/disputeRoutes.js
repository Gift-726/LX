const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    createDispute,
    getUserDisputes,
    getDisputeById,
    getAllDisputes,
    updateDisputeStatus
} = require("../controllers/disputeController");

// User routes (require authentication)
router.post("/", protect, createDispute);
router.get("/", protect, getUserDisputes);
router.get("/:id", protect, getDisputeById);

// Admin routes
router.get("/admin/all", protect, admin, getAllDisputes);
router.put("/:id/status", protect, admin, updateDisputeStatus);

module.exports = router;

