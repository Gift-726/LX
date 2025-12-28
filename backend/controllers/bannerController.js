/**
 * Banner Controller
 * Handles banner management (CRUD and preview)
 */

const Banner = require("../models/Banner");

/* ============================================================
   GET ALL BANNERS
============================================================ */
const getAllBanners = async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }

        const banners = await Banner.find(query)
            .populate("createdBy", "firstname lastname email")
            .sort({ displayOrder: 1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Banner.countDocuments(query);

        res.json({
            success: true,
            banners,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get all banners error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET ACTIVE BANNERS (Public)
============================================================ */
const getActiveBanners = async (req, res) => {
    try {
        const now = new Date();

        const banners = await Banner.find({
            status: "active",
            $or: [
                { startDate: { $lte: now }, endDate: { $gte: now } },
                { startDate: null, endDate: null },
                { startDate: { $lte: now }, endDate: null },
                { startDate: null, endDate: { $gte: now } }
            ]
        })
            .sort({ displayOrder: 1, createdAt: -1 });

        res.json({
            success: true,
            banners
        });

    } catch (error) {
        console.error("Get active banners error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET BANNER BY ID
============================================================ */
const getBannerById = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await Banner.findById(id)
            .populate("createdBy", "firstname lastname email");

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        res.json({
            success: true,
            banner
        });

    } catch (error) {
        console.error("Get banner by ID error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid banner ID format"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CREATE BANNER
============================================================ */
const createBanner = async (req, res) => {
    try {
        const {
            title,
            heading,
            bodyText,
            buttonText,
            buttonUrl,
            image,
            backgroundColor,
            textColor,
            status,
            displayOrder,
            startDate,
            endDate
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        const banner = await Banner.create({
            title,
            heading,
            bodyText,
            buttonText,
            buttonUrl,
            image,
            backgroundColor: backgroundColor || "#8B5CF6",
            textColor: textColor || "#FFFFFF",
            status: status || "active",
            displayOrder: displayOrder || 0,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            createdBy: req.user._id
        });

        const populatedBanner = await Banner.findById(banner._id)
            .populate("createdBy", "firstname lastname email");

        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            banner: populatedBanner
        });

    } catch (error) {
        console.error("Create banner error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UPDATE BANNER
============================================================ */
const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Convert dates if provided
        if (updates.startDate) {
            updates.startDate = new Date(updates.startDate);
        }
        if (updates.endDate) {
            updates.endDate = new Date(updates.endDate);
        }

        const banner = await Banner.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        })
            .populate("createdBy", "firstname lastname email");

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        res.json({
            success: true,
            message: "Banner updated successfully",
            banner
        });

    } catch (error) {
        console.error("Update banner error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   DELETE BANNER
============================================================ */
const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await Banner.findByIdAndDelete(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        res.json({
            success: true,
            message: "Banner deleted successfully"
        });

    } catch (error) {
        console.error("Delete banner error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   PREVIEW BANNER
============================================================ */
const previewBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await Banner.findById(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        // Return banner data formatted for preview
        res.json({
            success: true,
            preview: {
                title: banner.title,
                heading: banner.heading,
                bodyText: banner.bodyText,
                buttonText: banner.buttonText,
                buttonUrl: banner.buttonUrl,
                image: banner.image,
                backgroundColor: banner.backgroundColor,
                textColor: banner.textColor,
                status: banner.status
            }
        });

    } catch (error) {
        console.error("Preview banner error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getAllBanners,
    getActiveBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    previewBanner
};


