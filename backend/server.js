/**
 * McGeorge LX - Backend Server
 * Main server file for the e-commerce API
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const passport = require("passport");

// Route imports
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Load passport strategies for OAuth
require("./config/passport");

// Initialize email service
const { verifyEmailConnection } = require("./config/email");
verifyEmailConnection()
  .then((ready) => {
    if (ready) {
      console.log("✅ Email service initialized successfully");
    } else {
      console.warn("\n⚠️ Email service initialization failed!");
      console.warn("   Run: node scripts/test-gmail-config.js");
      console.warn("   This will help diagnose Gmail configuration issues\n");
    }
  })
  .catch((err) => {
    console.error("\n❌ Email service initialization error:", err.message);
    console.error("   Make sure EMAIL_USER and EMAIL_PASSWORD are set in .env");
    console.error("   Run: node scripts/test-gmail-config.js for diagnostics\n");
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
});     