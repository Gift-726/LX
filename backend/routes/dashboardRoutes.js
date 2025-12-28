const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    getDashboard,
    getDashboardOverview,
    getSalesTrend,
    getPopularItems
} = require("../controllers/dashboardController");

// All routes require admin authentication
router.get("/", protect, admin, getDashboard);
router.get("/overview", protect, admin, getDashboardOverview);
router.get("/sales-trend", protect, admin, getSalesTrend);
router.get("/popular-items", protect, admin, getPopularItems);

module.exports = router;

