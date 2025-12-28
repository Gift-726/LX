/**
 * Dashboard Controller
 * Handles admin dashboard analytics and statistics
 */

const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const User = require("../models/User");
const Category = require("../models/Category");

/* ============================================================
   GET DASHBOARD OVERVIEW
============================================================ */
const getDashboardOverview = async (req, res) => {
    try {
        const { period = "today" } = req.query; // today, week, month, year

        // Calculate date range based on period
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case "today":
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                break;
            case "week":
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                endDate = new Date(now);
                break;
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                break;
            case "year":
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        }

        // Get revenue (total of all paid orders in period)
        const revenueOrders = await Order.find({
            paymentStatus: "paid",
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.total, 0);

        // Get active products count
        const activeProductsCount = await Product.countDocuments({ isAvailable: true });

        // Get total orders count (in period)
        const totalOrdersCount = await Order.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Get total users count
        const totalUsersCount = await User.countDocuments();

        res.json({
            success: true,
            period,
            overview: {
                revenue: totalRevenue,
                activeProducts: activeProductsCount,
                totalOrders: totalOrdersCount,
                totalUsers: totalUsersCount
            }
        });

    } catch (error) {
        console.error("Get dashboard overview error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET SALES TREND
============================================================ */
const getSalesTrend = async (req, res) => {
    try {
        const { period = "month", year, month } = req.query;

        let startDate, endDate, groupBy;

        if (period === "month" && year && month) {
            // Specific month
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59);
            groupBy = "day";
        } else if (period === "year" && year) {
            // Specific year
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59);
            groupBy = "month";
        } else {
            // Current month
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            groupBy = "day";
        }

        // Get all paid orders in the period
        const orders = await Order.find({
            paymentStatus: "paid",
            createdAt: { $gte: startDate, $lte: endDate }
        }).select("total createdAt");

        // Group by day or month
        const salesData = {};

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            let key;

            if (groupBy === "day") {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!salesData[key]) {
                salesData[key] = 0;
            }
            salesData[key] += order.total;
        });

        // Format for response
        const trend = Object.keys(salesData)
            .sort()
            .map(key => ({
                date: key,
                sales: salesData[key]
            }));

        res.json({
            success: true,
            period,
            year: year || new Date().getFullYear(),
            month: month || new Date().getMonth() + 1,
            trend
        });

    } catch (error) {
        console.error("Get sales trend error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET POPULAR ITEMS
============================================================ */
const getPopularItems = async (req, res) => {
    try {
        // Get best selling products (by salesCount)
        const bestSellingProducts = await OrderItem.aggregate([
            {
                $group: {
                    _id: "$product",
                    totalQuantity: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$subtotal" }
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: 1
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            }
        ]);

        // Get best selling category
        const bestSellingCategory = await OrderItem.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "product.category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $group: {
                    _id: "$category._id",
                    categoryName: { $first: "$category.name" },
                    totalQuantity: { $sum: "$quantity" }
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: 1
            }
        ]);

        // Get most sold item (by individual product sales)
        const mostSoldProduct = await Product.find()
            .sort({ salesCount: -1 })
            .limit(1)
            .select("title salesCount");

        // Format response
        const popularItems = {
            bestSellingItem: bestSellingProducts.length > 0 ? {
                name: bestSellingProducts[0].product.title,
                quantity: bestSellingProducts[0].totalQuantity,
                revenue: bestSellingProducts[0].totalRevenue
            } : null,
            bestSellingCategory: bestSellingCategory.length > 0 ? {
                name: bestSellingCategory[0].categoryName,
                quantity: bestSellingCategory[0].totalQuantity
            } : null,
            mostSold: mostSoldProduct.length > 0 ? {
                name: mostSoldProduct[0].title,
                quantity: mostSoldProduct[0].salesCount
            } : null
        };

        res.json({
            success: true,
            popularItems
        });

    } catch (error) {
        console.error("Get popular items error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET COMPLETE DASHBOARD DATA
============================================================ */
const getDashboard = async (req, res) => {
    try {
        const { period = "today", year, month } = req.query;

        // Get all data in parallel
        const [overview, trend, popularItems] = await Promise.all([
            // Overview
            (async () => {
                const now = new Date();
                let startDate, endDate;

                switch (period) {
                    case "today":
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                        break;
                    case "week":
                        startDate = new Date(now);
                        startDate.setDate(now.getDate() - 7);
                        endDate = new Date(now);
                        break;
                    case "month":
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                        break;
                    case "year":
                        startDate = new Date(now.getFullYear(), 0, 1);
                        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
                        break;
                    default:
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                }

                const revenueOrders = await Order.find({
                    paymentStatus: "paid",
                    createdAt: { $gte: startDate, $lte: endDate }
                });

                const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.total, 0);
                const activeProductsCount = await Product.countDocuments({ isAvailable: true });
                const totalOrdersCount = await Order.countDocuments({
                    createdAt: { $gte: startDate, $lte: endDate }
                });
                const totalUsersCount = await User.countDocuments();

                return {
                    revenue: totalRevenue,
                    activeProducts: activeProductsCount,
                    totalOrders: totalOrdersCount,
                    totalUsers: totalUsersCount
                };
            })(),
            // Sales trend
            (async () => {
                let startDate, endDate, groupBy;

                if (period === "month" && year && month) {
                    startDate = new Date(year, month - 1, 1);
                    endDate = new Date(year, month, 0, 23, 59, 59);
                    groupBy = "day";
                } else if (period === "year" && year) {
                    startDate = new Date(year, 0, 1);
                    endDate = new Date(year, 11, 31, 23, 59, 59);
                    groupBy = "month";
                } else {
                    const now = new Date();
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                    groupBy = "day";
                }

                const orders = await Order.find({
                    paymentStatus: "paid",
                    createdAt: { $gte: startDate, $lte: endDate }
                }).select("total createdAt");

                const salesData = {};
                orders.forEach(order => {
                    const date = new Date(order.createdAt);
                    let key;
                    if (groupBy === "day") {
                        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    } else {
                        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    }
                    if (!salesData[key]) salesData[key] = 0;
                    salesData[key] += order.total;
                });

                return Object.keys(salesData)
                    .sort()
                    .map(key => ({ date: key, sales: salesData[key] }));
            })(),
            // Popular items
            (async () => {
                const bestSellingProducts = await OrderItem.aggregate([
                    { $group: { _id: "$product", totalQuantity: { $sum: "$quantity" }, totalRevenue: { $sum: "$subtotal" } } },
                    { $sort: { totalQuantity: -1 } },
                    { $limit: 1 },
                    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
                    { $unwind: "$product" }
                ]);

                const bestSellingCategory = await OrderItem.aggregate([
                    { $lookup: { from: "products", localField: "product", foreignField: "_id", as: "product" } },
                    { $unwind: "$product" },
                    { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
                    { $unwind: "$category" },
                    { $group: { _id: "$category._id", categoryName: { $first: "$category.name" }, totalQuantity: { $sum: "$quantity" } } },
                    { $sort: { totalQuantity: -1 } },
                    { $limit: 1 }
                ]);

                const mostSoldProduct = await Product.find()
                    .sort({ salesCount: -1 })
                    .limit(1)
                    .select("title salesCount");

                return {
                    bestSellingItem: bestSellingProducts.length > 0 ? {
                        name: bestSellingProducts[0].product.title,
                        quantity: bestSellingProducts[0].totalQuantity
                    } : null,
                    bestSellingCategory: bestSellingCategory.length > 0 ? {
                        name: bestSellingCategory[0].categoryName,
                        quantity: bestSellingCategory[0].totalQuantity
                    } : null,
                    mostSold: mostSoldProduct.length > 0 ? {
                        name: mostSoldProduct[0].title,
                        quantity: mostSoldProduct[0].salesCount
                    } : null
                };
            })()
        ]);

        res.json({
            success: true,
            period,
            overview,
            salesTrend: trend,
            popularItems
        });

    } catch (error) {
        console.error("Get dashboard error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getDashboard,
    getDashboardOverview,
    getSalesTrend,
    getPopularItems
};

