/**
 * Page Restriction Controller
 * Handles page access restrictions
 */

const PageRestriction = require("../models/PageRestriction");

/* ============================================================
   GET ALL PAGE RESTRICTIONS
============================================================ */
const getAllPageRestrictions = async (req, res) => {
    try {
        const restrictions = await PageRestriction.find()
            .populate("updatedBy", "firstname lastname email")
            .sort({ pageName: 1 });

        res.json({
            success: true,
            restrictions
        });

    } catch (error) {
        console.error("Get all page restrictions error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET PAGE RESTRICTION BY NAME
============================================================ */
const getPageRestriction = async (req, res) => {
    try {
        const { pageName } = req.params;

        let restriction = await PageRestriction.findOne({ pageName });

        // If doesn't exist, create default
        if (!restriction) {
            restriction = await PageRestriction.create({
                pageName,
                allowedRoles: ["all"],
                isRestricted: false,
                restrictionType: "all"
            });
        }

        res.json({
            success: true,
            restriction
        });

    } catch (error) {
        console.error("Get page restriction error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UPDATE PAGE RESTRICTION
============================================================ */
const updatePageRestriction = async (req, res) => {
    try {
        const { pageName } = req.params;
        const { isRestricted, restrictionType, allowedRoles } = req.body;

        let restriction = await PageRestriction.findOne({ pageName });

        if (!restriction) {
            // Create if doesn't exist
            restriction = await PageRestriction.create({
                pageName,
                isRestricted: isRestricted !== undefined ? isRestricted : false,
                restrictionType: restrictionType || "all",
                allowedRoles: allowedRoles || ["all"],
                updatedBy: req.user._id
            });
        } else {
            // Update existing
            const updates = { updatedBy: req.user._id };
            if (isRestricted !== undefined) updates.isRestricted = isRestricted;
            if (restrictionType !== undefined) updates.restrictionType = restrictionType;
            if (allowedRoles !== undefined) updates.allowedRoles = allowedRoles;

            restriction = await PageRestriction.findByIdAndUpdate(
                restriction._id,
                updates,
                { new: true, runValidators: true }
            );
        }

        const populatedRestriction = await PageRestriction.findById(restriction._id)
            .populate("updatedBy", "firstname lastname email");

        res.json({
            success: true,
            message: "Page restriction updated successfully",
            restriction: populatedRestriction
        });

    } catch (error) {
        console.error("Update page restriction error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CHECK PAGE ACCESS
============================================================ */
const checkPageAccess = async (req, res) => {
    try {
        const { pageName } = req.params;
        const userRole = req.user ? req.user.role : null;

        const restriction = await PageRestriction.findOne({ pageName });

        if (!restriction || !restriction.isRestricted) {
            return res.json({
                success: true,
                hasAccess: true,
                message: "Page is not restricted"
            });
        }

        // Check if user role is allowed
        const hasAccess = restriction.allowedRoles.includes("all") ||
                         restriction.allowedRoles.includes(userRole) ||
                         (userRole === "admin" && restriction.allowedRoles.includes("admins")) ||
                         (userRole === "user" && restriction.allowedRoles.includes("users"));

        res.json({
            success: true,
            hasAccess,
            restriction: hasAccess ? null : restriction
        });

    } catch (error) {
        console.error("Check page access error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getAllPageRestrictions,
    getPageRestriction,
    updatePageRestriction,
    checkPageAccess
};


