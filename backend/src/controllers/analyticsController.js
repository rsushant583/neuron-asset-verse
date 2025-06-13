import { supabase } from '../services/supabase.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { ForbiddenError } from '../middleware/errorHandler.js';

/**
 * Get user analytics
 */
export const getUserAnalytics = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Verify user has access to these analytics
    if (req.user.id !== userId && req.user.role !== 'admin') {
      throw new ForbiddenError('You do not have permission to access these analytics');
    }
    
    // Build date filters
    let dateFilter = '';
    const params = {};
    
    if (startDate && endDate) {
      dateFilter = 'AND created_at >= :startDate AND created_at <= :endDate';
      params.startDate = startDate;
      params.endDate = endDate;
    } else if (startDate) {
      dateFilter = 'AND created_at >= :startDate';
      params.startDate = startDate;
    } else if (endDate) {
      dateFilter = 'AND created_at <= :endDate';
      params.endDate = endDate;
    }
    
    // Get sales data
    const salesQuery = `
      SELECT 
        DATE_TRUNC('day', created_at) AS date,
        COUNT(*) AS count,
        SUM(price) AS revenue
      FROM purchases
      WHERE ai_products.user_id = :userId ${dateFilter}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `;
    
    const { data: sales, error: salesError } = await supabase.rpc('run_sql', {
      sql: salesQuery,
      params: { userId, ...params }
    });
    
    if (salesError) throw salesError;
    
    // Get product views
    const viewsQuery = `
      SELECT 
        ai_product_id,
        COUNT(*) AS views
      FROM analytics
      WHERE user_id = :userId AND event_type = 'view' ${dateFilter}
      GROUP BY ai_product_id
      ORDER BY views DESC
    `;
    
    const { data: views, error: viewsError } = await supabase.rpc('run_sql', {
      sql: viewsQuery,
      params: { userId, ...params }
    });
    
    if (viewsError) throw viewsError;
    
    // Get top products
    const { data: products, error: productsError } = await supabase
      .from('ai_products')
      .select(`
        id,
        title,
        price,
        created_at,
        purchases (count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (productsError) throw productsError;
    
    // Calculate total earnings
    const { data: earnings, error: earningsError } = await supabase
      .from('purchases')
      .select('price')
      .eq('ai_products.user_id', userId)
      .sum('price');
    
    if (earningsError) throw earningsError;
    
    // Calculate total sales
    const { count: totalSales, error: salesCountError } = await supabase
      .from('purchases')
      .select('id', { count: 'exact', head: true })
      .eq('ai_products.user_id', userId);
    
    if (salesCountError) throw salesCountError;
    
    return res.status(200).json({
      sales: sales || [],
      views: views || [],
      products: products || [],
      totalEarnings: earnings?.[0]?.sum || 0,
      totalSales: totalSales || 0
    });
  } catch (error) {
    logger.error('Error fetching user analytics:', error);
    next(error);
  }
};

/**
 * Get product analytics
 */
export const getProductAnalytics = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Get product to verify ownership
    const { data: product, error: productError } = await supabase
      .from('ai_products')
      .select('user_id')
      .eq('id', productId)
      .single();
    
    if (productError) {
      if (productError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Product not found' });
      }
      throw productError;
    }
    
    // Verify user has access to these analytics
    if (product.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('You do not have permission to access these analytics');
    }
    
    // Build date filters
    let dateFilter = '';
    const params = {};
    
    if (startDate && endDate) {
      dateFilter = 'AND created_at >= :startDate AND created_at <= :endDate';
      params.startDate = startDate;
      params.endDate = endDate;
    } else if (startDate) {
      dateFilter = 'AND created_at >= :startDate';
      params.startDate = startDate;
    } else if (endDate) {
      dateFilter = 'AND created_at <= :endDate';
      params.endDate = endDate;
    }
    
    // Get views data
    const viewsQuery = `
      SELECT 
        DATE_TRUNC('day', created_at) AS date,
        COUNT(*) AS count
      FROM analytics
      WHERE ai_product_id = :productId AND event_type = 'view' ${dateFilter}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `;
    
    const { data: views, error: viewsError } = await supabase.rpc('run_sql', {
      sql: viewsQuery,
      params: { productId, ...params }
    });
    
    if (viewsError) throw viewsError;
    
    // Get sales data
    const salesQuery = `
      SELECT 
        DATE_TRUNC('day', created_at) AS date,
        COUNT(*) AS count,
        SUM(price) AS revenue
      FROM purchases
      WHERE ai_product_id = :productId ${dateFilter}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `;
    
    const { data: sales, error: salesError } = await supabase.rpc('run_sql', {
      sql: salesQuery,
      params: { productId, ...params }
    });
    
    if (salesError) throw salesError;
    
    // Get total views
    const { count: totalViews, error: viewsCountError } = await supabase
      .from('analytics')
      .select('id', { count: 'exact', head: true })
      .eq('ai_product_id', productId)
      .eq('event_type', 'view');
    
    if (viewsCountError) throw viewsCountError;
    
    // Get total sales
    const { count: totalSales, error: salesCountError } = await supabase
      .from('purchases')
      .select('id', { count: 'exact', head: true })
      .eq('ai_product_id', productId);
    
    if (salesCountError) throw salesCountError;
    
    // Get total revenue
    const { data: revenue, error: revenueError } = await supabase
      .from('purchases')
      .select('price')
      .eq('ai_product_id', productId)
      .sum('price');
    
    if (revenueError) throw revenueError;
    
    return res.status(200).json({
      views: views || [],
      sales: sales || [],
      totalViews: totalViews || 0,
      totalSales: totalSales || 0,
      totalRevenue: revenue?.[0]?.sum || 0
    });
  } catch (error) {
    logger.error('Error fetching product analytics:', error);
    next(error);
  }
};

/**
 * Track event
 */
export const trackEvent = async (req, res, next) => {
  try {
    const { productId, eventType, eventData } = req.body;
    const userId = req.user.id;
    
    // Create analytics event
    const { data, error } = await supabase
      .from('analytics')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          ai_product_id: productId,
          event_type: eventType,
          event_data: eventData || {},
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) throw error;
    
    return res.status(201).json({
      message: 'Event tracked successfully'
    });
  } catch (error) {
    logger.error('Error tracking event:', error);
    next(error);
  }
};

/**
 * Get platform analytics (admin only)
 */
export const getPlatformAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Verify user is admin
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('You do not have permission to access platform analytics');
    }
    
    // Build date filters
    let dateFilter = '';
    const params = {};
    
    if (startDate && endDate) {
      dateFilter = 'AND created_at >= :startDate AND created_at <= :endDate';
      params.startDate = startDate;
      params.endDate = endDate;
    } else if (startDate) {
      dateFilter = 'AND created_at >= :startDate';
      params.startDate = startDate;
    } else if (endDate) {
      dateFilter = 'AND created_at <= :endDate';
      params.endDate = endDate;
    }
    
    // Get user signups
    const signupsQuery = `
      SELECT 
        DATE_TRUNC('day', created_at) AS date,
        COUNT(*) AS count
      FROM users
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `;
    
    const { data: signups, error: signupsError } = await supabase.rpc('run_sql', {
      sql: signupsQuery,
      params
    });
    
    if (signupsError) throw signupsError;
    
    // Get product creations
    const productsQuery = `
      SELECT 
        DATE_TRUNC('day', created_at) AS date,
        COUNT(*) AS count
      FROM ai_products
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `;
    
    const { data: products, error: productsError } = await supabase.rpc('run_sql', {
      sql: productsQuery,
      params
    });
    
    if (productsError) throw productsError;
    
    // Get sales
    const salesQuery = `
      SELECT 
        DATE_TRUNC('day', created_at) AS date,
        COUNT(*) AS count,
        SUM(price) AS revenue
      FROM purchases
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `;
    
    const { data: sales, error: salesError } = await supabase.rpc('run_sql', {
      sql: salesQuery,
      params
    });
    
    if (salesError) throw salesError;
    
    // Get total users
    const { count: totalUsers, error: usersCountError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });
    
    if (usersCountError) throw usersCountError;
    
    // Get total products
    const { count: totalProducts, error: productsCountError } = await supabase
      .from('ai_products')
      .select('id', { count: 'exact', head: true });
    
    if (productsCountError) throw productsCountError;
    
    // Get total sales
    const { count: totalSales, error: salesCountError } = await supabase
      .from('purchases')
      .select('id', { count: 'exact', head: true });
    
    if (salesCountError) throw salesCountError;
    
    // Get total revenue
    const { data: revenue, error: revenueError } = await supabase
      .from('purchases')
      .select('price')
      .sum('price');
    
    if (revenueError) throw revenueError;
    
    return res.status(200).json({
      signups: signups || [],
      products: products || [],
      sales: sales || [],
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      totalSales: totalSales || 0,
      totalRevenue: revenue?.[0]?.sum || 0
    });
  } catch (error) {
    logger.error('Error fetching platform analytics:', error);
    next(error);
  }
};