import express from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Get current user
router.get(
  '/me',
  authMiddleware,
  userController.getCurrentUser
);

// Update current user
router.put(
  '/me',
  [
    authMiddleware,
    body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('avatar_url').optional().isURL().withMessage('Avatar URL must be a valid URL'),
    body('wallet_address').optional().isString(),
    validateRequest
  ],
  userController.updateCurrentUser
);

// Get user by ID
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    validateRequest
  ],
  userController.getUserById
);

// Get user products
router.get(
  '/:id/products',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    validateRequest
  ],
  userController.getUserProducts
);

// Admin routes
router.get(
  '/',
  [
    authMiddleware,
    authorizeRoles(['admin']),
    validateRequest
  ],
  userController.getAllUsers
);

router.put(
  '/:id',
  [
    authMiddleware,
    authorizeRoles(['admin']),
    param('id').isUUID().withMessage('Invalid user ID'),
    body('role').optional().isIn(['buyer', 'creator', 'admin']).withMessage('Invalid role'),
    body('is_active').optional().isBoolean(),
    validateRequest
  ],
  userController.updateUser
);

router.delete(
  '/:id',
  [
    authMiddleware,
    authorizeRoles(['admin']),
    param('id').isUUID().withMessage('Invalid user ID'),
    validateRequest
  ],
  userController.deleteUser
);

export default router;