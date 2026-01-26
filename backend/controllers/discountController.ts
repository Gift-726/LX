/**
 * Discount Controller
 * Handles discount codes and promotions
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import DiscountCode, { DiscountType } from '../models/DiscountCode';

interface ValidateDiscountCodeBody {
  code: string;
  orderValue?: number;
  productIds?: string[];
  categoryIds?: string[];
}

interface ApplyDiscountCodeBody extends ValidateDiscountCodeBody {
  userId?: string;
}

interface CreateDiscountCodeBody {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: string | Date;
  validUntil: string | Date;
  usageLimit?: number;
  userLimit?: number;
  applicableCategories?: string[] | string;
  applicableProducts?: string[] | string;
}

/* ============================================================
   VALIDATE DISCOUNT CODE
============================================================ */
const validateDiscountCode = async (req: Request<{}, {}, ValidateDiscountCodeBody>, res: Response): Promise<void> => {
  try {
    const { code, orderValue, productIds, categoryIds } = req.body;

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Discount code is required'
      });
      return;
    }

    const discountCode = await DiscountCode.findOne({
      code: code.toUpperCase(),
      isActive: true
    });

    if (!discountCode) {
      res.status(404).json({
        success: false,
        message: 'Invalid or expired discount code'
      });
      return;
    }

    const now = new Date();

    // Check validity dates
    if (now < discountCode.validFrom || now > discountCode.validUntil) {
      res.status(400).json({
        success: false,
        message: 'Discount code is not valid at this time'
      });
      return;
    }

    // Check usage limit
    if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
      res.status(400).json({
        success: false,
        message: 'Discount code has reached its usage limit'
      });
      return;
    }

    // Check minimum order value
    if (orderValue && discountCode.minOrderValue > 0 && orderValue < discountCode.minOrderValue) {
      res.status(400).json({
        success: false,
        message: `Minimum order value of ${discountCode.minOrderValue} required for this code`
      });
      return;
    }

    // Check if code applies to specific categories
    if (discountCode.applicableCategories.length > 0 && categoryIds) {
      const applicable = categoryIds.some(catId => 
        discountCode.applicableCategories.some(appCat => 
          appCat.toString() === catId.toString()
        )
      );
      if (!applicable) {
        res.status(400).json({
          success: false,
          message: 'Discount code does not apply to selected categories'
        });
        return;
      }
    }

    // Check if code applies to specific products
    if (discountCode.applicableProducts.length > 0 && productIds) {
      const applicable = productIds.some(prodId => 
        discountCode.applicableProducts.some(appProd => 
          appProd.toString() === prodId.toString()
        )
      );
      if (!applicable) {
        res.status(400).json({
          success: false,
          message: 'Discount code does not apply to selected products'
        });
        return;
      }
    }

    // Calculate discount amount (don't apply yet, just return info)
    let discountAmount = 0;
    if (orderValue) {
      if (discountCode.discountType === 'percentage') {
        discountAmount = (orderValue * discountCode.discountValue) / 100;
        if (discountCode.maxDiscount) {
          discountAmount = Math.min(discountAmount, discountCode.maxDiscount);
        }
      } else {
        discountAmount = discountCode.discountValue;
      }
    }

    res.json({
      success: true,
      valid: true,
      discountCode: {
        code: discountCode.code,
        discountType: discountCode.discountType,
        discountValue: discountCode.discountValue,
        discountAmount,
        description: discountCode.description
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Validate discount code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   APPLY DISCOUNT CODE
============================================================ */
const applyDiscountCode = async (req: Request<{}, {}, ApplyDiscountCodeBody>, res: Response): Promise<void> => {
  try {
    const { code, orderValue, productIds, categoryIds } = req.body;

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Discount code is required'
      });
      return;
    }

    const discountCode = await DiscountCode.findOne({
      code: code.toUpperCase(),
      isActive: true
    });

    if (!discountCode) {
      res.status(404).json({
        success: false,
        message: 'Invalid or expired discount code'
      });
      return;
    }

    const now = new Date();

    // Check validity dates
    if (now < discountCode.validFrom || now > discountCode.validUntil) {
      res.status(400).json({
        success: false,
        message: 'Discount code is not valid at this time'
      });
      return;
    }

    // Check usage limit
    if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
      res.status(400).json({
        success: false,
        message: 'Discount code has reached its usage limit'
      });
      return;
    }

    // Check minimum order value
    if (orderValue && discountCode.minOrderValue > 0 && orderValue < discountCode.minOrderValue) {
      res.status(400).json({
        success: false,
        message: `Minimum order value of ${discountCode.minOrderValue} required`
      });
      return;
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (orderValue) {
      if (discountCode.discountType === 'percentage') {
        discountAmount = (orderValue * discountCode.discountValue) / 100;
        if (discountCode.maxDiscount) {
          discountAmount = Math.min(discountAmount, discountCode.maxDiscount);
        }
      } else {
        discountAmount = discountCode.discountValue;
      }
    }

    // Increment usage count
    discountCode.usageCount += 1;
    await discountCode.save();

    res.json({
      success: true,
      message: 'Discount code applied',
      discount: {
        code: discountCode.code,
        discountType: discountCode.discountType,
        discountValue: discountCode.discountValue,
        discountAmount,
        description: discountCode.description
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Apply discount code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET ALL DISCOUNT CODES (Admin Only)
============================================================ */
const getDiscountCodes = async (req: Request<{}, {}, {}, { active?: string }>, res: Response): Promise<void> => {
  try {
    const { active } = req.query;

    let query: any = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const codes = await DiscountCode.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      codes
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get discount codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   CREATE DISCOUNT CODE (Admin Only)
============================================================ */
const createDiscountCode = async (req: Request<{}, {}, CreateDiscountCodeBody>, res: Response): Promise<void> => {
  try {
    const {
      code, description, discountType, discountValue,
      minOrderValue, maxDiscount, validFrom, validUntil,
      usageLimit, userLimit, applicableCategories, applicableProducts
    } = req.body;

    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      res.status(400).json({
        success: false,
        message: 'Code, discount type, discount value, valid from, and valid until are required'
      });
      return;
    }

    // Parse and validate applicableCategories
    let parsedCategories: mongoose.Types.ObjectId[] = [];
    if (applicableCategories) {
      let categoriesArray: any = applicableCategories;
      
      // If it's a string, try to parse it
      if (typeof applicableCategories === 'string') {
        try {
          categoriesArray = JSON.parse(applicableCategories);
        } catch (e) {
          // If JSON parse fails, treat as single value or comma-separated
          categoriesArray = applicableCategories.split(',').map((c: string) => c.trim());
        }
      }
      
      // Ensure it's an array
      if (!Array.isArray(categoriesArray)) {
        categoriesArray = [categoriesArray];
      }
      
      // Validate and convert to ObjectIds
      for (const catId of categoriesArray) {
        if (catId && mongoose.Types.ObjectId.isValid(catId)) {
          parsedCategories.push(new mongoose.Types.ObjectId(catId));
        }
      }
    }

    // Parse and validate applicableProducts
    let parsedProducts: mongoose.Types.ObjectId[] = [];
    if (applicableProducts) {
      let productsArray: any = applicableProducts;
      
      // If it's a string, try to parse it
      if (typeof applicableProducts === 'string') {
        try {
          productsArray = JSON.parse(applicableProducts);
        } catch (e) {
          // If JSON parse fails, treat as single value or comma-separated
          productsArray = applicableProducts.split(',').map((p: string) => p.trim());
        }
      }
      
      // Ensure it's an array
      if (!Array.isArray(productsArray)) {
        productsArray = [productsArray];
      }
      
      // Validate and convert to ObjectIds
      for (const prodId of productsArray) {
        if (prodId && mongoose.Types.ObjectId.isValid(prodId)) {
          parsedProducts.push(new mongoose.Types.ObjectId(prodId));
        }
      }
    }

    const discountCode = await DiscountCode.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscount,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      usageLimit,
      userLimit: userLimit || 1,
      applicableCategories: parsedCategories,
      applicableProducts: parsedProducts,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Discount code created',
      code: discountCode
    });

  } catch (error) {
    console.error('Create discount code error:', error);
    
    if (error instanceof Error && (error as any).code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Discount code already exists'
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
   UPDATE DISCOUNT CODE (Admin Only)
============================================================ */
const updateDiscountCode = async (req: Request<{ id: string }, {}, Partial<CreateDiscountCodeBody>>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: any = req.body;

    // Convert code to uppercase if provided
    if (updates.code) {
      updates.code = updates.code.toUpperCase();
    }

    // Convert dates if provided
    if (updates.validFrom) {
      updates.validFrom = new Date(updates.validFrom);
    }
    if (updates.validUntil) {
      updates.validUntil = new Date(updates.validUntil);
    }

    // Parse and validate applicableCategories if provided
    if (updates.applicableCategories !== undefined) {
      let parsedCategories: mongoose.Types.ObjectId[] = [];
      if (updates.applicableCategories) {
        let categoriesArray: any = updates.applicableCategories;
        
        if (typeof updates.applicableCategories === 'string') {
          try {
            categoriesArray = JSON.parse(updates.applicableCategories);
          } catch (e) {
            categoriesArray = updates.applicableCategories.split(',').map((c: string) => c.trim());
          }
        }
        
        if (!Array.isArray(categoriesArray)) {
          categoriesArray = [categoriesArray];
        }
        
        for (const catId of categoriesArray) {
          if (catId && mongoose.Types.ObjectId.isValid(catId)) {
            parsedCategories.push(new mongoose.Types.ObjectId(catId));
          }
        }
      }
      updates.applicableCategories = parsedCategories;
    }

    // Parse and validate applicableProducts if provided
    if (updates.applicableProducts !== undefined) {
      let parsedProducts: mongoose.Types.ObjectId[] = [];
      if (updates.applicableProducts) {
        let productsArray: any = updates.applicableProducts;
        
        if (typeof updates.applicableProducts === 'string') {
          try {
            productsArray = JSON.parse(updates.applicableProducts);
          } catch (e) {
            productsArray = updates.applicableProducts.split(',').map((p: string) => p.trim());
          }
        }
        
        if (!Array.isArray(productsArray)) {
          productsArray = [productsArray];
        }
        
        for (const prodId of productsArray) {
          if (prodId && mongoose.Types.ObjectId.isValid(prodId)) {
            parsedProducts.push(new mongoose.Types.ObjectId(prodId));
          }
        }
      }
      updates.applicableProducts = parsedProducts;
    }

    const discountCode = await DiscountCode.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!discountCode) {
      res.status(404).json({
        success: false,
        message: 'Discount code not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Discount code updated',
      code: discountCode
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update discount code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   DELETE DISCOUNT CODE (Admin Only)
============================================================ */
const deleteDiscountCode = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const discountCode = await DiscountCode.findByIdAndDelete(id);

    if (!discountCode) {
      res.status(404).json({
        success: false,
        message: 'Discount code not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Discount code deleted'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete discount code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET AVAILABLE COUPONS (User-facing)
============================================================ */
const getAvailableCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    // Get active coupons that are currently valid
    const coupons = await DiscountCode.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
      ]
    })
      .populate('applicableCategories', 'name')
      .populate('applicableProducts', 'title images')
      .sort({ discountValue: -1, createdAt: -1 });

    // Format coupons for UI
    const formattedCoupons = coupons.map(coupon => {
      const discountText = coupon.discountType === 'percentage' 
        ? `${coupon.discountValue}% OFF`
        : `N${coupon.discountValue} OFF`;

      return {
        _id: coupon._id,
        code: coupon.code,
        name: coupon.code, // Using code as name (e.g., "Gagnon-rosepink")
        description: coupon.description || 'A great fashion wear suitable for business and outings',
        discountText,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        validUntil: coupon.validUntil,
        applicableCategories: coupon.applicableCategories,
        applicableProducts: coupon.applicableProducts
      };
    });

    res.json({
      success: true,
      coupons: formattedCoupons,
      total: formattedCoupons.length
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get available coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  validateDiscountCode,
  applyDiscountCode,
  getAvailableCoupons,
  getDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode
};
