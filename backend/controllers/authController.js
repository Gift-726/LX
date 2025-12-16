/**
 * Authentication Controller
 * Handles user registration, login, password reset, and 2FA verification
 */

const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendVerificationCode } = require("../config/email");

/* ============================================================
   REGISTER USER
============================================================ */
const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, phone, password, confirmPassword } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // Check duplicates
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        field: "email"
      });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
        field: "phone"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email is admin email
    const isAdmin = email.toLowerCase() === "gianosamsung@gmail.com";

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
      role: isAdmin ? "admin" : "user",
      isVerified: false,
      verificationCode,
      verificationCodeExpiry
    });

    // Send verification code via email (registration type)
    const emailResult = await sendVerificationCode(email, verificationCode, "registration");

    if (!emailResult.success) {
      // Delete the user if email fails
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again.",
        error: emailResult.error
      });
    }

    res.status(201).json({
      success: true,
      message: "Registration initiated. Please check your email for the verification code.",
      userId: newUser._id,
      email: newUser.email,
      expiresIn: "10 minutes",
      previewUrl: emailResult.previewUrl, // For testing with Ethereal
      isFallback: emailResult.isFallback
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/* ============================================================
   LOGIN USER (WITH ENHANCED VALIDATION)
============================================================ */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
        redirectTo: "signup"
      });
    }

    // Check if user registered via OAuth (no password)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was created using social login. Please use Google or Facebook to sign in.",
        socialLogin: true
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if user has verified their email (for non-OAuth users)
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first. Check your inbox for the verification code.",
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save verification code to user
    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;
    await user.save();

    // Send verification code via email (login type)
    const emailResult = await sendVerificationCode(email, verificationCode, "login");

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again.",
        error: emailResult.error
      });
    }

    res.json({
      success: true,
      message: "Verification code sent to your email. Please verify to complete login.",
      userId: user._id,
      email: user.email,
      expiresIn: "10 minutes",
      previewUrl: emailResult.previewUrl, // For testing with Ethereal
      isFallback: emailResult.isFallback
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


/* ============================================================
   FORGOT PASSWORD - SEND VERIFICATION CODE
============================================================ */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
        redirectTo: "signup"
      });
    }

    // Check if user registered via OAuth (no password to reset)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was created using social login. Password reset is not available.",
        socialLogin: true
      });
    }

    // Generate 4-digit code
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiry time (10 minutes from now)
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save code to database
    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;
    await user.save();

    // Send email (password-reset type)
    const emailResult = await sendVerificationCode(email, resetCode, "password-reset");

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again.",
        error: emailResult.error
      });
    }

    res.json({
      success: true,
      message: emailResult.isFallback
        ? "Verification code sent (using backup email service). See preview link."
        : "Verification code sent to your email",
      expiresIn: "10 minutes",
      // Include preview URL if using Ethereal (fallback)
      previewUrl: emailResult.previewUrl,
      isFallback: emailResult.isFallback
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


/* ============================================================
   VERIFY RESET CODE
============================================================ */
const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required"
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if code exists
    if (!user.resetCode) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new one."
      });
    }

    // Check if code has expired
    if (new Date() > user.resetCodeExpiry) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
        expired: true
      });
    }

    // Verify code
    if (user.resetCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    res.json({
      success: true,
      message: "Verification code is valid. You can now reset your password."
    });

  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


/* ============================================================
   RESET PASSWORD
============================================================ */
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if code exists
    if (!user.resetCode) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new one."
      });
    }

    // Check if code has expired
    if (new Date() > user.resetCodeExpiry) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
        expired: true
      });
    }

    // Verify code
    if (user.resetCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful. You can now login with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


/* ============================================================
   VERIFY REGISTRATION CODE (2FA)
============================================================ */
const verifyRegistration = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required"
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified. Please login."
      });
    }

    // Check if code exists
    if (!user.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new one."
      });
    }

    // Check if code has expired
    if (new Date() > user.verificationCodeExpiry) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please register again.",
        expired: true
      });
    }

    // Verify code
    if (user.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    // Mark user as verified and clear verification code
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({
      success: true,
      message: "Registration completed successfully!",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Verify registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


/* ============================================================
   VERIFY LOGIN CODE (2FA)
============================================================ */
const verifyLogin = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required"
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please complete registration verification first."
      });
    }

    // Check if code exists
    if (!user.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please login again."
      });
    }

    // Check if code has expired
    if (new Date() > user.verificationCodeExpiry) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please login again.",
        expired: true
      });
    }

    // Verify code
    if (user.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    // Clear verification code
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Verify login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  verifyRegistration,
  verifyLogin,
  forgotPassword,
  verifyResetCode,
  resetPassword
};