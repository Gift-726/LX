/**
 * Address Controller
 * Handles user shipping addresses
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Address, { AddressType, TitleType } from '../models/Address';
import User from '../models/User';

interface CreateAddressBody {
  title?: TitleType;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  country?: string;
  region?: string;
  city: string;
  address: string;
  postalCode?: string;
  isDefault?: boolean;
  addressType?: AddressType;
}

/* ============================================================
   GET ALL ADDRESSES
============================================================ */
const getAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const addresses = await Address.find({ user: req.user!._id })
      .sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      addresses
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   GET ADDRESS BY ID
============================================================ */
const getAddressById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({
      _id: id,
      user: req.user!._id
    });

    if (!address) {
      res.status(404).json({
        success: false,
        message: 'Address not found'
      });
      return;
    }

    res.json({
      success: true,
      address
    });

  } catch (error) {
    console.error('Get address error:', error);
    
    if (error instanceof Error && (error as any).name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid address ID format'
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
   CREATE ADDRESS
============================================================ */
const createAddress = async (req: Request<{}, {}, CreateAddressBody>, res: Response): Promise<void> => {
  try {
    const { 
      title, firstname, lastname, email, phone, 
      country, region, city, address, postalCode, 
      isDefault, addressType 
    } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !email || !phone || !city || !address) {
      res.status(400).json({
        success: false,
        message: 'Firstname, lastname, email, phone, city, and address are required'
      });
      return;
    }

    // If setting as default, unset other default addresses
    if (isDefault) {
      await Address.updateMany(
        { user: req.user!._id, isDefault: true },
        { isDefault: false }
      );
      
      // Update user's default address
      const newAddress = await Address.create({
        user: req.user!._id,
        title: title || '',
        firstname,
        lastname,
        email,
        phone,
        country: country || 'Nigeria',
        region,
        city,
        address,
        postalCode,
        isDefault: true,
        addressType: addressType || 'home'
      });

      await User.findByIdAndUpdate(req.user!._id, {
        defaultAddress: newAddress._id
      });

      res.status(201).json({
        success: true,
        message: 'Address created and set as default',
        address: newAddress
      });
      return;
    }

    const newAddress = await Address.create({
      user: req.user!._id,
      title: title || '',
      firstname,
      lastname,
      email,
      phone,
      country: country || 'Nigeria',
      region,
      city,
      address,
      postalCode,
      isDefault: false,
      addressType: addressType || 'home'
    });

    res.status(201).json({
      success: true,
      message: 'Address created',
      address: newAddress
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   UPDATE ADDRESS
============================================================ */
const updateAddress = async (req: Request<{ id: string }, {}, Partial<CreateAddressBody>>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const address = await Address.findOne({
      _id: id,
      user: req.user!._id
    });

    if (!address) {
      res.status(404).json({
        success: false,
        message: 'Address not found'
      });
      return;
    }

    // If setting as default, unset other default addresses
    if (updates.isDefault === true) {
      await Address.updateMany(
        { user: req.user!._id, isDefault: true, _id: { $ne: id } },
        { isDefault: false }
      );
      
      await User.findByIdAndUpdate(req.user!._id, {
        defaultAddress: id
      });
    }

    Object.assign(address, updates);
    await address.save();

    res.json({
      success: true,
      message: 'Address updated',
      address
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   DELETE ADDRESS
============================================================ */
const deleteAddress = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({
      _id: id,
      user: req.user!._id
    });

    if (!address) {
      res.status(404).json({
        success: false,
        message: 'Address not found'
      });
      return;
    }

    await Address.findByIdAndDelete(id);

    // If it was the default address, clear user's default
    if (address.isDefault) {
      await User.findByIdAndUpdate(req.user!._id, {
        $unset: { defaultAddress: '' } as any
      });
    }

    res.json({
      success: true,
      message: 'Address deleted'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

/* ============================================================
   SET DEFAULT ADDRESS
============================================================ */
const setDefaultAddress = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({
      _id: id,
      user: req.user!._id
    });

    if (!address) {
      res.status(404).json({
        success: false,
        message: 'Address not found'
      });
      return;
    }

    // Unset other default addresses
    await Address.updateMany(
      { user: req.user!._id, isDefault: true },
      { isDefault: false }
    );

    // Set this as default
    address.isDefault = true;
    await address.save();

    await User.findByIdAndUpdate(req.user!._id, {
      defaultAddress: id
    });

    res.json({
      success: true,
      message: 'Default address updated',
      address
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: errorMessage
    });
  }
};

export {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
