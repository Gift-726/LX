import express from 'express';
import { protect } from '../middleware/auth';
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/addressController';

const router = express.Router();

// All routes require authentication
router.get('/', protect, getAddresses);
router.get('/:id', protect, getAddressById);
router.post('/', protect, createAddress);
router.put('/:id', protect, updateAddress);
router.put('/:id/default', protect, setDefaultAddress);
router.delete('/:id', protect, deleteAddress);

export default router;
