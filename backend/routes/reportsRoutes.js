const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    getReports,
    getReportsOverview,
    getRevenueChart,
    getSalesTrendChart,
    getUserEngagementChart,
    exportAsPDF,
    exportAsExcel
} = require("../controllers/reportsController");

// All routes require admin authentication
router.get("/", protect, admin, getReports);
router.get("/overview", protect, admin, getReportsOverview);
router.get("/revenue-chart", protect, admin, getRevenueChart);
router.get("/sales-trend-chart", protect, admin, getSalesTrendChart);
router.get("/user-engagement-chart", protect, admin, getUserEngagementChart);
router.get("/export/pdf", protect, admin, exportAsPDF);
router.get("/export/excel", protect, admin, exportAsExcel);

module.exports = router;


