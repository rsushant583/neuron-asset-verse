import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase.js';
import { sendEmail } from '../services/email.js';
import { logger } from '../utils/logger.js';
import { UnauthorizedError, ValidationError } from '../middleware/errorHandler.js';

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    
    // Check if email already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    
    if (existingUserError) throw existingUserError;
    
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already in use',
        message: 'This email is already registered'
      });
    }
    
    // Check if username already exists
    const { data: existingUsername, error: existingUsernameError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();
    
    if (existingUsernameError) throw existingUsernameError;
    
    if (existingUsername) {
      return res.status(409).json({
        error: 'Username already in use',
        message: 'This username is already taken'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate verification token
    const verificationToken = uuidv4();
    
    // Create user
    const userId = uuidv4();
    const { error: createUserError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          username,
          password: hashedPassword,
          role: req.body.role || 'buyer', // Default to buyer role
          email_verified: false,
          verification_token: verificationToken,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (createUserError) throw createUserError;
    
    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Verify your MetaMind account',
      template: 'email-verification',
      context: {
        username,
        verificationUrl
      }
    });
    
    // Generate tokens
    const tokens = generateTokens(userId);
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        username,
        role: req.body.role || 'buyer'
      },
      ...tokens
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Get user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Check if email is verified
    if (!user.email_verified && process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      return res.status(403).json({
        error: 'Email not verified',
        message: 'Please verify your email before logging in'
      });
    }
    
    // Generate tokens
    const tokens = generateTokens(user.id);
    
    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);
    
    // Remove sensitive data
    delete user.password;
    delete user.verification_token;
    delete user.reset_token;
    
    return res.status(200).json({
      message: 'Login successful',
      user,
      ...tokens
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Refresh token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    
    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', decoded.sub)
      .single();
    
    if (error || !user) {
      throw new UnauthorizedError('User not found');
    }
    
    // Generate new tokens
    const tokens = generateTokens(user.id);
    
    return res.status(200).json({
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = async (req, res, next) => {
  try {
    // Client-side logout (clear tokens)
    return res.status(200).json({
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Get user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      // Don't reveal if email exists
      return res.status(200).json({
        message: 'If your email is registered, you will receive a password reset link'
      });
    }
    
    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour
    
    // Update user with reset token
    await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_expires: resetExpires.toISOString()
      })
      .eq('id', user.id);
    
    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Reset your MetaMind password',
      template: 'password-reset',
      context: {
        username: user.username,
        resetUrl
      }
    });
    
    return res.status(200).json({
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    // Get user by reset token
    const { data: user, error } = await supabase
      .from('users')
      .select('id, reset_expires')
      .eq('reset_token', token)
      .single();
    
    if (error || !user) {
      throw new ValidationError('Invalid or expired reset token');
    }
    
    // Check if token is expired
    const resetExpires = new Date(user.reset_expires);
    if (resetExpires < new Date()) {
      throw new ValidationError('Reset token has expired');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update user password
    await supabase
      .from('users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_expires: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    return res.status(200).json({
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Get user by verification token
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('verification_token', token)
      .single();
    
    if (error || !user) {
      return res.status(400).json({
        error: 'Invalid verification token',
        message: 'The verification link is invalid or has expired'
      });
    }
    
    // Update user as verified
    await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    // Redirect to frontend
    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (error) {
    logger.error('Email verification error:', error);
    next(error);
  }
};

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  // Access token (short-lived)
  const accessToken = jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
  
  // Refresh token (long-lived)
  const refreshToken = jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 3600 // 1 hour in seconds
  };
};