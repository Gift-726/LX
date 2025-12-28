const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    getAllPageRestrictions,
    getPageRestriction,
    updatePageRestriction,
    checkPageAccess
} = require("../controllers/pageRestrictionController");

// All routes require admin authentication
router.get("/", protect, admin, getAllPageRestrictions);
router.get("/check/:pageName", protect, checkPageAccess);
router.get("/:pageName", protect, admin, getPageRestriction);
router.put("/:pageName", protect, admin, updatePageRestriction);

module.exports = router;


