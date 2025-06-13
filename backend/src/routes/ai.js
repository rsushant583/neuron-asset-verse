import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';
import { authMiddleware } from '../middleware/auth.js';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

// Generate content from a prompt
router.post(
  '/generate',
  [
    authMiddleware,
    body('prompt').isString().notEmpty().withMessage('Prompt is required'),
    body('category').optional().isString(),
    body('format').optional().isString(),
    body('length').optional().isInt({ min: 100, max: 10000 }),
    validateRequest
  ],
  aiController.generateContent
);

// Generate draft from story
router.post(
  '/draft',
  [
    authMiddleware,
    body('story').isString().notEmpty().withMessage('Story content is required'),
    body('category').optional().isString(),
    body('style').optional().isString(),
    validateRequest
  ],
  aiController.generateDraft
);

// Enhance content
router.post(
  '/enhance',
  [
    authMiddleware,
    body('content').isString().notEmpty().withMessage('Content is required'),
    body('enhancementType').isString().notEmpty().withMessage('Enhancement type is required'),
    validateRequest
  ],
  aiController.enhanceContent
);

// Generate image for product
router.post(
  '/generate-image',
  [
    authMiddleware,
    body('prompt').isString().notEmpty().withMessage('Prompt is required'),
    body('style').optional().isString(),
    body('size').optional().isString(),
    validateRequest
  ],
  aiController.generateImage
);

// Transcribe audio to text
router.post(
  '/transcribe',
  [
    authMiddleware,
    body('audioUrl').isString().notEmpty().withMessage('Audio URL is required'),
    validateRequest
  ],
  aiController.transcribeAudio
);

// Process voice command
router.post(
  '/voice-command',
  [
    authMiddleware,
    body('command').isString().notEmpty().withMessage('Command is required'),
    body('context').optional().isObject(),
    validateRequest
  ],
  aiController.processVoiceCommand
);

export default router;