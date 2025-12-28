/**
 * Order Controller
 * Handles order creation, management, and history
 */

const mongoose = require("mongoose");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const Address = require("../models/Address");
const ShippingMethod = require("../models/ShippingMethod");
const DiscountCode = require("../models/DiscountCode");

/* ============================================================
   GENERATE ORDER NUMBER
============================================================ */
const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

/* ============================================================
   CREATE ORDER FROM CART
============================================================ */
const createOrder = async (req, res) => {
    try {
        const {
            shippingAddressId,
            shippingMethodId,
            discountCode,
            paymentMethod,
            notes
        } = req.body;

        // Validate shipping address
        if (!shippingAddressId) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required"
            });
        }

        // Validate shipping address ID format
        if (!mongoose.Types.ObjectId.isValid(shippingAddressId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid shipping address ID format"
            });
        }

        const shippingAddress = await Address.findOne({
            _id: shippingAddressId,
            user: req.user._id
        });

        if (!shippingAddress) {
            return res.status(404).json({
                success: false,
                message: "Shipping address not found"
            });
        }

        // Get cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Get cart items
        const cartItems = await CartItem.find({ cart: cart._id })
            .populate("product")
            .populate("variant");

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Calculate subtotal and validate stock
        let subtotal = 0;
        const orderItemsData = [];

        for (const cartItem of cartItems) {
            const product = cartItem.product;
            let stock = product.stock;
            let price = product.price;

            // Check variant stock if applicable
            if (cartItem.variant) {
                stock = cartItem.variant.stock;
                price = cartItem.variant.price || product.price;
            }

            // Validate stock
            if (stock < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.title}. Only ${stock} available.`
                });
            }

            const itemSubtotal = price * cartItem.quantity;
            subtotal += itemSubtotal;

            orderItemsData.push({
                product: product._id,
                variant: cartItem.variant ? cartItem.variant._id : null,
                productTitle: product.title,
                productBrand: product.brand || "",
                size: cartItem.size || (cartItem.variant ? cartItem.variant.size : null),
                color: cartItem.color || (cartItem.variant ? cartItem.variant.color : null),
                quantity: cartItem.quantity,
                price,
                subtotal: itemSubtotal
            });
        }

        // Calculate shipping cost
        let shippingCost = 0;
        let shippingMethod = null;
        let shippingMethodName = "";

        if (shippingMethodId) {
            // Validate shipping method ID format
            if (!mongoose.Types.ObjectId.isValid(shippingMethodId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid shipping method ID format"
                });
            }

            shippingMethod = await ShippingMethod.findById(shippingMethodId);
            if (!shippingMethod) {
                return res.status(404).json({
                    success: false,
                    message: "Shipping method not found"
                });
            }

            if (shippingMethod.isActive) {
                shippingMethodName = shippingMethod.name;
                
                // Check for free shipping
                if (shippingMethod.minOrderValue > 0 && subtotal >= shippingMethod.minOrderValue) {
                    shippingCost = 0;
                } else {
                    shippingCost = shippingMethod.baseCost || 0;
                    // Add weight-based cost if applicable
                    // For now, using base cost only
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Selected shipping method is not active"
                });
            }
        }

        // Apply discount code if provided
        let discountAmount = 0;
        let appliedDiscountCode = null;

        if (discountCode) {
            const code = await DiscountCode.findOne({
                code: discountCode.toUpperCase(),
                isActive: true
            });

            if (code) {
                const now = new Date();
                if (now >= code.validFrom && now <= code.validUntil) {
                    if (subtotal >= code.minOrderValue) {
                        if (code.discountType === "percentage") {
                            discountAmount = (subtotal * code.discountValue) / 100;
                            if (code.maxDiscount) {
                                discountAmount = Math.min(discountAmount, code.maxDiscount);
                            }
                        } else {
                            discountAmount = code.discountValue;
                        }
                        appliedDiscountCode = code.code;
                    }
                }
            }
        }

        // Calculate total
        const tax = 0; // Tax calculation can be added later
        const total = subtotal + shippingCost - discountAmount + tax;

        // Create order
        const orderNumber = generateOrderNumber();
        const order = await Order.create({
            orderNumber,
            user: req.user._id,
            shippingAddress: shippingAddressId,
            contactEmail: shippingAddress.email,
            contactPhone: shippingAddress.phone,
            shippingMethod: shippingMethodId,
            shippingMethodName,
            shippingCost,
            subtotal,
            discountCode: appliedDiscountCode,
            discountAmount,
            tax,
            total,
            currency: "NGN",
            status: "pending",
            paymentStatus: "pending",
            paymentMethod: paymentMethod || "card",
            notes
        });

        // Create order items
        const orderItems = await OrderItem.insertMany(
            orderItemsData.map(item => ({
                ...item,
                order: order._id
            }))
        );

        // Update product stock and sales count
        for (const cartItem of cartItems) {
            const product = cartItem.product;
            
            // Update product stock
            if (cartItem.variant) {
                await ProductVariant.findByIdAndUpdate(cartItem.variant._id, {
                    $inc: { stock: -cartItem.quantity }
                });
            }
            
            await Product.findByIdAndUpdate(product._id, {
                $inc: { 
                    stock: -cartItem.quantity,
                    salesCount: cartItem.quantity
                }
            });
        }

        // Clear cart
        await CartItem.deleteMany({ cart: cart._id });

        // Populate order for response
        const populatedOrder = await Order.findById(order._id)
            .populate("shippingAddress")
            .populate("shippingMethod");

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: populatedOrder,
            orderItems
        });

    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET USER ORDERS
============================================================ */
const getUserOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        let query = { user: req.user._id };
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate("shippingAddress", "firstname lastname address city region country phone")
            .populate("shippingMethod", "name deliveryTime")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Order.countDocuments(query);

        res.json({
            success: true,
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get user orders error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET ORDER BY ID
============================================================ */
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        })
            .populate("shippingAddress")
            .populate("shippingMethod");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Get order items
        const orderItems = await OrderItem.find({ order: order._id })
            .populate("product", "title images")
            .populate("variant", "size color colorCode");

        res.json({
            success: true,
            order,
            orderItems
        });

    } catch (error) {
        console.error("Get order error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
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
   GET ORDER BY ID (Admin - Full Details)
============================================================ */
const getAdminOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate("user", "firstname lastname email phone")
            .populate("shippingAddress")
            .populate("shippingMethod");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Get order items
        const orderItems = await OrderItem.find({ order: order._id })
            .populate("product", "title images brand")
            .populate("variant", "size color colorCode");

        // Format for admin view
        const formattedOrder = {
            ...order.toObject(),
            customerInfo: {
                name: order.user ? `${order.user.firstname} ${order.user.lastname}` : "Unknown",
                email: order.contactEmail || (order.user ? order.user.email : null),
                phone: order.contactPhone || (order.user ? order.user.phone : null),
                address: order.shippingAddress ? {
                    fullAddress: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.region}, ${order.shippingAddress.country}`,
                    ...order.shippingAddress.toObject()
                } : null
            },
            productInfo: orderItems.map(item => ({
                productName: item.productTitle,
                quantity: `${item.quantity}pcs`,
                size: item.size || "N/A",
                color: item.color || "N/A",
                price: item.price,
                subtotal: item.subtotal
            })),
            paymentInfo: {
                method: order.paymentMethod || "N/A",
                status: order.paymentStatus,
                reference: order.paymentReference || "N/A"
            },
            deliveryInfo: {
                method: order.shippingMethodName || (order.shippingMethod ? order.shippingMethod.name : "N/A"),
                status: order.status,
                estimatedDelivery: order.estimatedDelivery || null
            }
        };

        res.json({
            success: true,
            order: formattedOrder,
            orderItems
        });

    } catch (error) {
        console.error("Get admin order error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
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
   GET ORDER BY ORDER NUMBER
============================================================ */
const getOrderByNumber = async (req, res) => {
    try {
        const { orderNumber } = req.params;

        const order = await Order.findOne({
            orderNumber: orderNumber.toUpperCase(),
            user: req.user._id
        })
            .populate("shippingAddress")
            .populate("shippingMethod");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Get order items
        const orderItems = await OrderItem.find({ order: order._id })
            .populate("product", "title images")
            .populate("variant", "size color colorCode");

        res.json({
            success: true,
            order,
            orderItems
        });

    } catch (error) {
        console.error("Get order by number error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UPDATE ORDER STATUS (Admin Only)
============================================================ */
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus, estimatedDelivery } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (status) {
            order.status = status;
        }
        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }
        if (estimatedDelivery) {
            order.estimatedDelivery = new Date(estimatedDelivery);
        }

        await order.save();

        res.json({
            success: true,
            message: "Order status updated",
            order
        });

    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CANCEL ORDER
============================================================ */
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Only allow cancellation if order is pending or confirmed
        if (!["pending", "confirmed"].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: "Order cannot be cancelled at this stage"
            });
        }

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

        order.status = "cancelled";
        await order.save();

        res.json({
            success: true,
            message: "Order cancelled",
            order
        });

    } catch (error) {
        console.error("Cancel order error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET ALL ORDERS (Admin Only - with status filters)
============================================================ */
const getAllOrders = async (req, res) => {
    try {
        const { status, paymentStatus, search, page = 1, limit = 50 } = req.query;

        let query = {};

        // Filter by status (All, Pending, Shipped, Completed)
        if (status) {
            if (status === "all") {
                // No filter - show all
            } else if (status === "pending") {
                query.status = "pending";
            } else if (status === "shipped") {
                query.status = "shipped";
            } else if (status === "completed") {
                query.status = "delivered"; // "completed" maps to "delivered" in database
            } else {
                query.status = status;
            }
        }

        if (paymentStatus) query.paymentStatus = paymentStatus;

        // Search by order number, customer name, or email
        if (search) {
            const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
            query.$or = [
                { orderNumber: searchRegex },
                { contactEmail: searchRegex },
                { contactPhone: searchRegex }
            ];
        }

        const orders = await Order.find(query)
            .populate("user", "firstname lastname email")
            .populate("shippingAddress", "firstname lastname address city region country phone")
            .populate("shippingMethod", "name")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Order.countDocuments(query);

        // Format orders for admin view
        const formattedOrders = orders.map(order => {
            const orderObj = order.toObject();
            return {
                ...orderObj,
                customerName: orderObj.user ? `${orderObj.user.firstname} ${orderObj.user.lastname}` : "Unknown",
                displayStatus: orderObj.status === "delivered" ? "Completed" : 
                              orderObj.status.charAt(0).toUpperCase() + orderObj.status.slice(1)
            };
        });

        res.json({
            success: true,
            orders: formattedOrders,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get all orders error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET USER ORDERS BY STATUS (UI Status Mapping)
============================================================ */
const getUserOrdersByStatus = async (req, res) => {
    try {
        const { status } = req.params; // unpaid, to_be_shipped, shipped, to_be_reviewed, disputes
        const { page = 1, limit = 20 } = req.query;

        let query = { user: req.user._id };

        // Map UI statuses to database statuses
        switch (status) {
            case "unpaid":
                query.paymentStatus = "pending";
                break;
            case "to_be_shipped":
                query.status = { $in: ["confirmed", "processing"] };
                query.paymentStatus = "paid";
                break;
            case "shipped":
                query.status = "shipped";
                break;
            case "to_be_reviewed":
                query.status = "delivered";
                // Could add a check for whether review exists
                break;
            case "disputes":
                query.dispute = { $exists: true, $ne: null };
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid status. Use: unpaid, to_be_shipped, shipped, to_be_reviewed, disputes"
                });
        }

        const orders = await Order.find(query)
            .populate("shippingAddress", "firstname lastname address city region country phone")
            .populate("shippingMethod", "name deliveryTime")
            .populate("dispute", "status")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Order.countDocuments(query);

        res.json({
            success: true,
            status,
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get user orders by status error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   TRACK ORDER
============================================================ */
const trackOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            $or: [
                { _id: id },
                { orderNumber: id.toUpperCase() }
            ],
            user: req.user._id
        })
            .populate("shippingAddress")
            .populate("shippingMethod")
            .populate("dispute", "status reasons");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Get order items
        const orderItems = await OrderItem.find({ order: order._id })
            .populate("product", "title images")
            .populate("variant", "size color colorCode");

        // Build tracking steps based on order status
        const trackingSteps = {
            packaging: {
                label: "Packaging and branding from store",
                completed: order.trackingSteps?.packaging?.completed || 
                          ["confirmed", "processing", "shipped", "delivered"].includes(order.status),
                completedAt: order.trackingSteps?.packaging?.completedAt || 
                           (["confirmed", "processing", "shipped", "delivered"].includes(order.status) ? order.updatedAt : null)
            },
            checking: {
                label: "Checking goods",
                completed: order.trackingSteps?.checking?.completed || 
                          ["processing", "shipped", "delivered"].includes(order.status),
                completedAt: order.trackingSteps?.checking?.completedAt || 
                           (["processing", "shipped", "delivered"].includes(order.status) ? order.updatedAt : null)
            },
            shipping: {
                label: "Shipping",
                completed: order.trackingSteps?.shipping?.completed || 
                          ["shipped", "delivered"].includes(order.status),
                completedAt: order.trackingSteps?.shipping?.completedAt || 
                           (["shipped", "delivered"].includes(order.status) ? order.updatedAt : null)
            },
            delivery: {
                label: "Delivery",
                completed: order.trackingSteps?.delivery?.completed || 
                          order.status === "delivered",
                completedAt: order.trackingSteps?.delivery?.completedAt || 
                           (order.status === "delivered" ? order.updatedAt : null)
            },
            readyForPickup: {
                label: "Ready for pick up",
                completed: order.trackingSteps?.readyForPickup?.completed || false,
                completedAt: order.trackingSteps?.readyForPickup?.completedAt || null
            }
        };

        res.json({
            success: true,
            order: {
                ...order.toObject(),
                trackingSteps
            },
            orderItems
        });

    } catch (error) {
        console.error("Track order error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
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
   ACCEPT ORDER (Mark as received)
============================================================ */
const acceptOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.status !== "delivered") {
            return res.status(400).json({
                success: false,
                message: "Order must be delivered before it can be accepted"
            });
        }

        // Mark ready for pickup as completed
        if (!order.trackingSteps) {
            order.trackingSteps = {};
        }
        order.trackingSteps.readyForPickup = {
            completed: true,
            completedAt: new Date()
        };

        await order.save();

        res.json({
            success: true,
            message: "Order accepted successfully",
            order
        });

    } catch (error) {
        console.error("Accept order error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getUserOrdersByStatus,
    getOrderById,
    getAdminOrderById,
    getOrderByNumber,
    trackOrder,
    acceptOrder,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
};

