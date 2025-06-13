import jwt from 'jsonwebtoken';
import { supabase } from '../services/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication middleware
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No valid authentication token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.sub)
        .single();
      
      if (error || !user) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'User not found'
        });
      }
      
      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      // Handle JWT verification errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Authentication expired',
          message: 'Token has expired'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Authentication invalid',
          message: 'Invalid token'
        });
      } else {
        logger.error('JWT verification error:', error);
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Token verification failed'
        });
      }
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred during authentication'
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Authorization failed',
        message: 'You do not have permission to access this resource'
      });
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
        return res.status(401).json({
          error: 'Authentication required',
          message: 'You must be logged in to access this resource'
        });
      }
      
      const resourceId = req.params.id;
      
      if (!resourceId) {
        return res.status(400).json({
          error: 'Resource ID required',
          message: 'Resource ID is missing from the request'
        });
      }
      
      // Get resource from database
      const { data: resource, error } = await supabase
        .from(resourceType)
        .select('user_id')
        .eq('id', resourceId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Resource not found',
            message: `${resourceType} with ID ${resourceId} not found`
          });
        }
        throw error;
      }
      
      // Check if user owns the resource or is an admin
      if (resource.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Authorization failed',
          message: 'You do not have permission to access this resource'
        });
      }
      
      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      return res.status(500).json({
        error: 'Server error',
        message: 'An unexpected error occurred during authorization'
      });
    }
  };
};