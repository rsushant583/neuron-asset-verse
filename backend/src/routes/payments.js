import express from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';
import { authMiddleware } from '../middleware/auth.js';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

// Create payment intent
router.post(
  '/create-intent',
  [
    authMiddleware,
    body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
    body('currency').isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
    body('productId').isUUID().withMessage('Invalid product ID'),
    validateRequest
  ],
  paymentController.createPaymentIntent
);

// Get payment status
router.get(
  '/status/:paymentId',
  [
    authMiddleware,
    param('paymentId').isString().notEmpty().withMessage('Payment ID is required'),
    validateRequest
  ],
  paymentController.getPaymentStatus
);

// Process refund
router.post(
  '/refund',
  [
    authMiddleware,
    body('paymentId').isString().notEmpty().withMessage('Payment ID is required'),
    body('amount').optional().isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
    validateRequest
  ],
  paymentController.processRefund
);

// Get user purchases
router.get(
  '/purchases',
  [
    authMiddleware,
    validateRequest
  ],
  paymentController.getUserPurchases
);

// Get purchase by ID
router.get(
  '/purchases/:purchaseId',
  [
    authMiddleware,
    param('purchaseId').isUUID().withMessage('Invalid purchase ID'),
    validateRequest
  ],
  paymentController.getPurchaseById
);

export default router;