const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    getSystemSettings,
    updateSystemSettings
} = require("../controllers/systemSettingsController");

// All routes require admin authentication
router.get("/", protect, admin, getSystemSettings);
router.put("/", protect, admin, updateSystemSettings);

module.exports = router;


