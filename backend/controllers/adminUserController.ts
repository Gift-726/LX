/**
 * Admin User Management Controller
 * Handles admin operations for user management
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Address from '../models/Address';
import Order from '../models/Order';

interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
}

interface UpdateUserBody {
  title?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  gender?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  marketingPreferences?: any;
}

interface SuspendUserBody {
  reason?: string;
}

/* ============================================================
   GET ALL USERS (Admin Only)
============================================================ */
const getAllUsers = async (req: Request<{}, {}, {}, { search?: string; role?: string; isSuspended?: string; page?: string; limit?: string }>, res: Response): Promise<void> => {
  try {
    const { search, role, isSuspended, page = '1', limit = '50' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query: any = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
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
      .select('-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry')
      .populate('suspendedBy', 'firstname lastname email')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET USER BY ID (Admin View)
============================================================ */
const getUserById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry')
      .populate('defaultAddress')
      .populate('lastSelectedCategory', 'name')
      .populate('suspendedBy', 'firstname lastname email');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
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
    console.error('Get user by ID error:', error);
    
    if (error instanceof Error && (error as any).name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE USER (Admin Only)
============================================================ */
const updateUser = async (req: Request<{ id: string }, {}, UpdateUserBody>, res: Response): Promise<void> => {
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
    const updates: any = {};
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
      .select('-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry')
      .populate('suspendedBy', 'firstname lastname email');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    if (error instanceof Error && (error as any).code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Email or phone already exists'
      });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   SUSPEND USER (Admin Only)
============================================================ */
const suspendUser = async (req: Request<{ id: string }, {}, SuspendUserBody>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Prevent suspending yourself
    if (user._id.toString() === req.user!._id.toString()) {
      res.status(400).json({
        success: false,
        message: 'You cannot suspend your own account'
      });
      return;
    }

    // Prevent suspending other admins (optional - remove if admins should be able to suspend each other)
    if (user.role === 'admin' && user.email !== 'gianosamsung@gmail.com') {
      res.status(400).json({
        success: false,
        message: 'Cannot suspend admin accounts'
      });
      return;
    }

    user.isSuspended = true;
    user.suspendedAt = new Date();
    user.suspendedBy = req.user!._id;
    if (reason) {
      user.suspensionReason = reason;
    }

    await user.save();

    const populatedUser = await User.findById(user._id)
      .select('-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry')
      .populate('suspendedBy', 'firstname lastname email');

    res.json({
      success: true,
      message: 'User suspended successfully',
      user: populatedUser
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Suspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UNSUSPEND USER (Admin Only)
============================================================ */
const unsuspendUser = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    user.isSuspended = false;
    user.suspendedAt = undefined;
    user.suspendedBy = undefined;
    user.suspensionReason = undefined;

    await user.save();

    const populatedUser = await User.findById(user._id)
      .select('-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry');

    res.json({
      success: true,
      message: 'User unsuspended successfully',
      user: populatedUser
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unsuspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET SUSPENDED USERS (Admin Only)
============================================================ */
const getSuspendedUsers = async (req: Request<{}, {}, {}, { search?: string; page?: string; limit?: string }>, res: Response): Promise<void> => {
  try {
    const { search, page = '1', limit = '50' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query: any = { isSuspended: true };

    // Search by name or email
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry')
      .populate('suspendedBy', 'firstname lastname email')
      .sort({ suspendedAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get suspended users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   DELETE USER (Admin Only)
============================================================ */
const deleteUser = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user!._id.toString()) {
      res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
      return;
    }

    // Prevent deleting the main admin account
    if (user.email === 'gianosamsung@gmail.com') {
      res.status(400).json({
        success: false,
        message: 'Cannot delete the main admin account'
      });
      return;
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET SUSPENDED USERS COUNT
============================================================ */
const getSuspendedUsersCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await User.countDocuments({ isSuspended: true });

    res.json({
      success: true,
      count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get suspended users count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   CREATE USER (Admin Only)
============================================================ */
const createUser = async (req: Request<{}, {}, CreateUserBody>, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'user', isActive = true } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Parse name (assuming format: "Firstname Lastname")
    const nameParts = name.trim().split(/\s+/);
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';

    if (!firstname) {
      res.status(400).json({
        success: false,
        message: 'Name must include at least a first name'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
      isVerified: true, // Admin-created users are auto-verified
      isSuspended: !isActive // If not active, suspend them
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).resetCode;
    delete (userResponse as any).resetCodeExpiry;
    delete (userResponse as any).verificationCode;
    delete (userResponse as any).verificationCodeExpiry;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Create user error:', error);
    
    if (error instanceof Error && (error as any).code === 11000) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
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
