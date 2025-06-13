import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';
import { authMiddleware } from '../middleware/auth.js';
import * as voiceController from '../controllers/voiceController.js';

const router = express.Router();

// Process voice command
router.post(
  '/command',
  [
    authMiddleware,
    body('command').isString().notEmpty().withMessage('Command is required'),
    body('context').optional().isObject(),
    validateRequest
  ],
  voiceController.processCommand
);

// Transcribe audio
router.post(
  '/transcribe',
  [
    authMiddleware,
    body('audio').isString().notEmpty().withMessage('Audio data is required'),
    validateRequest
  ],
  voiceController.transcribeAudio
);

// Text to speech
router.post(
  '/speak',
  [
    authMiddleware,
    body('text').isString().notEmpty().withMessage('Text is required'),
    body('voice').optional().isString(),
    validateRequest
  ],
  voiceController.textToSpeech
);

export default router;