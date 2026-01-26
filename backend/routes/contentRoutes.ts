import express from 'express';
import {
  getHelpCenter,
  getPrivacyPolicy
} from '../controllers/contentController';

const router = express.Router();

// Public routes
router.get('/help-center', getHelpCenter);
router.get('/privacy-policy', getPrivacyPolicy);

export default router;
