/**
 * Terms and Conditions Controller
 * Handles terms and conditions management
 */

const TermsAndCondition = require("../models/TermsAndCondition");

/* ============================================================
   GET ALL TERMS AND CONDITIONS
============================================================ */
const getAllTerms = async (req, res) => {
    try {
        const { isActive, page = 1, limit = 50 } = req.query;

        let query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const terms = await TermsAndCondition.find(query)
            .populate("createdBy", "firstname lastname email")
            .populate("updatedBy", "firstname lastname email")
            .sort({ effectiveDate: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await TermsAndCondition.countDocuments(query);

        res.json({
            success: true,
            terms,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get all terms error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET ACTIVE TERMS AND CONDITIONS (Public)
============================================================ */
const getActiveTerms = async (req, res) => {
    try {
        const terms = await TermsAndCondition.find({ isActive: true })
            .sort({ effectiveDate: -1 });

        res.json({
            success: true,
            terms
        });

    } catch (error) {
        console.error("Get active terms error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET TERMS BY ID
============================================================ */
const getTermsById = async (req, res) => {
    try {
        const { id } = req.params;

        const terms = await TermsAndCondition.findById(id)
            .populate("createdBy", "firstname lastname email")
            .populate("updatedBy", "firstname lastname email");

        if (!terms) {
            return res.status(404).json({
                success: false,
                message: "Terms and conditions not found"
            });
        }

        res.json({
            success: true,
            terms
        });

    } catch (error) {
        console.error("Get terms by ID error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid terms ID format"
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
   CREATE TERMS AND CONDITIONS
============================================================ */
const createTerms = async (req, res) => {
    try {
        const { title, content, effectiveDate } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        // Deactivate all existing terms
        await TermsAndCondition.updateMany({}, { isActive: false });

        // Get next version number
        const lastTerms = await TermsAndCondition.findOne()
            .sort({ version: -1 });
        const nextVersion = lastTerms ? lastTerms.version + 1 : 1;

        const terms = await TermsAndCondition.create({
            title,
            content,
            version: nextVersion,
            isActive: true,
            effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
            createdBy: req.user._id,
            updatedBy: req.user._id
        });

        const populatedTerms = await TermsAndCondition.findById(terms._id)
            .populate("createdBy", "firstname lastname email")
            .populate("updatedBy", "firstname lastname email");

        res.status(201).json({
            success: true,
            message: "Terms and conditions created successfully",
            terms: populatedTerms
        });

    } catch (error) {
        console.error("Create terms error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UPDATE TERMS AND CONDITIONS
============================================================ */
const updateTerms = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, effectiveDate, isActive } = req.body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (effectiveDate !== undefined) updates.effectiveDate = new Date(effectiveDate);
        if (isActive !== undefined) {
            updates.isActive = isActive;
            // If activating, deactivate others
            if (isActive) {
                await TermsAndCondition.updateMany(
                    { _id: { $ne: id } },
                    { isActive: false }
                );
            }
        }
        updates.updatedBy = req.user._id;

        const terms = await TermsAndCondition.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        })
            .populate("createdBy", "firstname lastname email")
            .populate("updatedBy", "firstname lastname email");

        if (!terms) {
            return res.status(404).json({
                success: false,
                message: "Terms and conditions not found"
            });
        }

        res.json({
            success: true,
            message: "Terms and conditions updated successfully",
            terms
        });

    } catch (error) {
        console.error("Update terms error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   DELETE TERMS AND CONDITIONS
============================================================ */
const deleteTerms = async (req, res) => {
    try {
        const { id } = req.params;

        const terms = await TermsAndCondition.findByIdAndDelete(id);

        if (!terms) {
            return res.status(404).json({
                success: false,
                message: "Terms and conditions not found"
            });
        }

        res.json({
            success: true,
            message: "Terms and conditions deleted successfully"
        });

    } catch (error) {
        console.error("Delete terms error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getAllTerms,
    getActiveTerms,
    getTermsById,
    createTerms,
    updateTerms,
    deleteTerms
};


