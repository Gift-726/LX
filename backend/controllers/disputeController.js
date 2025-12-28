/**
 * Dispute Controller
 * Handles order disputes and refund requests
 */

const Dispute = require("../models/Dispute");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

/* ============================================================
   CREATE DISPUTE
============================================================ */
const createDispute = async (req, res) => {
    try {
        const { orderId, orderItemId, goodsUniqueId, reasons, detailedExplanation } = req.body;

        // Validate required fields
        if (!goodsUniqueId || !reasons || !Array.isArray(reasons) || reasons.length === 0 || !detailedExplanation) {
            return res.status(400).json({
                success: false,
                message: "Goods unique ID, reasons, and detailed explanation are required"
            });
        }

        // Find order by ID or order number
        let order = null;
        if (orderId) {
            order = await Order.findOne({
                _id: orderId,
                user: req.user._id
            });
        } else {
            // Try to find by goodsUniqueId (could be order number)
            order = await Order.findOne({
                $or: [
                    { orderNumber: goodsUniqueId.toUpperCase() },
                    { _id: goodsUniqueId }
                ],
                user: req.user._id
            });
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if dispute already exists for this order
        const existingDispute = await Dispute.findOne({
            order: order._id,
            user: req.user._id,
            status: { $in: ["pending", "under_review"] }
        });

        if (existingDispute) {
            return res.status(400).json({
                success: false,
                message: "A dispute already exists for this order"
            });
        }

        // Validate order item if provided
        let orderItem = null;
        if (orderItemId) {
            orderItem = await OrderItem.findOne({
                _id: orderItemId,
                order: order._id
            });

            if (!orderItem) {
                return res.status(404).json({
                    success: false,
                    message: "Order item not found"
                });
            }
        }

        // Create dispute
        const dispute = await Dispute.create({
            order: order._id,
            orderItem: orderItem ? orderItem._id : null,
            user: req.user._id,
            goodsUniqueId,
            reasons,
            detailedExplanation,
            status: "pending"
        });

        // Link dispute to order
        order.dispute = dispute._id;
        await order.save();

        // Populate for response
        const populatedDispute = await Dispute.findById(dispute._id)
            .populate("order", "orderNumber status total")
            .populate("orderItem", "productTitle quantity price");

        res.status(201).json({
            success: true,
            message: "Dispute created successfully",
            dispute: populatedDispute
        });

    } catch (error) {
        console.error("Create dispute error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET USER DISPUTES
============================================================ */
const getUserDisputes = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        let query = { user: req.user._id };
        if (status) {
            query.status = status;
        }

        const disputes = await Dispute.find(query)
            .populate("order", "orderNumber status total createdAt")
            .populate("orderItem", "productTitle quantity price")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Dispute.countDocuments(query);

        res.json({
            success: true,
            disputes,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get user disputes error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET DISPUTE BY ID
============================================================ */
const getDisputeById = async (req, res) => {
    try {
        const { id } = req.params;

        const dispute = await Dispute.findOne({
            _id: id,
            user: req.user._id
        })
            .populate("order")
            .populate("orderItem")
            .populate("resolvedBy", "firstname lastname email");

        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: "Dispute not found"
            });
        }

        res.json({
            success: true,
            dispute
        });

    } catch (error) {
        console.error("Get dispute error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid dispute ID format"
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
   GET ALL DISPUTES (Admin Only)
============================================================ */
const getAllDisputes = async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;

        let query = {};
        if (status) query.status = status;

        const disputes = await Dispute.find(query)
            .populate("order", "orderNumber status total")
            .populate("user", "firstname lastname email")
            .populate("orderItem", "productTitle quantity")
            .populate("resolvedBy", "firstname lastname email")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Dispute.countDocuments(query);

        res.json({
            success: true,
            disputes,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get all disputes error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UPDATE DISPUTE STATUS (Admin Only)
============================================================ */
const updateDisputeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminResponse, refundAmount } = req.body;

        const dispute = await Dispute.findById(id)
            .populate("order");

        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: "Dispute not found"
            });
        }

        if (status) {
            dispute.status = status;
        }
        if (adminResponse) {
            dispute.adminResponse = adminResponse;
        }
        if (refundAmount !== undefined) {
            dispute.refundAmount = refundAmount;
        }

        if (status && ["resolved", "rejected", "refunded"].includes(status)) {
            dispute.resolvedAt = new Date();
            dispute.resolvedBy = req.user._id;
        }

        await dispute.save();

        // If refunded, update order status
        if (status === "refunded" && dispute.order) {
            const order = await Order.findById(dispute.order._id);
            if (order) {
                order.paymentStatus = "refunded";
                order.status = "refunded";
                await order.save();
            }
        }

        const populatedDispute = await Dispute.findById(dispute._id)
            .populate("order")
            .populate("resolvedBy", "firstname lastname email");

        res.json({
            success: true,
            message: "Dispute status updated",
            dispute: populatedDispute
        });

    } catch (error) {
        console.error("Update dispute status error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createDispute,
    getUserDisputes,
    getDisputeById,
    getAllDisputes,
    updateDisputeStatus
};

