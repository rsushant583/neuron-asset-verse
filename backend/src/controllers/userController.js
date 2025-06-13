import { supabase } from '../services/supabase.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

/**
 * Get current user
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // User is already attached to request by auth middleware
    const user = req.user;
    
    // Remove sensitive data
    delete user.password;
    delete user.verification_token;
    delete user.reset_token;
    delete user.reset_expires;
    
    return res.status(200).json(user);
  } catch (error) {
    logger.error('Error fetching current user:', error);
    next(error);
  }
};

/**
 * Update current user
 */
export const updateCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, avatar_url, wallet_address } = req.body;
    
    // Check if username is taken (if changing)
    if (username && username !== req.user.username) {
      const { data: existingUser, error: usernameError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', userId)
        .maybeSingle();
      
      if (usernameError) throw usernameError;
      
      if (existingUser) {
        return res.status(409).json({
          error: 'Username already taken',
          message: 'This username is already in use by another account'
        });
      }
    }
    
    // Update user
    const updates = {};
    if (username) updates.username = username;
    if (avatar_url) updates.avatar_url = avatar_url;
    if (wallet_address) updates.wallet_address = wallet_address;
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Remove sensitive data
    delete data.password;
    delete data.verification_token;
    delete data.reset_token;
    delete data.reset_expires;
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error updating current user:', error);
    next(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('users')
      .select('id, username, avatar_url, role, created_at')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`User with ID ${id} not found`);
      }
      throw error;
    }
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching user:', error);
    next(error);
  }
};

/**
 * Get user products
 */
export const getUserProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();
    
    if (userError) {
      if (userError.code === 'PGRST116') {
        throw new NotFoundError(`User with ID ${id} not found`);
      }
      throw userError;
    }
    
    // Get user products
    const { data, error, count } = await supabase
      .from('ai_products')
      .select('*', { count: 'exact' })
      .eq('user_id', id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return res.status(200).json({
      products: data,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logger.error('Error fetching user products:', error);
    next(error);
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, role, search } = req.query;
    
    // Build query
    let query = supabase
      .from('users')
      .select('id, username, email, avatar_url, role, created_at, last_login', { count: 'exact' });
    
    // Apply role filter
    if (role) {
      query = query.eq('role', role);
    }
    
    // Apply search filter
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return res.status(200).json({
      users: data,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logger.error('Error fetching all users:', error);
    next(error);
  }
};

/**
 * Update user (admin only)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();
    
    if (userError) {
      if (userError.code === 'PGRST116') {
        throw new NotFoundError(`User with ID ${id} not found`);
      }
      throw userError;
    }
    
    // Update user
    const updates = {};
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, username, email, avatar_url, role, is_active, created_at, updated_at')
      .single();
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error updating user:', error);
    next(error);
  }
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();
    
    if (userError) {
      if (userError.code === 'PGRST116') {
        throw new NotFoundError(`User with ID ${id} not found`);
      }
      throw userError;
    }
    
    // Prevent deleting self
    if (id === req.user.id) {
      throw new ForbiddenError('You cannot delete your own account');
    }
    
    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    next(error);
  }
};