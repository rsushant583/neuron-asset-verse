import express from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';
import { authMiddleware } from '../middleware/auth.js';
import * as draftController from '../controllers/draftController.js';

const router = express.Router();

// Get all drafts for a user
router.get(
  '/:userId',
  [
    param('userId').isString().notEmpty().withMessage('User ID is required'),
    validateRequest
  ],
  draftController.getDrafts
);

// Save a new draft
router.post(
  '/save-draft',
  [
    authMiddleware,
    body('userId').isString().notEmpty().withMessage('User ID is required'),
    body('content').isString().notEmpty().withMessage('Content is required'),
    body('title').optional().isString(),
    body('chapters').optional().isArray(),
    body('word_count').optional().isInt(),
    validateRequest
  ],
  draftController.saveDraft
);

// Delete a draft
router.delete(
  '/:draftId',
  [
    authMiddleware,
    param('draftId').isString().notEmpty().withMessage('Draft ID is required'),
    validateRequest
  ],
  draftController.deleteDraft
);

// Check if a title is unique
router.post(
  '/check-title',
  [
    body('title').isString().notEmpty().withMessage('Title is required'),
    validateRequest
  ],
  draftController.checkTitle
);

// Generate title suggestions
router.post(
  '/suggest-titles',
  [
    body('content').isString().notEmpty().withMessage('Content is required'),
    body('category').optional().isString(),
    validateRequest
  ],
  draftController.suggestTitles
);

// Analyze content structure
router.post(
  '/analyze-content',
  [
    body('content').isString().notEmpty().withMessage('Content is required'),
    validateRequest
  ],
  draftController.analyzeContent
);

export default router;