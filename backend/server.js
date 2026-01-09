/**
 * LX - Backend Server
 * Main server file for the e-commerce API
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables FIRST before importing anything else
dotenv.config();

const connectDB = require("./config/db");
const passport = require("passport");

// Route imports (after dotenv.config())
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const addressRoutes = require("./routes/addressRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const discountRoutes = require("./routes/discountRoutes");
const disputeRoutes = require("./routes/disputeRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const contentRoutes = require("./routes/contentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const termsRoutes = require("./routes/termsRoutes");
const pageRestrictionRoutes = require("./routes/pageRestrictionRoutes");
const adminNotificationRoutes = require("./routes/adminNotificationRoutes");
const adminReviewRoutes = require("./routes/adminReviewRoutes");
const systemSettingsRoutes = require("./routes/systemSettingsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Connect to database
connectDB();

// Load passport strategies for OAuth
require("./config/passport");

// Initialize email service (silent - will retry on first use if needed)
const { verifyEmailConnection } = require("./config/email");
verifyEmailConnection()
  .then((ready) => {
    if (ready) {
      console.log("✓ Email service ready");
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
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/reports", reportsRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
app.use("/api/admin/settings", systemSettingsRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/terms", termsRoutes);
app.use("/api/admin/page-restrictions", pageRestrictionRoutes);
app.use("/api/payments", paymentRoutes);


// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (should be after all routes)
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// 404 handler (should be last)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
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