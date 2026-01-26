/**
 * Page Restriction Controller
 * Handles page access restrictions
 */

import { Request, Response } from 'express';
import PageRestriction, { AllowedRole, RestrictionType } from '../models/PageRestriction';

interface UpdatePageRestrictionBody {
  isRestricted?: boolean;
  restrictionType?: RestrictionType;
  allowedRoles?: AllowedRole[];
}

/* ============================================================
   GET ALL PAGE RESTRICTIONS
============================================================ */
const getAllPageRestrictions = async (req: Request, res: Response): Promise<void> => {
  try {
    const restrictions = await PageRestriction.find()
      .populate('updatedBy', 'firstname lastname email')
      .sort({ pageName: 1 });

    res.json({
      success: true,
      restrictions
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get all page restrictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET PAGE RESTRICTION BY NAME
============================================================ */
const getPageRestriction = async (req: Request<{ pageName: string }>, res: Response): Promise<void> => {
  try {
    const { pageName } = req.params;

    let restriction = await PageRestriction.findOne({ pageName });

    // If doesn't exist, create default
    if (!restriction) {
      restriction = await PageRestriction.create({
        pageName,
        allowedRoles: ['all'],
        isRestricted: false,
        restrictionType: 'all'
      });
    }

    res.json({
      success: true,
      restriction
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get page restriction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE PAGE RESTRICTION
============================================================ */
const updatePageRestriction = async (req: Request<{ pageName: string }, {}, UpdatePageRestrictionBody>, res: Response): Promise<void> => {
  try {
    const { pageName } = req.params;
    const { isRestricted, restrictionType, allowedRoles } = req.body;

    let restriction = await PageRestriction.findOne({ pageName });

    if (!restriction) {
      // Create if doesn't exist
      restriction = await PageRestriction.create({
        pageName,
        isRestricted: isRestricted !== undefined ? isRestricted : false,
        restrictionType: restrictionType || 'all',
        allowedRoles: allowedRoles || ['all'],
        updatedBy: req.user!._id
      });
    } else {
      // Update existing
      const updates: any = { updatedBy: req.user!._id };
      if (isRestricted !== undefined) updates.isRestricted = isRestricted;
      if (restrictionType !== undefined) updates.restrictionType = restrictionType;
      if (allowedRoles !== undefined) updates.allowedRoles = allowedRoles;

      restriction = await PageRestriction.findByIdAndUpdate(
        restriction._id,
        updates,
        { new: true, runValidators: true }
      );
    }

    if (!restriction) {
      res.status(500).json({
        success: false,
        message: 'Failed to create or update restriction'
      });
      return;
    }

    const populatedRestriction = await PageRestriction.findById(restriction._id)
      .populate('updatedBy', 'firstname lastname email');

    res.json({
      success: true,
      message: 'Page restriction updated successfully',
      restriction: populatedRestriction
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update page restriction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   CHECK PAGE ACCESS
============================================================ */
const checkPageAccess = async (req: Request<{ pageName: string }>, res: Response): Promise<void> => {
  try {
    const { pageName } = req.params;
    const userRole = req.user ? req.user.role : null;

    const restriction = await PageRestriction.findOne({ pageName });

    if (!restriction || !restriction.isRestricted) {
      res.json({
        success: true,
        hasAccess: true,
        message: 'Page is not restricted'
      });
      return;
    }

    // Check if user role is allowed
    const hasAccess = restriction.allowedRoles.includes('all') ||
                     (userRole && restriction.allowedRoles.includes(userRole as AllowedRole)) ||
                     (userRole === 'admin' && restriction.allowedRoles.includes('admins' as AllowedRole)) ||
                     (userRole === 'user' && restriction.allowedRoles.includes('users' as AllowedRole));

    res.json({
      success: true,
      hasAccess,
      restriction: hasAccess ? null : restriction
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Check page access error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  getAllPageRestrictions,
  getPageRestriction,
  updatePageRestriction,
  checkPageAccess
};
