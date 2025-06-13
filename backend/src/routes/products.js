import express from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';
import { authMiddleware, checkOwnership } from '../middleware/auth.js';
import * as productController from '../controllers/productController.js';

const router = express.Router();

// Get all products
router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a positive integer'),
    query('category').optional().isString(),
    query('sort').optional().isIn(['price_asc', 'price_desc', 'created_at', 'popularity']).withMessage('Invalid sort parameter'),
    validateRequest
  ],
  productController.getProducts
);

// Get product by ID
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    validateRequest
  ],
  productController.getProductById
);

// Create product
router.post(
  '/',
  [
    authMiddleware,
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('content_url').optional().isString(),
    body('preview_image').optional().isString(),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    validateRequest
  ],
  productController.createProduct
);

// Update product
router.put(
  '/:id',
  [
    authMiddleware,
    checkOwnership('ai_products'),
    param('id').isUUID().withMessage('Invalid product ID'),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('content_url').optional().isString(),
    body('preview_image').optional().isString(),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('is_active').optional().isBoolean(),
    validateRequest
  ],
  productController.updateProduct
);

// Delete product
router.delete(
  '/:id',
  [
    authMiddleware,
    checkOwnership('ai_products'),
    param('id').isUUID().withMessage('Invalid product ID'),
    validateRequest
  ],
  productController.deleteProduct
);

// Get user products
router.get(
  '/user/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    validateRequest
  ],
  productController.getUserProducts
);

// Purchase product
router.post(
  '/:id/purchase',
  [
    authMiddleware,
    param('id').isUUID().withMessage('Invalid product ID'),
    body('payment_method').isString().notEmpty().withMessage('Payment method is required'),
    validateRequest
  ],
  productController.purchaseProduct
);

// Get product purchases
router.get(
  '/:id/purchases',
  [
    authMiddleware,
    checkOwnership('ai_products'),
    param('id').isUUID().withMessage('Invalid product ID'),
    validateRequest
  ],
  productController.getProductPurchases
);

export default router;