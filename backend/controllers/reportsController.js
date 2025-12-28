/**
 * Reports and Analytics Controller
 * Handles reports, analytics, and data export
 */

const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const User = require("../models/User");
const Category = require("../models/Category");

/* ============================================================
   GET REPORTS OVERVIEW
============================================================ */
const getReportsOverview = async (req, res) => {
    try {
        const { period = "today" } = req.query;

        // Calculate date range
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

        // Sales Report - Count of orders in period
        const salesReportCount = await Order.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Product Performance - Percentage of products with sales
        const totalProducts = await Product.countDocuments({ isAvailable: true });
        const productsWithSales = await Product.countDocuments({
            isAvailable: true,
            salesCount: { $gt: 0 }
        });
        const productPerformance = totalProducts > 0 
            ? Math.round((productsWithSales / totalProducts) * 100) 
            : 0;

        // Customer Insight - Count of active customers (users with orders)
        const customersWithOrders = await User.distinct("_id", {
            _id: { $in: await Order.distinct("user", {
                createdAt: { $gte: startDate, $lte: endDate }
            })}
        });
        const customerInsightCount = customersWithOrders.length;

        // Revenue Overview
        const revenueOrders = await Order.find({
            paymentStatus: "paid",
            createdAt: { $gte: startDate, $lte: endDate }
        });
        const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.total, 0);

        res.json({
            success: true,
            period,
            overview: {
                salesReport: salesReportCount,
                productPerformance: `${productPerformance}%`,
                customerInsight: customerInsightCount,
                revenue: totalRevenue
            }
        });

    } catch (error) {
        console.error("Get reports overview error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET REVENUE CHART DATA
============================================================ */
const getRevenueChart = async (req, res) => {
    try {
        const { period = "M", year, month } = req.query; // D, W, M, Y

        let startDate, endDate, groupBy;

        if (period === "D") {
            // Day - last 30 days
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 30);
            groupBy = "day";
        } else if (period === "W") {
            // Week - last 12 weeks
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 84); // 12 weeks
            groupBy = "week";
        } else if (period === "M" && year && month) {
            // Specific month
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59);
            groupBy = "day";
        } else if (period === "M") {
            // Current month
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            groupBy = "day";
        } else if (period === "Y" && year) {
            // Specific year
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59);
            groupBy = "month";
        } else if (period === "Y") {
            // Current year
            const now = new Date();
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            groupBy = "month";
        } else {
            // Default to current month
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            groupBy = "day";
        }

        const orders = await Order.find({
            paymentStatus: "paid",
            createdAt: { $gte: startDate, $lte: endDate }
        }).select("total createdAt");

        // Group by period
        const revenueData = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            let key;

            if (groupBy === "day") {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            } else if (groupBy === "week") {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = `${weekStart.getFullYear()}-W${String(Math.ceil((weekStart.getDate() + 6) / 7)).padStart(2, '0')}`;
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!revenueData[key]) {
                revenueData[key] = 0;
            }
            revenueData[key] += order.total;
        });

        // Format for response
        const chartData = Object.keys(revenueData)
            .sort()
            .map(key => ({
                date: key,
                revenue: revenueData[key]
            }));

        res.json({
            success: true,
            period,
            year: year || new Date().getFullYear(),
            month: month || new Date().getMonth() + 1,
            chartData
        });

    } catch (error) {
        console.error("Get revenue chart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET SALES TREND CHART DATA
============================================================ */
const getSalesTrendChart = async (req, res) => {
    try {
        const { period = "M", year, month } = req.query;

        let startDate, endDate, groupBy;

        if (period === "D") {
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 30);
            groupBy = "day";
        } else if (period === "W") {
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 84);
            groupBy = "week";
        } else if (period === "M" && year && month) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59);
            groupBy = "day";
        } else if (period === "M") {
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            groupBy = "day";
        } else if (period === "Y" && year) {
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59);
            groupBy = "month";
        } else if (period === "Y") {
            const now = new Date();
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            groupBy = "month";
        } else {
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            groupBy = "day";
        }

        const orderItems = await OrderItem.aggregate([
            {
                $lookup: {
                    from: "orders",
                    localField: "order",
                    foreignField: "_id",
                    as: "orderData"
                }
            },
            {
                $unwind: "$orderData"
            },
            {
                $match: {
                    "orderData.createdAt": { $gte: startDate, $lte: endDate },
                    "orderData.paymentStatus": "paid"
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: groupBy === "day" ? "%Y-%m-%d" : (groupBy === "week" ? "%Y-W%V" : "%Y-%m"),
                            date: "$orderData.createdAt"
                        }
                    },
                    totalQuantity: { $sum: "$quantity" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const chartData = orderItems.map(item => ({
            date: item._id,
            sales: item.totalQuantity
        }));

        res.json({
            success: true,
            period,
            year: year || new Date().getFullYear(),
            month: month || new Date().getMonth() + 1,
            chartData
        });

    } catch (error) {
        console.error("Get sales trend chart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET USER ENGAGEMENT CHART DATA
============================================================ */
const getUserEngagementChart = async (req, res) => {
    try {
        const { period = "M", year, month } = req.query;

        let startDate, endDate, groupBy;

        if (period === "D") {
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 30);
            groupBy = "day";
        } else if (period === "W") {
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 84);
            groupBy = "week";
        } else if (period === "M" && year && month) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59);
            groupBy = "day";
        } else if (period === "M") {
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            groupBy = "day";
        } else if (period === "Y" && year) {
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59);
            groupBy = "month";
        } else if (period === "Y") {
            const now = new Date();
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            groupBy = "month";
        } else {
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            groupBy = "day";
        }

        // Get user registrations and activity
        const users = await User.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).select("createdAt");

        // Get orders for engagement metric
        const orders = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).select("user createdAt");

        // Group by period
        const engagementData = {};

        // Count new users
        users.forEach(user => {
            const date = new Date(user.createdAt);
            let key;
            if (groupBy === "day") {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            } else if (groupBy === "week") {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = `${weekStart.getFullYear()}-W${String(Math.ceil((weekStart.getDate() + 6) / 7)).padStart(2, '0')}`;
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            if (!engagementData[key]) {
                engagementData[key] = { users: 0, orders: 0 };
            }
            engagementData[key].users += 1;
        });

        // Count orders (engagement)
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            let key;
            if (groupBy === "day") {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            } else if (groupBy === "week") {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = `${weekStart.getFullYear()}-W${String(Math.ceil((weekStart.getDate() + 6) / 7)).padStart(2, '0')}`;
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            if (!engagementData[key]) {
                engagementData[key] = { users: 0, orders: 0 };
            }
            engagementData[key].orders += 1;
        });

        // Format for response (combine users and orders for engagement metric)
        const chartData = Object.keys(engagementData)
            .sort()
            .map(key => ({
                date: key,
                engagement: engagementData[key].users + engagementData[key].orders
            }));

        res.json({
            success: true,
            period,
            year: year || new Date().getFullYear(),
            month: month || new Date().getMonth() + 1,
            chartData
        });

    } catch (error) {
        console.error("Get user engagement chart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET COMPLETE REPORTS DATA
============================================================ */
const getReports = async (req, res) => {
    try {
        const { period = "today", chartPeriod = "M", year, month } = req.query;

        // Get all data in parallel
        const [overview, revenueChart, salesTrendChart, userEngagementChart] = await Promise.all([
            // Overview (reuse existing function logic)
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

                const salesReportCount = await Order.countDocuments({
                    createdAt: { $gte: startDate, $lte: endDate }
                });

                const totalProducts = await Product.countDocuments({ isAvailable: true });
                const productsWithSales = await Product.countDocuments({
                    isAvailable: true,
                    salesCount: { $gt: 0 }
                });
                const productPerformance = totalProducts > 0 
                    ? Math.round((productsWithSales / totalProducts) * 100) 
                    : 0;

                const customersWithOrders = await User.distinct("_id", {
                    _id: { $in: await Order.distinct("user", {
                        createdAt: { $gte: startDate, $lte: endDate }
                    })}
                });
                const customerInsightCount = customersWithOrders.length;

                const revenueOrders = await Order.find({
                    paymentStatus: "paid",
                    createdAt: { $gte: startDate, $lte: endDate }
                });
                const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.total, 0);

                return {
                    salesReport: salesReportCount,
                    productPerformance: `${productPerformance}%`,
                    customerInsight: customerInsightCount,
                    revenue: totalRevenue
                };
            })(),
            // Revenue chart (simplified - would call getRevenueChart logic)
            Promise.resolve([]),
            // Sales trend chart (simplified - would call getSalesTrendChart logic)
            Promise.resolve([]),
            // User engagement chart (simplified - would call getUserEngagementChart logic)
            Promise.resolve([])
        ]);

        // For now, return overview with placeholder for charts
        // Frontend can call individual chart endpoints
        res.json({
            success: true,
            period,
            overview,
            charts: {
                revenue: "Call /api/admin/reports/revenue-chart",
                salesTrend: "Call /api/admin/reports/sales-trend-chart",
                userEngagement: "Call /api/admin/reports/user-engagement-chart"
            }
        });

    } catch (error) {
        console.error("Get reports error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   EXPORT DATA AS PDF (Placeholder)
============================================================ */
const exportAsPDF = async (req, res) => {
    try {
        // This would require a PDF generation library like pdfkit or puppeteer
        // For now, return a message indicating the feature needs implementation
        res.json({
            success: true,
            message: "PDF export feature requires PDF generation library. Data is available via API endpoints.",
            note: "Consider using libraries like pdfkit, puppeteer, or jspdf for client-side generation"
        });

    } catch (error) {
        console.error("Export PDF error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   EXPORT DATA AS EXCEL (Placeholder)
============================================================ */
const exportAsExcel = async (req, res) => {
    try {
        // This would require an Excel generation library like exceljs or xlsx
        // For now, return a message indicating the feature needs implementation
        res.json({
            success: true,
            message: "Excel export feature requires Excel generation library. Data is available via API endpoints.",
            note: "Consider using libraries like exceljs or xlsx for server-side generation, or SheetJS for client-side"
        });

    } catch (error) {
        console.error("Export Excel error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getReports,
    getReportsOverview,
    getRevenueChart,
    getSalesTrendChart,
    getUserEngagementChart,
    exportAsPDF,
    exportAsExcel
};


