/**
 * Admin User Management Controller
 * Handles admin operations for user management
 */

const User = require("../models/User");
const Address = require("../models/Address");
const Order = require("../models/Order");

/* ============================================================
   GET ALL USERS (Admin Only)
============================================================ */
const getAllUsers = async (req, res) => {
    try {
        const { search, role, isSuspended, page = 1, limit = 50 } = req.query;

        let query = {};

        // Search by name or email
        if (search) {
            query.$or = [
                { firstname: { $regex: search, $options: "i" } },
                { lastname: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by role
        if (role) {
            query.role = role;
        }

        // Filter by suspension status
        if (isSuspended !== undefined) {
            query.isSuspended = isSuspended === 'true';
        }

        const users = await User.find(query)
            .select("-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry")
            .populate("suspendedBy", "firstname lastname email")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(query);

        res.json({
            success: true,
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET USER BY ID (Admin View)
============================================================ */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id)
            .select("-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry")
            .populate("defaultAddress")
            .populate("lastSelectedCategory", "name")
            .populate("suspendedBy", "firstname lastname email");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get user's addresses
        const addresses = await Address.find({ user: user._id });

        // Get user's order count
        const orderCount = await Order.countDocuments({ user: user._id });

        res.json({
            success: true,
            user: {
                ...user.toObject(),
                addresses,
                orderCount
            }
        });

    } catch (error) {
        console.error("Get user by ID error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UPDATE USER (Admin Only)
============================================================ */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            firstname, 
            lastname, 
            email, 
            phone, 
            gender, 
            avatar, 
            role,
            marketingPreferences 
        } = req.body;

        // Prevent updating password through this endpoint
        const updates = {};
        if (title !== undefined) updates.title = title;
        if (firstname !== undefined) updates.firstname = firstname;
        if (lastname !== undefined) updates.lastname = lastname;
        if (email !== undefined) updates.email = email;
        if (phone !== undefined) updates.phone = phone;
        if (gender !== undefined) updates.gender = gender;
        if (avatar !== undefined) updates.avatar = avatar;
        if (role !== undefined) updates.role = role;
        if (marketingPreferences !== undefined) updates.marketingPreferences = marketingPreferences;

        const user = await User.findByIdAndUpdate(id, updates, { 
            new: true, 
            runValidators: true 
        })
            .select("-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry")
            .populate("suspendedBy", "firstname lastname email");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User updated successfully",
            user
        });

    } catch (error) {
        console.error("Update user error:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email or phone already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   SUSPEND USER (Admin Only)
============================================================ */
const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent suspending yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot suspend your own account"
            });
        }

        // Prevent suspending other admins (optional - remove if admins should be able to suspend each other)
        if (user.role === 'admin' && user.email !== 'gianosamsung@gmail.com') {
            return res.status(400).json({
                success: false,
                message: "Cannot suspend admin accounts"
            });
        }

        user.isSuspended = true;
        user.suspendedAt = new Date();
        user.suspendedBy = req.user._id;
        if (reason) {
            user.suspensionReason = reason;
        }

        await user.save();

        const populatedUser = await User.findById(user._id)
            .select("-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry")
            .populate("suspendedBy", "firstname lastname email");

        res.json({
            success: true,
            message: "User suspended successfully",
            user: populatedUser
        });

    } catch (error) {
        console.error("Suspend user error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UNSUSPEND USER (Admin Only)
============================================================ */
const unsuspendUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.isSuspended = false;
        user.suspendedAt = null;
        user.suspendedBy = null;
        user.suspensionReason = null;

        await user.save();

        const populatedUser = await User.findById(user._id)
            .select("-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry");

        res.json({
            success: true,
            message: "User unsuspended successfully",
            user: populatedUser
        });

    } catch (error) {
        console.error("Unsuspend user error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET SUSPENDED USERS (Admin Only)
============================================================ */
const getSuspendedUsers = async (req, res) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;

        let query = { isSuspended: true };

        // Search by name or email
        if (search) {
            query.$or = [
                { firstname: { $regex: search, $options: "i" } },
                { lastname: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const users = await User.find(query)
            .select("-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry")
            .populate("suspendedBy", "firstname lastname email")
            .sort({ suspendedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(query);

        res.json({
            success: true,
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error("Get suspended users error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   DELETE USER (Admin Only)
============================================================ */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
            });
        }

        // Prevent deleting the main admin account
        if (user.email === 'gianosamsung@gmail.com') {
            return res.status(400).json({
                success: false,
                message: "Cannot delete the main admin account"
            });
        }

        // Delete related data (optional - you might want to keep orders for records)
        // await Order.deleteMany({ user: user._id });
        // await Address.deleteMany({ user: user._id });
        // await Favorites.deleteMany({ user: user._id });

        // Delete user
        await User.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET SUSPENDED USERS COUNT
============================================================ */
const getSuspendedUsersCount = async (req, res) => {
    try {
        const count = await User.countDocuments({ isSuspended: true });

        res.json({
            success: true,
            count
        });

    } catch (error) {
        console.error("Get suspended users count error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CREATE USER (Admin Only)
============================================================ */
const createUser = async (req, res) => {
    try {
        const { name, email, password, role = "user", isActive = true } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Parse name (assuming format: "Firstname Lastname")
        const nameParts = name.trim().split(/\s+/);
        const firstname = nameParts[0] || "";
        const lastname = nameParts.slice(1).join(" ") || "";

        if (!firstname) {
            return res.status(400).json({
                success: false,
                message: "Name must include at least a first name"
            });
        }

        // Hash password
        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            firstname,
            lastname,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role === "admin" ? "admin" : "user",
            isVerified: true, // Admin-created users are auto-verified
            isSuspended: !isActive // If not active, suspend them
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.resetCode;
        delete userResponse.resetCodeExpiry;
        delete userResponse.verificationCode;
        delete userResponse.verificationCodeExpiry;

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: userResponse
        });

    } catch (error) {
        console.error("Create user error:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    suspendUser,
    unsuspendUser,
    getSuspendedUsers,
    deleteUser,
    getSuspendedUsersCount
};

