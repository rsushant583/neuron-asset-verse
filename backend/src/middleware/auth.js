import jwt from 'jsonwebtoken';
import { supabase } from '../services/supabase.js';
import { logger } from '../utils/logger.js';
import { UnauthorizedError, ForbiddenError } from './errorHandler.js';

/**
 * Authentication middleware
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No valid authentication token provided');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key_for_development');
      
      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.sub)
        .single();
      
      if (error || !user) {
        throw new UnauthorizedError('User not found');
      }
      
      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      // Handle JWT verification errors
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid token');
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware
 */
export const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('You must be logged in to access this resource');
    }
    
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }
    
    next();
  };
};

/**
 * Resource ownership middleware
 */
export const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('You must be logged in to access this resource');
      }
      
      const resourceId = req.params.id;
      
      if (!resourceId) {
        throw new ValidationError('Resource ID is missing from the request');
      }
      
      // Get resource from database
      const { data: resource, error } = await supabase
        .from(resourceType)
        .select('user_id')
        .eq('id', resourceId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError(`${resourceType} with ID ${resourceId} not found`);
        }
        throw error;
      }
      
      // Check if user owns the resource or is an admin
      if (resource.user_id !== req.user.id && req.user.role !== 'admin') {
        throw new ForbiddenError('You do not have permission to access this resource');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};