/**
 * Dispute Controller
 * Handles order disputes and refund requests
 */

import { Request, Response } from 'express';
import Dispute, { DisputeStatus, DisputeReason } from '../models/Dispute';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';

interface CreateDisputeBody {
  orderId?: string;
  orderItemId?: string;
  goodsUniqueId: string;
  reasons: DisputeReason[];
  detailedExplanation: string;
}

interface UpdateDisputeStatusBody {
  status?: DisputeStatus;
  adminResponse?: string;
  refundAmount?: number;
}

/* ============================================================
   CREATE DISPUTE
============================================================ */
const createDispute = async (req: Request<{}, {}, CreateDisputeBody>, res: Response): Promise<void> => {
  try {
    const { orderId, orderItemId, goodsUniqueId, reasons, detailedExplanation } = req.body;

    // Validate required fields
    if (!goodsUniqueId || !reasons || !Array.isArray(reasons) || reasons.length === 0 || !detailedExplanation) {
      res.status(400).json({
        success: false,
        message: 'Goods unique ID, reasons, and detailed explanation are required'
      });
      return;
    }

    // Find order by ID or order number
    let order: any = null;
    if (orderId) {
      order = await Order.findOne({
        _id: orderId,
        user: req.user!._id
      });
    } else {
      // Try to find by goodsUniqueId (could be order number)
      order = await Order.findOne({
        $or: [
          { orderNumber: goodsUniqueId.toUpperCase() },
          { _id: goodsUniqueId }
        ],
        user: req.user!._id
      });
    }

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Check if dispute already exists for this order
    const existingDispute = await Dispute.findOne({
      order: order._id,
      user: req.user!._id,
      status: { $in: ['pending', 'under_review'] }
    });

    if (existingDispute) {
      res.status(400).json({
        success: false,
        message: 'A dispute already exists for this order'
      });
      return;
    }

    // Validate order item if provided
    let orderItem: any = null;
    if (orderItemId) {
      orderItem = await OrderItem.findOne({
        _id: orderItemId,
        order: order._id
      });

      if (!orderItem) {
        res.status(404).json({
          success: false,
          message: 'Order item not found'
        });
        return;
      }
    }

    // Create dispute
    const dispute = await Dispute.create({
      order: order._id,
      orderItem: orderItem ? orderItem._id : undefined,
      user: req.user!._id,
      goodsUniqueId,
      reasons,
      detailedExplanation,
      status: 'pending'
    });

    // Link dispute to order
    order.dispute = dispute._id;
    await order.save();

    // Populate for response
    const populatedDispute = await Dispute.findById(dispute._id)
      .populate('order', 'orderNumber status total')
      .populate('orderItem', 'productTitle quantity price');

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      dispute: populatedDispute
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET USER DISPUTES
============================================================ */
const getUserDisputes = async (req: Request<{}, {}, {}, { status?: string; page?: string; limit?: string }>, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query: any = { user: req.user!._id };
    if (status) {
      query.status = status;
    }

    const disputes = await Dispute.find(query)
      .populate('order', 'orderNumber status total createdAt')
      .populate('orderItem', 'productTitle quantity price')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Dispute.countDocuments(query);

    res.json({
      success: true,
      disputes,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get user disputes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET DISPUTE BY ID
============================================================ */
const getDisputeById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const dispute = await Dispute.findOne({
      _id: id,
      user: req.user!._id
    })
      .populate('order')
      .populate('orderItem')
      .populate('resolvedBy', 'firstname lastname email');

    if (!dispute) {
      res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
      return;
    }

    res.json({
      success: true,
      dispute
    });

  } catch (error) {
    console.error('Get dispute error:', error);
    
    if (error instanceof Error && (error as any).name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid dispute ID format'
      });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET ALL DISPUTES (Admin Only)
============================================================ */
const getAllDisputes = async (req: Request<{}, {}, {}, { status?: string; page?: string; limit?: string }>, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '50' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query: any = {};
    if (status) query.status = status;

    const disputes = await Dispute.find(query)
      .populate('order', 'orderNumber status total')
      .populate('user', 'firstname lastname email')
      .populate('orderItem', 'productTitle quantity')
      .populate('resolvedBy', 'firstname lastname email')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Dispute.countDocuments(query);

    res.json({
      success: true,
      disputes,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get all disputes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE DISPUTE STATUS (Admin Only)
============================================================ */
const updateDisputeStatus = async (req: Request<{ id: string }, {}, UpdateDisputeStatusBody>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminResponse, refundAmount } = req.body;

    const dispute = await Dispute.findById(id)
      .populate('order');

    if (!dispute) {
      res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
      return;
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

    if (status && ['resolved', 'rejected', 'refunded'].includes(status)) {
      dispute.resolvedAt = new Date();
      dispute.resolvedBy = req.user!._id;
    }

    await dispute.save();

    // If refunded, update order status
    if (status === 'refunded' && dispute.order) {
      const order = dispute.order as any;
      const orderDoc = await Order.findById(order._id);
      if (orderDoc) {
        orderDoc.paymentStatus = 'refunded';
        orderDoc.status = 'refunded';
        await orderDoc.save();
      }
    }

    const populatedDispute = await Dispute.findById(dispute._id)
      .populate('order')
      .populate('resolvedBy', 'firstname lastname email');

    res.json({
      success: true,
      message: 'Dispute status updated',
      dispute: populatedDispute
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update dispute status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  createDispute,
  getUserDisputes,
  getDisputeById,
  getAllDisputes,
  updateDisputeStatus
};
