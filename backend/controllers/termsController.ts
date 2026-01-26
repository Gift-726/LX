/**
 * Terms and Conditions Controller
 * Handles terms and conditions management
 */

import { Request, Response } from 'express';
import TermsAndCondition from '../models/TermsAndCondition';

interface CreateTermsBody {
  title: string;
  content: string;
  effectiveDate?: string | Date;
}

interface UpdateTermsBody {
  title?: string;
  content?: string;
  effectiveDate?: string | Date;
  isActive?: boolean;
}

/* ============================================================
   GET ALL TERMS AND CONDITIONS
============================================================ */
const getAllTerms = async (req: Request<{}, {}, {}, { isActive?: string; page?: string; limit?: string }>, res: Response): Promise<void> => {
  try {
    const { isActive, page = '1', limit = '50' } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const terms = await TermsAndCondition.find(query)
      .populate('createdBy', 'firstname lastname email')
      .populate('updatedBy', 'firstname lastname email')
      .sort({ effectiveDate: -1, createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await TermsAndCondition.countDocuments(query);

    res.json({
      success: true,
      terms,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      total: count
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get all terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET ACTIVE TERMS AND CONDITIONS (Public)
============================================================ */
const getActiveTerms = async (req: Request, res: Response): Promise<void> => {
  try {
    const terms = await TermsAndCondition.find({ isActive: true })
      .sort({ effectiveDate: -1 });

    res.json({
      success: true,
      terms
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get active terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET TERMS BY ID
============================================================ */
const getTermsById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const terms = await TermsAndCondition.findById(id)
      .populate('createdBy', 'firstname lastname email')
      .populate('updatedBy', 'firstname lastname email');

    if (!terms) {
      res.status(404).json({
        success: false,
        message: 'Terms and conditions not found'
      });
      return;
    }

    res.json({
      success: true,
      terms
    });

  } catch (error) {
    console.error('Get terms by ID error:', error);
    
    if (error instanceof Error && (error as any).name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid terms ID format'
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
   CREATE TERMS AND CONDITIONS
============================================================ */
const createTerms = async (req: Request<{}, {}, CreateTermsBody>, res: Response): Promise<void> => {
  try {
    const { title, content, effectiveDate } = req.body;

    if (!title || !content) {
      res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
      return;
    }

    // Deactivate all existing terms
    await TermsAndCondition.updateMany({}, { isActive: false });

    // Get next version number
    const lastTerms = await TermsAndCondition.findOne()
      .sort({ version: -1 });
    const nextVersion = lastTerms ? lastTerms.version + 1 : 1;

    const terms = await TermsAndCondition.create({
      title,
      content,
      version: nextVersion,
      isActive: true,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      createdBy: req.user!._id,
      updatedBy: req.user!._id
    });

    const populatedTerms = await TermsAndCondition.findById(terms._id)
      .populate('createdBy', 'firstname lastname email')
      .populate('updatedBy', 'firstname lastname email');

    res.status(201).json({
      success: true,
      message: 'Terms and conditions created successfully',
      terms: populatedTerms
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE TERMS AND CONDITIONS
============================================================ */
const updateTerms = async (req: Request<{ id: string }, {}, UpdateTermsBody>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, effectiveDate, isActive } = req.body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (effectiveDate !== undefined) updates.effectiveDate = new Date(effectiveDate);
    if (isActive !== undefined) {
      updates.isActive = isActive;
      // If activating, deactivate others
      if (isActive) {
        await TermsAndCondition.updateMany(
          { _id: { $ne: id } },
          { isActive: false }
        );
      }
    }
    updates.updatedBy = req.user!._id;

    const terms = await TermsAndCondition.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate('createdBy', 'firstname lastname email')
      .populate('updatedBy', 'firstname lastname email');

    if (!terms) {
      res.status(404).json({
        success: false,
        message: 'Terms and conditions not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Terms and conditions updated successfully',
      terms
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   DELETE TERMS AND CONDITIONS
============================================================ */
const deleteTerms = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const terms = await TermsAndCondition.findByIdAndDelete(id);

    if (!terms) {
      res.status(404).json({
        success: false,
        message: 'Terms and conditions not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Terms and conditions deleted successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  getAllTerms,
  getActiveTerms,
  getTermsById,
  createTerms,
  updateTerms,
  deleteTerms
};
