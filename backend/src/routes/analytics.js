import express from 'express';
import { param, query } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';
import { authMiddleware } from '../middleware/auth.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

// Get user analytics
router.get(
  '/user/:userId',
  [
    authMiddleware,
    param('userId').isUUID().withMessage('Invalid user ID'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    validateRequest
  ],
  analyticsController.getUserAnalytics
);

// Get product analytics
router.get(
  '/product/:productId',
  [
    authMiddleware,
    param('productId').isUUID().withMessage('Invalid product ID'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    validateRequest
  ],
  analyticsController.getProductAnalytics
);

// Track event
router.post(
  '/track',
  [
    authMiddleware,
    validateRequest
  ],
  analyticsController.trackEvent
);

// Get platform analytics (admin only)
router.get(
  '/platform',
  [
    authMiddleware,
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    validateRequest
  ],
  analyticsController.getPlatformAnalytics
);

export default router;