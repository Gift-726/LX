/**
 * LX - Backend Server
 * Main server file for the e-commerce API
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST before importing anything else
dotenv.config();

import connectDB from './config/db';
import passport from './config/passport';

// Route imports (after dotenv.config())
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import userRoutes from './routes/userRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import addressRoutes from './routes/addressRoutes';
import shippingRoutes from './routes/shippingRoutes';
import discountRoutes from './routes/discountRoutes';
import disputeRoutes from './routes/disputeRoutes';
import reviewRoutes from './routes/reviewRoutes';
import contentRoutes from './routes/contentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import adminUserRoutes from './routes/adminUserRoutes';
import reportsRoutes from './routes/reportsRoutes';
import bannerRoutes from './routes/bannerRoutes';
import termsRoutes from './routes/termsRoutes';
import pageRestrictionRoutes from './routes/pageRestrictionRoutes';
import adminNotificationRoutes from './routes/adminNotificationRoutes';
import adminReviewRoutes from './routes/adminReviewRoutes';
import systemSettingsRoutes from './routes/systemSettingsRoutes';
import paymentRoutes from './routes/paymentRoutes';

// Connect to database (non-blocking - will retry on requests)
connectDB().catch((error) => {
  console.error('⚠️  Initial database connection failed. Will retry on first request.');
  // Don't exit - let the server start and retry connections
});

// Initialize email service (silent - will retry on first use if needed)
import { verifyEmailConnection } from './config/email';
verifyEmailConnection()
  .then((ready) => {
    if (ready) {
      console.log('✓ Email service ready');
    }
  })
  .catch(() => {
    // Silent - will retry when first email is sent
  });

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/admin/settings', systemSettingsRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/admin/page-restrictions', pageRestrictionRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (should be after all routes)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler (should be last)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✓ Server running on port ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health\n`);
});
