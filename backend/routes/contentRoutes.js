const express = require("express");
const router = express.Router();
const {
    getHelpCenter,
    getPrivacyPolicy
} = require("../controllers/contentController");

// Public routes
router.get("/help-center", getHelpCenter);
router.get("/privacy-policy", getPrivacyPolicy);

module.exports = router;

