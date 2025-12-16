/**
 * Authentication Routes
 * Handles user registration, login, password reset, and OAuth authentication
 */

const express = require("express");
const passport = require("passport");

const {
  registerUser,
  loginUser,
  verifyRegistration,
  verifyLogin,
  forgotPassword,
  verifyResetCode,
  resetPassword
} = require("../controllers/authController");

const router = express.Router();

/* ============================================================
   EMAIL + PASSWORD AUTHENTICATION (2FA)
============================================================ */

// Register new user (sends 6-digit verification code)
router.post("/register", registerUser);

// Verify registration code (completes registration)
router.post("/verify-registration", verifyRegistration);

// Login existing user (sends 6-digit verification code)
router.post("/login", loginUser);

// Verify login code (completes login)
router.post("/verify-login", verifyLogin);

/* ============================================================
   PASSWORD RESET
============================================================ */

// Request password reset (sends 4-digit code to email)
router.post("/forgot-password", forgotPassword);

// Verify the reset code (optional step)
router.post("/verify-reset-code", verifyResetCode);

// Reset password with verified code
router.post("/reset-password", resetPassword);

/* ============================================================
   OAUTH AUTHENTICATION
============================================================ */

// Google OAuth - Step 1: Redirect to Google login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

// Google OAuth - Step 2: Callback handler
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Google authentication failed."
      });
    }

    res.json({
      success: true,
      message: "Google login successful",
      token: req.user.token,
      user: req.user,
    });
  }
);

// Facebook OAuth - Step 1: Redirect to Facebook login
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["public_profile"] })
);

// Facebook OAuth - Step 2: Callback handler
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Facebook authentication failed."
      });
    }

    res.json({
      success: true,
      message: "Facebook login successful",
      token: req.user.token,
      user: req.user,
    });
  }
);

module.exports = router;
