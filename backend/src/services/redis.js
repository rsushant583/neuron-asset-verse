import { createClient } from 'redis';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

// Redis client
let redisClient;

/**
 * Initialize Redis connection
 */
export const initializeRedis = async () => {
  try {
    // Create Redis client
    redisClient = createClient({
      url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      password: process.env.REDIS_PASSWORD,
      socket: {
        tls: process.env.REDIS_TLS === 'true',
        rejectUnauthorized: false
      }
    });
    
    // Set up event handlers
    redisClient.on('error', (error) => {
      logger.error('Redis error:', error);
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });
    
    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting');
    });
    
    // Connect to Redis
    await redisClient.connect();
    
    logger.info('Redis initialized successfully');
    
    return true;
  } catch (error) {
    logger.error('Redis initialization error:', error);
    
    // If Redis is not available, we can still function without it
    logger.warn('Continuing without Redis');
    
    return false;
  }
};

/**
 * Get Redis client
 */
export const getRedisClient = () => {
  return redisClient;
};

/**
 * Set cache value
 */
export const setCache = async (key, value, expireSeconds = 3600) => {
  try {
    if (!redisClient || !redisClient.isReady) {
      return false;
    }
    
    await redisClient.set(key, JSON.stringify(value), {
      EX: expireSeconds
    });
    
    return true;
  } catch (error) {
    logger.error('Redis set cache error:', error);
    return false;
  }
};

/**
 * Get cache value
 */
export const getCache = async (key) => {
  try {
    if (!redisClient || !redisClient.isReady) {
      return null;
    }
    
    const value = await redisClient.get(key);
    
    if (!value) {
      return null;
    }
    
    return JSON.parse(value);
  } catch (error) {
    logger.error('Redis get cache error:', error);
    return null;
  }
};

/**
 * Delete cache value
 */
export const deleteCache = async (key) => {
  try {
    if (!redisClient || !redisClient.isReady) {
      return false;
    }
    
    await redisClient.del(key);
    
    return true;
  } catch (error) {
    logger.error('Redis delete cache error:', error);
    return false;
  }
};

/**
 * Clear cache by pattern
 */
export const clearCacheByPattern = async (pattern) => {
  try {
    if (!redisClient || !redisClient.isReady) {
      return false;
    }
    
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    
    return true;
  } catch (error) {
    logger.error('Redis clear cache error:', error);
    return false;
  }
};

export default {
  initializeRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  clearCacheByPattern
};