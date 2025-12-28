/**
 * System Settings Controller
 * Handles system settings and admin profile
 */

const User = require("../models/User");

/* ============================================================
   GET SYSTEM SETTINGS (Admin Profile)
============================================================ */
const getSystemSettings = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id)
            .select("-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry")
            .populate("defaultAddress");

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        res.json({
            success: true,
            settings: {
                profile: {
                    name: `${admin.firstname} ${admin.lastname}`,
                    email: admin.email,
                    role: admin.role,
                    avatar: admin.avatar,
                    title: admin.title || ""
                },
                permissions: {
                    isAdmin: admin.role === "admin",
                    isSuperAdmin: admin.email === "gianosamsung@gmail.com"
                }
            }
        });

    } catch (error) {
        console.error("Get system settings error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UPDATE SYSTEM SETTINGS (Admin Profile)
============================================================ */
const updateSystemSettings = async (req, res) => {
    try {
        const { title, firstname, lastname, email, avatar } = req.body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (firstname !== undefined) updates.firstname = firstname;
        if (lastname !== undefined) updates.lastname = lastname;
        if (email !== undefined) updates.email = email;
        if (avatar !== undefined) updates.avatar = avatar;

        const admin = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true
        })
            .select("-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry");

        res.json({
            success: true,
            message: "System settings updated successfully",
            settings: {
                profile: {
                    name: `${admin.firstname} ${admin.lastname}`,
                    email: admin.email,
                    role: admin.role,
                    avatar: admin.avatar,
                    title: admin.title || ""
                }
            }
        });

    } catch (error) {
        console.error("Update system settings error:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
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
    getSystemSettings,
    updateSystemSettings
};


