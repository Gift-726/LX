const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    getAllBanners,
    getActiveBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    previewBanner
} = require("../controllers/bannerController");

// Public routes
router.get("/active", getActiveBanners);

// Admin routes
router.get("/", protect, admin, getAllBanners);
router.post("/", protect, admin, createBanner);
router.get("/:id", protect, admin, getBannerById);
router.get("/:id/preview", protect, admin, previewBanner);
router.put("/:id", protect, admin, updateBanner);
router.delete("/:id", protect, admin, deleteBanner);

module.exports = router;


