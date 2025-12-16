const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
    facebookId: { type: String, unique: true, sparse: true }, // For Facebook OAuth
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true }, // Optional for OAuth users
    password: { type: String }, // Optional for OAuth users
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, // User role
    avatar: { type: String }, // Profile picture URL
    isVerified: { type: Boolean, default: false }, // Email verification status
    verificationCode: { type: String }, // For 2FA login/registration
    verificationCodeExpiry: { type: Date }, // Expiry time for verification code
    resetCode: { type: String }, // For password reset
    resetCodeExpiry: { type: Date } // Expiry time for reset code
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
