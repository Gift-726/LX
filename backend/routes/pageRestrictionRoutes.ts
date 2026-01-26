import express from 'express';
import { protect, admin } from '../middleware/auth';
import {
  getAllPageRestrictions,
  getPageRestriction,
  updatePageRestriction,
  checkPageAccess
} from '../controllers/pageRestrictionController';

const router = express.Router();

// All routes require admin authentication
router.get('/', protect, admin, getAllPageRestrictions);
router.get('/check/:pageName', protect, checkPageAccess);
router.get('/:pageName', protect, admin, getPageRestriction);
router.put('/:pageName', protect, admin, updatePageRestriction);

export default router;
