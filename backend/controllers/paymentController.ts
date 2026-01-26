/**
 * Payment Controller
 * Handles Paystack payment operations
 */

import { Request, Response } from 'express';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import ProductVariant from '../models/ProductVariant';
import {
  initializeTransaction,
  verifyTransaction,
  createRefund
} from '../config/paystack';

interface InitializePaymentBody {
  orderId: string;
}

interface RefundPaymentBody {
  amount?: number;
  reason?: string;
}

/* ============================================================
   INITIALIZE PAYMENT
============================================================ */
const initializePayment = async (req: Request<{}, {}, InitializePaymentBody>, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
      return;
    }

    // Get order
    const order = await Order.findById(orderId)
      .populate('user', 'firstname lastname email')
      .populate('shippingAddress');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Check if order belongs to user
    const user = order.user as any;
    if (user._id.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access to this order'
      });
      return;
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      res.status(400).json({
        success: false,
        message: 'Order has already been paid'
      });
      return;
    }

    // Prepare payment data for Paystack
    const paymentData = {
      email: order.contactEmail,
      amount: Math.round(order.total * 100), // Convert to kobo (smallest currency unit)
      currency: order.currency || 'NGN',
      reference: order.orderNumber, // Use order number as reference
      callback_url: process.env.PAYSTACK_CALLBACK_URL || `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: user._id.toString(),
        custom_fields: [
          {
            display_name: 'Order Number',
            variable_name: 'order_number',
            value: order.orderNumber
          },
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: `${user.firstname} ${user.lastname}`
          }
        ]
      }
    };

    // Initialize Paystack transaction
    let paystackResponse;
    try {
      paystackResponse = await initializeTransaction(paymentData);
    } catch (error) {
      // Handle Paystack configuration errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('PAYSTACK_SECRET_KEY')) {
        res.status(500).json({
          success: false,
          message: 'Payment service configuration error',
          error: errorMessage,
          hint: 'Please ensure PAYSTACK_SECRET_KEY is set in your .env file and restart the server'
        });
        return;
      }
      throw error;
    }

    if (!paystackResponse.status) {
      res.status(400).json({
        success: false,
        message: 'Failed to initialize payment',
        error: paystackResponse.message
      });
      return;
    }

    // Update order with Paystack reference
    order.paystackReference = paystackResponse.data.reference;
    order.paystackAuthorizationUrl = paystackResponse.data.authorization_url;
    await order.save();

    res.json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        authorization_url: paystackResponse.data.authorization_url,
        access_code: paystackResponse.data.access_code,
        reference: paystackResponse.data.reference,
        orderId: order._id,
        orderNumber: order.orderNumber
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Initialize payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   VERIFY PAYMENT
============================================================ */
const verifyPayment = async (req: Request<{ reference: string }>, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;

    if (!reference) {
      res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
      return;
    }

    // Verify transaction with Paystack
    const paystackResponse = await verifyTransaction(reference);

    if (!paystackResponse.status) {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        error: paystackResponse.message
      });
      return;
    }

    const transaction = paystackResponse.data;

    // Find order by reference (order number or Paystack reference)
    let order = await Order.findOne({
      $or: [
        { orderNumber: reference },
        { paystackReference: reference }
      ]
    })
      .populate('user', 'firstname lastname email');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found for this payment reference'
      });
      return;
    }

    // Check if payment was successful
    if (transaction.status === 'success' && transaction.gateway_response === 'Successful') {
      // Update order payment status
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paymentMethod = 'paystack';
        order.paymentReference = transaction.reference;
        order.paymentVerifiedAt = new Date();
        order.status = 'confirmed'; // Move order to confirmed status

        // Update order tracking steps
        if (!order.trackingSteps) {
          order.trackingSteps = {
            packaging: { completed: false },
            checking: { completed: false },
            shipping: { completed: false },
            delivery: { completed: false },
            readyForPickup: { completed: false }
          };
        }
        order.trackingSteps.packaging = {
          completed: true,
          completedAt: new Date()
        };

        await order.save();

        // Reduce stock for order items
        const orderItems = await OrderItem.find({ order: order._id })
          .populate('product')
          .populate('variant');

        for (const item of orderItems) {
          const product = item.product as any;
          
          // Update variant stock if applicable
          if (item.variant) {
            const variant = item.variant as any;
            await ProductVariant.findByIdAndUpdate(variant._id, {
              $inc: { stock: -item.quantity }
            });
          }
          
          // Update product stock and sales count
          await Product.findByIdAndUpdate(product._id, {
            $inc: { 
              stock: -item.quantity,
              salesCount: item.quantity
            }
          });
        }
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          order: {
            _id: order._id,
            orderNumber: order.orderNumber,
            total: order.total,
            paymentStatus: order.paymentStatus,
            status: order.status
          },
          transaction: {
            reference: transaction.reference,
            amount: transaction.amount / 100, // Convert from kobo
            currency: transaction.currency,
            status: transaction.status,
            paidAt: transaction.paid_at
          }
        }
      });
    } else {
      // Payment failed or pending
      order.paymentStatus = 'failed';
      order.paymentReference = transaction.reference;
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: {
          status: transaction.status,
          gateway_response: transaction.gateway_response,
          message: transaction.message
        }
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET PAYMENT STATUS
============================================================ */
const getPaymentStatus = async (req: Request<{ orderId: string }>, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user!._id
    })
      .select('orderNumber paymentStatus paymentReference paystackReference status total');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    res.json({
      success: true,
      payment: {
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentReference: order.paymentReference || order.paystackReference,
        orderStatus: order.status,
        total: order.total
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   REFUND PAYMENT (Admin Only)
============================================================ */
const refundPayment = async (req: Request<{ orderId: string }, {}, RefundPaymentBody>, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    if (order.paymentStatus !== 'paid') {
      res.status(400).json({
        success: false,
        message: 'Order has not been paid yet'
      });
      return;
    }

    if (!order.paymentReference) {
      res.status(400).json({
        success: false,
        message: 'Payment reference not found for this order'
      });
      return;
    }

    // Create refund with Paystack
    const refundResponse = await createRefund(
      order.paymentReference,
      amount || null // If amount not provided, full refund
    );

    if (!refundResponse.status) {
      res.status(400).json({
        success: false,
        message: 'Refund failed',
        error: refundResponse.message
      });
      return;
    }

    // Update order
    order.paymentStatus = 'refunded';
    order.status = 'refunded';
    order.refundReference = refundResponse.data.reference;
    order.refundReason = reason;
    order.refundedAt = new Date();
    await order.save();

    // Restore stock
    const orderItems = await OrderItem.find({ order: order._id });
    
    for (const item of orderItems) {
      if (item.variant) {
        await ProductVariant.findByIdAndUpdate(item.variant, {
          $inc: { stock: item.quantity }
        });
      }
      
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 
          stock: item.quantity,
          salesCount: -item.quantity
        }
      });
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        reference: refundResponse.data.reference,
        amount: refundResponse.data.amount / 100,
        currency: refundResponse.data.currency,
        status: refundResponse.data.status
      },
      order: {
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        status: order.status
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  initializePayment,
  verifyPayment,
  getPaymentStatus,
  refundPayment
};
