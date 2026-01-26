/**
 * Shipping Controller
 * Handles shipping methods and cost calculations
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ShippingMethod, { IShippingMethod } from '../models/ShippingMethod';

interface CreateShippingMethodBody {
  name: string;
  description?: string;
  deliveryTime?: string;
  deliveryTimeDays?: number;
  baseCost?: number;
  costPerKg?: number;
  availableCountries?: string[];
  minOrderValue?: number;
  maxWeight?: number;
  icon?: string;
}

interface CalculateShippingCostBody {
  methodId: string;
  weight?: number;
  orderValue?: number;
  country?: string;
}

/* ============================================================
   GET ALL SHIPPING METHODS
============================================================ */
const getShippingMethods = async (req: Request<{}, {}, {}, { country?: string }>, res: Response): Promise<void> => {
  try {
    const { country } = req.query;

    let query: any = { isActive: true };
    
    // Filter by country if provided
    if (country) {
      query.$or = [
        { availableCountries: { $in: [country] } },
        { availableCountries: { $size: 0 } } // Empty array means all countries
      ];
    }

    const methods = await ShippingMethod.find(query)
      .sort({ baseCost: 1 });

    res.json({
      success: true,
      methods
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get shipping methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET SHIPPING METHOD BY ID
============================================================ */
const getShippingMethodById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const method = await ShippingMethod.findById(id);

    if (!method) {
      res.status(404).json({
        success: false,
        message: 'Shipping method not found'
      });
      return;
    }

    res.json({
      success: true,
      method
    });

  } catch (error) {
    console.error('Get shipping method error:', error);
    
    if (error instanceof Error && (error as any).name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid shipping method ID format'
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
   CALCULATE SHIPPING COST
============================================================ */
const calculateShippingCost = async (req: Request<{}, {}, CalculateShippingCostBody>, res: Response): Promise<void> => {
  try {
    const { methodId, weight, orderValue, country } = req.body;

    if (!methodId) {
      res.status(400).json({
        success: false,
        message: 'Shipping method ID is required'
      });
      return;
    }

    // Validate method ID format
    if (!mongoose.Types.ObjectId.isValid(methodId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid shipping method ID format'
      });
      return;
    }

    const method = await ShippingMethod.findById(methodId);

    if (!method || !method.isActive) {
      res.status(404).json({
        success: false,
        message: 'Shipping method not found or inactive'
      });
      return;
    }

    // Check if method is available for country
    if (country && method.availableCountries.length > 0) {
      if (!method.availableCountries.includes(country)) {
        res.status(400).json({
          success: false,
          message: 'Shipping method not available for this country'
        });
        return;
      }
    }

    // Check minimum order value for free shipping
    if (method.minOrderValue > 0 && orderValue && orderValue >= method.minOrderValue) {
      res.json({
        success: true,
        cost: 0,
        method: method.name,
        message: 'Free shipping applied'
      });
      return;
    }

    // Calculate cost
    let cost = method.baseCost || 0;
    
    if (method.costPerKg > 0 && weight) {
      cost += method.costPerKg * weight;
    }

    // Check max weight
    if (method.maxWeight && weight && weight > method.maxWeight) {
      res.status(400).json({
        success: false,
        message: `Weight exceeds maximum allowed (${method.maxWeight}kg)`
      });
      return;
    }

    res.json({
      success: true,
      cost,
      method: method.name,
      deliveryTime: method.deliveryTime,
      deliveryTimeDays: method.deliveryTimeDays
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Calculate shipping cost error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   CREATE SHIPPING METHOD (Admin Only)
============================================================ */
const createShippingMethod = async (req: Request<{}, {}, CreateShippingMethodBody>, res: Response): Promise<void> => {
  try {
    const {
      name, description, deliveryTime, deliveryTimeDays,
      baseCost, costPerKg, availableCountries, minOrderValue,
      maxWeight, icon
    } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Shipping method name is required'
      });
      return;
    }

    const method = await ShippingMethod.create({
      name,
      description,
      deliveryTime,
      deliveryTimeDays,
      baseCost: baseCost || 0,
      costPerKg: costPerKg || 0,
      availableCountries: availableCountries || [],
      minOrderValue: minOrderValue || 0,
      maxWeight,
      icon,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Shipping method created',
      method
    });

  } catch (error) {
    console.error('Create shipping method error:', error);
    
    if (error instanceof Error && (error as any).code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Shipping method with this name already exists'
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
   UPDATE SHIPPING METHOD (Admin Only)
============================================================ */
const updateShippingMethod = async (req: Request<{ id: string }, {}, Partial<CreateShippingMethodBody>>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const method = await ShippingMethod.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!method) {
      res.status(404).json({
        success: false,
        message: 'Shipping method not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Shipping method updated',
      method
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update shipping method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   DELETE SHIPPING METHOD (Admin Only)
============================================================ */
const deleteShippingMethod = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const method = await ShippingMethod.findByIdAndDelete(id);

    if (!method) {
      res.status(404).json({
        success: false,
        message: 'Shipping method not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Shipping method deleted'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete shipping method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  getShippingMethods,
  getShippingMethodById,
  calculateShippingCost,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod
};
