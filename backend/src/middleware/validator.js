import { validationResult } from 'express-validator';
import { ValidationError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Validate request middleware
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation error:', errors.array());
    
    throw new ValidationError('Validation failed', errors.array().map(error => ({
      field: error.path,
      message: error.msg
    })));
  }
  
  next();
};