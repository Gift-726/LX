/**
 * Authentication Middleware
 * Handles JWT token verification and admin authorization
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ============================================================
   PROTECT MIDDLEWARE - Verify JWT Token
============================================================ */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token provided"
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token failed"
            });
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

/* ============================================================
   ADMIN MIDDLEWARE - Verify User is Admin
============================================================ */
const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }
};

module.exports = { protect, admin };
