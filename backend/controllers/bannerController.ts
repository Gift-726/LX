/**
 * Banner Controller
 * Handles banner management (CRUD and preview)
 */

import { Request, Response } from 'express';
import Banner, { BannerStatus } from '../models/Banner';

interface CreateBannerBody {
  title: string;
  heading?: string;
  bodyText?: string;
  buttonText?: string;
  buttonUrl?: string;
  image?: string;
  backgroundColor?: string;
  textColor?: string;
  status?: BannerStatus;
  displayOrder?: number;
  startDate?: string | Date;
  endDate?: string | Date;
}

/* ============================================================
   GET ALL BANNERS
============================================================ */
const getAllBanners = async (req: Request<{}, {}, {}, { status?: string; page?: string; limit?: string }>, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '50' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query: any = {};
    if (status) {
      query.status = status;
    }

    const banners = await Banner.find(query)
      .populate('createdBy', 'firstname lastname email')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Banner.countDocuments(query);

    res.json({
      success: true,
      banners,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get all banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET ACTIVE BANNERS (Public)
============================================================ */
const getActiveBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    const banners = await Banner.find({
      status: 'active',
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } }
      ]
    })
      .sort({ displayOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      banners
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get active banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET BANNER BY ID
============================================================ */
const getBannerById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id)
      .populate('createdBy', 'firstname lastname email');

    if (!banner) {
      res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
      return;
    }

    res.json({
      success: true,
      banner
    });

  } catch (error) {
    console.error('Get banner by ID error:', error);
    
    if (error instanceof Error && (error as any).name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid banner ID format'
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
   CREATE BANNER
============================================================ */
const createBanner = async (req: Request<{}, {}, CreateBannerBody>, res: Response): Promise<void> => {
  try {
    const {
      title,
      heading,
      bodyText,
      buttonText,
      buttonUrl,
      image,
      backgroundColor,
      textColor,
      status,
      displayOrder,
      startDate,
      endDate
    } = req.body;

    if (!title) {
      res.status(400).json({
        success: false,
        message: 'Title is required'
      });
      return;
    }

    const banner = await Banner.create({
      title,
      heading,
      bodyText,
      buttonText,
      buttonUrl,
      image,
      backgroundColor: backgroundColor || '#8B5CF6',
      textColor: textColor || '#FFFFFF',
      status: status || 'active',
      displayOrder: displayOrder || 0,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy: req.user!._id
    });

    const populatedBanner = await Banner.findById(banner._id)
      .populate('createdBy', 'firstname lastname email');

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner: populatedBanner
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE BANNER
============================================================ */
const updateBanner = async (req: Request<{ id: string }, {}, Partial<CreateBannerBody>>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: any = req.body;

    // Convert dates if provided
    if (updates.startDate) {
      updates.startDate = new Date(updates.startDate);
    }
    if (updates.endDate) {
      updates.endDate = new Date(updates.endDate);
    }

    const banner = await Banner.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate('createdBy', 'firstname lastname email');

    if (!banner) {
      res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Banner updated successfully',
      banner
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   DELETE BANNER
============================================================ */
const deleteBanner = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   PREVIEW BANNER
============================================================ */
const previewBanner = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
      return;
    }

    // Return banner data formatted for preview
    res.json({
      success: true,
      preview: {
        title: banner.title,
        heading: banner.heading,
        bodyText: banner.bodyText,
        buttonText: banner.buttonText,
        buttonUrl: banner.buttonUrl,
        image: banner.image,
        backgroundColor: banner.backgroundColor,
        textColor: banner.textColor,
        status: banner.status
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Preview banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  getAllBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  previewBanner
};
