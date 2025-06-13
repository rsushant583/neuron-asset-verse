import express from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';
import { authMiddleware } from '../middleware/auth.js';
import * as blockchainController from '../controllers/blockchainController.js';

const router = express.Router();

// Create NFT mint request
router.post(
  '/mint-request',
  [
    authMiddleware,
    body('productId').isString().notEmpty().withMessage('Product ID is required'),
    body('metadata').isObject().notEmpty().withMessage('Metadata is required'),
    validateRequest
  ],
  blockchainController.createMintRequest
);

// Get mint request status
router.get(
  '/mint-request/:requestId',
  [
    authMiddleware,
    param('requestId').isString().notEmpty().withMessage('Request ID is required'),
    validateRequest
  ],
  blockchainController.getMintRequestStatus
);

// Get all mint requests for a user
router.get(
  '/mint-requests',
  [
    authMiddleware,
    validateRequest
  ],
  blockchainController.getUserMintRequests
);

// Verify NFT ownership
router.post(
  '/verify-ownership',
  [
    body('tokenId').isString().notEmpty().withMessage('Token ID is required'),
    body('address').isString().notEmpty().withMessage('Wallet address is required'),
    validateRequest
  ],
  blockchainController.verifyOwnership
);

// Get NFT metadata
router.get(
  '/metadata/:tokenId',
  [
    param('tokenId').isString().notEmpty().withMessage('Token ID is required'),
    validateRequest
  ],
  blockchainController.getNFTMetadata
);

// Get royalty information
router.get(
  '/royalties/:tokenId',
  [
    param('tokenId').isString().notEmpty().withMessage('Token ID is required'),
    validateRequest
  ],
  blockchainController.getRoyaltyInfo
);

export default router;