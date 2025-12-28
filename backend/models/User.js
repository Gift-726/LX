const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
    facebookId: { type: String, unique: true, sparse: true }, // For Facebook OAuth
    title: { 
      type: String, 
      enum: ["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof", ""],
      default: ""
    }, // Title (Mr, Mrs, Ms, etc.)
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true }, // Optional for OAuth users
    password: { type: String }, // Optional for OAuth users
    gender: { 
      type: String, 
      enum: ["Male", "Female", "Other", ""],
      default: ""
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, // User role
    avatar: { type: String }, // Profile picture URL
    isVerified: { type: Boolean, default: false }, // Email verification status
    isSuspended: { type: Boolean, default: false }, // Suspension status
    suspendedAt: { type: Date }, // When user was suspended
    suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who suspended
    suspensionReason: { type: String }, // Reason for suspension
    verificationCode: { type: String }, // For 2FA login/registration
    verificationCodeExpiry: { type: Date }, // Expiry time for verification code
    resetCode: { type: String }, // For password reset
    resetCodeExpiry: { type: Date }, // Expiry time for reset code
    lastSelectedCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Last category user viewed
    // Marketing preferences
    marketingPreferences: {
      email: { type: Boolean, default: false }, // Email marketing
      sms: { type: Boolean, default: false }, // SMS marketing
      push: { type: Boolean, default: false } // Push notifications
    },
    // Default address (for quick checkout)
    defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
