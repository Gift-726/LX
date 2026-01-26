/**
 * System Settings Controller
 * Handles system settings and admin profile
 */

import { Request, Response } from 'express';
import User from '../models/User';

interface UpdateSystemSettingsBody {
  title?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  avatar?: string;
}

/* ============================================================
   GET SYSTEM SETTINGS (Admin Profile)
============================================================ */
const getSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await User.findById(req.user!._id)
      .select('-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry')
      .populate('defaultAddress');

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
      return;
    }

    res.json({
      success: true,
      settings: {
        profile: {
          name: `${admin.firstname} ${admin.lastname}`,
          email: admin.email,
          role: admin.role,
          avatar: admin.avatar,
          title: admin.title || ''
        },
        permissions: {
          isAdmin: admin.role === 'admin',
          isSuperAdmin: admin.email === 'gianosamsung@gmail.com'
        }
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE SYSTEM SETTINGS (Admin Profile)
============================================================ */
const updateSystemSettings = async (req: Request<{}, {}, UpdateSystemSettingsBody>, res: Response): Promise<void> => {
  try {
    const { title, firstname, lastname, email, avatar } = req.body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (firstname !== undefined) updates.firstname = firstname;
    if (lastname !== undefined) updates.lastname = lastname;
    if (email !== undefined) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;

    const admin = await User.findByIdAndUpdate(req.user!._id, updates, {
      new: true,
      runValidators: true
    })
      .select('-password -resetCode -resetCodeExpiry -verificationCode -verificationCodeExpiry');

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'System settings updated successfully',
      settings: {
        profile: {
          name: `${admin.firstname} ${admin.lastname}`,
          email: admin.email,
          role: admin.role,
          avatar: admin.avatar,
          title: admin.title || ''
        }
      }
    });

  } catch (error) {
    console.error('Update system settings error:', error);
    
    if (error instanceof Error && (error as any).code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Email already exists'
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
  getSystemSettings,
  updateSystemSettings
};
