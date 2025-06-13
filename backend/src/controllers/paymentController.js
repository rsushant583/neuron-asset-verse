import { createPaymentIntent, retrievePaymentIntent, createRefund } from '../services/stripe.js';
import { supabase } from '../services/supabase.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

/**
 * Create payment intent
 */
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency, productId } = req.body;
    const userId = req.user.id;
    
    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('ai_products')
      .select('id, price, is_active')
      .eq('id', productId)
      .single();
    
    if (productError) {
      if (productError.code === 'PGRST116') {
        throw new NotFoundError(`Product with ID ${productId} not found`);
      }
      throw productError;
    }
    
    // Check if product is active
    if (!product.is_active) {
      return res.status(400).json({
        error: 'Product not available',
        message: 'This product is currently not available for purchase'
      });
    }
    
    // Check if user already purchased this product
    const { data: existingPurchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id')
      .eq('buyer_id', userId)
      .eq('ai_product_id', productId)
      .maybeSingle();
    
    if (purchaseError) throw purchaseError;
    
    if (existingPurchase) {
      return res.status(409).json({
        error: 'Already purchased',
        message: 'You have already purchased this product'
      });
    }
    
    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount, currency, {
      productId,
      userId
    });
    
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    });
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    next(error);
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    
    // Retrieve payment intent
    const paymentIntent = await retrievePaymentIntent(paymentId);
    
    return res.status(200).json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    });
  } catch (error) {
    logger.error('Error getting payment status:', error);
    next(error);
  }
};

/**
 * Process refund
 */
export const processRefund = async (req, res, next) => {
  try {
    const { paymentId, amount } = req.body;
    const userId = req.user.id;
    
    // Check if user is admin or the buyer
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id, buyer_id, payment_id, price, refunded')
      .eq('payment_id', paymentId)
      .single();
    
    if (purchaseError) {
      if (purchaseError.code === 'PGRST116') {
        throw new NotFoundError(`Purchase with payment ID ${paymentId} not found`);
      }
      throw purchaseError;
    }
    
    // Check if user has permission
    if (purchase.buyer_id !== userId && req.user.role !== 'admin') {
      throw new ForbiddenError('You do not have permission to refund this purchase');
    }
    
    // Check if already refunded
    if (purchase.refunded) {
      return res.status(400).json({
        error: 'Already refunded',
        message: 'This purchase has already been refunded'
      });
    }
    
    // Process refund
    const refund = await createRefund(paymentId, amount);
    
    // Update purchase
    await supabase
      .from('purchases')
      .update({
        refunded: true,
        refund_amount: amount ? amount / 100 : purchase.price, // Convert from cents if specified
        refund_id: refund.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchase.id);
    
    return res.status(200).json({
      message: 'Refund processed successfully',
      refundId: refund.id,
      amount: refund.amount / 100 // Convert from cents
    });
  } catch (error) {
    logger.error('Error processing refund:', error);
    next(error);
  }
};

/**
 * Get user purchases
 */
export const getUserPurchases = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        ai_products (
          id,
          title,
          description,
          preview_image,
          content_url,
          users (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching user purchases:', error);
    next(error);
  }
};

/**
 * Get purchase by ID
 */
export const getPurchaseById = async (req, res, next) => {
  try {
    const { purchaseId } = req.params;
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        ai_products (
          id,
          title,
          description,
          preview_image,
          content_url,
          user_id,
          users (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('id', purchaseId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`Purchase with ID ${purchaseId} not found`);
      }
      throw error;
    }
    
    // Check if user has permission
    if (data.buyer_id !== userId && data.ai_products.user_id !== userId && req.user.role !== 'admin') {
      throw new ForbiddenError('You do not have permission to view this purchase');
    }
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching purchase:', error);
    next(error);
  }
};