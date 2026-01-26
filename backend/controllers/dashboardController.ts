/**
 * Dashboard Controller
 * Handles admin dashboard analytics and statistics
 */

import { Request, Response } from 'express';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import User from '../models/User';

/* ============================================================
   GET DASHBOARD OVERVIEW
============================================================ */
const getDashboardOverview = async (req: Request<{}, {}, {}, { period?: string }>, res: Response): Promise<void> => {
  try {
    const { period = 'today' } = req.query; // today, week, month, year

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date(now);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    }

    // Get revenue (total of all paid orders in period)
    const revenueOrders = await Order.find({
      paymentStatus: 'paid',
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET SALES TREND
============================================================ */
const getSalesTrend = async (req: Request<{}, {}, {}, { period?: string; year?: string; month?: string }>, res: Response): Promise<void> => {
  try {
    const { period = 'month', year, month } = req.query;

    let startDate: Date, endDate: Date, groupBy: string;

    if (period === 'month' && year && month) {
      // Specific month
      startDate = new Date(Number(year), Number(month) - 1, 1);
      endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      groupBy = 'day';
    } else if (period === 'year' && year) {
      // Specific year
      startDate = new Date(Number(year), 0, 1);
      endDate = new Date(Number(year), 11, 31, 23, 59, 59);
      groupBy = 'month';
    } else {
      // Current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      groupBy = 'day';
    }

    // Get all paid orders in the period
    const orders = await Order.find({
      paymentStatus: 'paid',
      createdAt: { $gte: startDate, $lte: endDate }
    }).select('total createdAt');

    // Group by day or month
    const salesData: Record<string, number> = {};

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key: string;

      if (groupBy === 'day') {
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get sales trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET POPULAR ITEMS
============================================================ */
const getPopularItems = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get best selling products (by salesCount)
    const bestSellingProducts = await OrderItem.aggregate([
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$subtotal' }
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
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      }
    ]);

    // Get best selling category
    const bestSellingCategory = await OrderItem.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $group: {
          _id: '$category._id',
          categoryName: { $first: '$category.name' },
          totalQuantity: { $sum: '$quantity' }
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
      .select('title salesCount');

    // Format response
    const popularItems = {
      bestSellingItem: bestSellingProducts.length > 0 && bestSellingProducts[0] ? {
        name: (bestSellingProducts[0].product as any)?.title || 'Unknown',
        quantity: bestSellingProducts[0].totalQuantity || 0,
        revenue: bestSellingProducts[0].totalRevenue || 0
      } : null,
      bestSellingCategory: bestSellingCategory.length > 0 && bestSellingCategory[0] ? {
        name: bestSellingCategory[0].categoryName || 'Unknown',
        quantity: bestSellingCategory[0].totalQuantity || 0
      } : null,
      mostSold: mostSoldProduct.length > 0 && mostSoldProduct[0] ? {
        name: mostSoldProduct[0].title || 'Unknown',
        quantity: mostSoldProduct[0].salesCount || 0
      } : null
    };

    res.json({
      success: true,
      popularItems
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get popular items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET COMPLETE DASHBOARD DATA
============================================================ */
const getDashboard = async (req: Request<{}, {}, {}, { period?: string; year?: string; month?: string }>, res: Response): Promise<void> => {
  try {
    const { period = 'today', year, month } = req.query;

    // Get all data in parallel
    const [overview, trend, popularItems] = await Promise.all([
      // Overview
      (async () => {
        const now = new Date();
        let startDate: Date, endDate: Date;

        switch (period) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            break;
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            endDate = new Date(now);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            break;
          default:
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        }

        const revenueOrders = await Order.find({
          paymentStatus: 'paid',
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
        let startDate: Date, endDate: Date, groupBy: string;

        if (period === 'month' && year && month) {
          startDate = new Date(Number(year), Number(month) - 1, 1);
          endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
          groupBy = 'day';
        } else if (period === 'year' && year) {
          startDate = new Date(Number(year), 0, 1);
          endDate = new Date(Number(year), 11, 31, 23, 59, 59);
          groupBy = 'month';
        } else {
          const now = new Date();
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          groupBy = 'day';
        }

        const orders = await Order.find({
          paymentStatus: 'paid',
          createdAt: { $gte: startDate, $lte: endDate }
        }).select('total createdAt');

        const salesData: Record<string, number> = {};
        orders.forEach(order => {
          const date = new Date(order.createdAt);
          let key: string;
          if (groupBy === 'day') {
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
          { $group: { _id: '$product', totalQuantity: { $sum: '$quantity' }, totalRevenue: { $sum: '$subtotal' } } },
          { $sort: { totalQuantity: -1 } },
          { $limit: 1 },
          { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
          { $unwind: '$product' }
        ]);

        const bestSellingCategory = await OrderItem.aggregate([
          { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
          { $unwind: '$product' },
          { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' } },
          { $unwind: '$category' },
          { $group: { _id: '$category._id', categoryName: { $first: '$category.name' }, totalQuantity: { $sum: '$quantity' } } },
          { $sort: { totalQuantity: -1 } },
          { $limit: 1 }
        ]);

        const mostSoldProduct = await Product.find()
          .sort({ salesCount: -1 })
          .limit(1)
          .select('title salesCount');

        return {
          bestSellingItem: bestSellingProducts.length > 0 && bestSellingProducts[0] ? {
            name: (bestSellingProducts[0].product as any)?.title || 'Unknown',
            quantity: bestSellingProducts[0].totalQuantity || 0
          } : null,
          bestSellingCategory: bestSellingCategory.length > 0 && bestSellingCategory[0] ? {
            name: bestSellingCategory[0].categoryName || 'Unknown',
            quantity: bestSellingCategory[0].totalQuantity || 0
          } : null,
          mostSold: mostSoldProduct.length > 0 && mostSoldProduct[0] ? {
            name: mostSoldProduct[0].title || 'Unknown',
            quantity: mostSoldProduct[0].salesCount || 0
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  getDashboard,
  getDashboardOverview,
  getSalesTrend,
  getPopularItems
};
