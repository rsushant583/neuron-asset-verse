import { supabase } from '../services/supabase.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { createPaymentIntent } from '../services/stripe.js';
import { addToQueue } from '../services/queues.js';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

/**
 * Get all products
 */
export const getProducts = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, category, sort } = req.query;
    
    // Build query
    let query = supabase
      .from('ai_products')
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        )
      `)
      .eq('is_active', true)
      .range(offset, offset + limit - 1);
    
    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }
    
    // Apply sorting
    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'popularity') {
      // For popularity, we would ideally join with analytics or purchases
      // For now, we'll just sort by created_at as a placeholder
      query = query.order('created_at', { ascending: false });
    } else {
      // Default sort by created_at
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('ai_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (countError) throw countError;
    
    return res.status(200).json({
      products: data,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logger.error('Error fetching products:', error);
    next(error);
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('ai_products')
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`Product with ID ${id} not found`);
      }
      throw error;
    }
    
    // Track view in analytics
    if (req.user) {
      await supabase
        .from('analytics')
        .insert([
          {
            id: uuidv4(),
            user_id: req.user.id,
            ai_product_id: id,
            event_type: 'view',
            event_data: {
              timestamp: new Date().toISOString(),
              ip: req.ip
            }
          }
        ]);
    }
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching product:', error);
    next(error);
  }
};

/**
 * Create product
 */
export const createProduct = async (req, res, next) => {
  try {
    const { title, description, content_url, preview_image, price } = req.body;
    const userId = req.user.id;
    
    // Create product
    const productId = uuidv4();
    const { data, error } = await supabase
      .from('ai_products')
      .insert([
        {
          id: productId,
          user_id: userId,
          title,
          description,
          content_url,
          preview_image,
          price,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    // Track creation in analytics
    await supabase
      .from('analytics')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          ai_product_id: productId,
          event_type: 'create',
          event_data: {
            timestamp: new Date().toISOString()
          }
        }
      ]);
    
    // Send email notification
    await addToQueue('emailNotifications', {
      type: 'product_created',
      userId,
      productId,
      productTitle: title
    });
    
    return res.status(201).json(data);
  } catch (error) {
    logger.error('Error creating product:', error);
    next(error);
  }
};

/**
 * Update product
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, content_url, preview_image, price, is_active } = req.body;
    const userId = req.user.id;
    
    // Check if product exists and belongs to user
    const { data: product, error: fetchError } = await supabase
      .from('ai_products')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError(`Product with ID ${id} not found`);
      }
      throw fetchError;
    }
    
    if (product.user_id !== userId && req.user.role !== 'admin') {
      throw new ForbiddenError('You do not have permission to update this product');
    }
    
    // Update product
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (content_url !== undefined) updates.content_url = content_url;
    if (preview_image !== undefined) updates.preview_image = preview_image;
    if (price !== undefined) updates.price = price;
    if (is_active !== undefined) updates.is_active = is_active;
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('ai_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error updating product:', error);
    next(error);
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if product exists and belongs to user
    const { data: product, error: fetchError } = await supabase
      .from('ai_products')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError(`Product with ID ${id} not found`);
      }
      throw fetchError;
    }
    
    if (product.user_id !== userId && req.user.role !== 'admin') {
      throw new ForbiddenError('You do not have permission to delete this product');
    }
    
    // Delete product
    const { error } = await supabase
      .from('ai_products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return res.status(200).json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting product:', error);
    next(error);
  }
};

/**
 * Get user products
 */
export const getUserProducts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const { data, error, count } = await supabase
      .from('ai_products')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
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
 * Purchase product
 */
export const purchaseProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;
    const userId = req.user.id;
    
    // Check if product exists
    const { data: product, error: fetchError } = await supabase
      .from('ai_products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError(`Product with ID ${id} not found`);
      }
      throw fetchError;
    }
    
    // Check if user already purchased this product
    const { data: existingPurchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id')
      .eq('buyer_id', userId)
      .eq('ai_product_id', id)
      .maybeSingle();
    
    if (purchaseError) throw purchaseError;
    
    if (existingPurchase) {
      return res.status(409).json({
        error: 'Already purchased',
        message: 'You have already purchased this product'
      });
    }
    
    // Process payment
    let paymentId;
    
    if (payment_method === 'stripe') {
      // Create Stripe payment intent
      const paymentIntent = await createPaymentIntent(product.price * 100, 'usd', {
        productId: id,
        userId
      });
      
      paymentId = paymentIntent.id;
      
      // Return client secret for frontend to complete payment
      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentId
      });
    } else if (payment_method === 'crypto') {
      // For crypto payments, we would generate a payment address and amount
      // This is a placeholder for actual crypto payment integration
      paymentId = `crypto_${uuidv4()}`;
      
      return res.status(200).json({
        paymentAddress: '0x1234567890abcdef1234567890abcdef12345678',
        amount: product.price,
        currency: 'USDC',
        paymentId
      });
    } else {
      // For demo/test purposes, create a direct purchase
      paymentId = `demo_${uuidv4()}`;
      
      // Create purchase record
      const { data: purchase, error: createError } = await supabase
        .from('purchases')
        .insert([
          {
            id: uuidv4(),
            buyer_id: userId,
            ai_product_id: id,
            price: product.price,
            payment_id: paymentId,
            payment_method: 'demo',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Track purchase in analytics
      await supabase
        .from('analytics')
        .insert([
          {
            id: uuidv4(),
            user_id: userId,
            ai_product_id: id,
            event_type: 'purchase',
            event_data: {
              price: product.price,
              payment_method: 'demo',
              timestamp: new Date().toISOString()
            }
          }
        ]);
      
      // Send email notifications
      await addToQueue('emailNotifications', {
        type: 'purchase_confirmation',
        userId,
        productId: id,
        productTitle: product.title,
        price: product.price
      });
      
      await addToQueue('emailNotifications', {
        type: 'sale_notification',
        userId: product.user_id,
        buyerId: userId,
        productId: id,
        productTitle: product.title,
        price: product.price
      });
      
      return res.status(200).json({
        message: 'Purchase successful',
        purchase
      });
    }
  } catch (error) {
    logger.error('Error purchasing product:', error);
    next(error);
  }
};

/**
 * Get product purchases
 */
export const getProductPurchases = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const { data, error, count } = await supabase
      .from('purchases')
      .select(`
        *,
        users:buyer_id (
          id,
          username,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('ai_product_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return res.status(200).json({
      purchases: data,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logger.error('Error fetching product purchases:', error);
    next(error);
  }
};