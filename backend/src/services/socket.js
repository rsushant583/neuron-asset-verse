import { logger } from '../utils/logger.js';
import { getRedisClient } from './redis.js';

// Socket.io instance
let io;

/**
 * Initialize Socket.IO
 */
export const initializeSocketIO = (socketIO) => {
  try {
    io = socketIO;
    
    // Set up Redis adapter if available
    const redisClient = getRedisClient();
    if (redisClient && redisClient.isReady) {
      const { createAdapter } = require('@socket.io/redis-adapter');
      const pubClient = redisClient.duplicate();
      const subClient = redisClient.duplicate();
      
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('Socket.IO Redis adapter initialized');
    }
    
    // Set up authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      // Verify token (simplified for example)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = { id: decoded.sub };
        next();
      } catch (error) {
        return next(new Error('Authentication error'));
      }
    });
    
    // Handle connections
    io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}, User: ${socket.user?.id}`);
      
      // Join user room
      if (socket.user?.id) {
        socket.join(`user:${socket.user.id}`);
      }
      
      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
      
      // Handle join room
      socket.on('join-room', (room) => {
        socket.join(room);
        logger.info(`Socket ${socket.id} joined room: ${room}`);
      });
      
      // Handle leave room
      socket.on('leave-room', (room) => {
        socket.leave(room);
        logger.info(`Socket ${socket.id} left room: ${room}`);
      });
    });
    
    logger.info('Socket.IO initialized successfully');
    
    return io;
  } catch (error) {
    logger.error('Socket.IO initialization error:', error);
    throw error;
  }
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  
  return io;
};

/**
 * Emit event to a room
 */
export const emitToRoom = (room, event, data) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized, skipping emit');
      return false;
    }
    
    io.to(room).emit(event, data);
    return true;
  } catch (error) {
    logger.error('Socket.IO emit error:', error);
    return false;
  }
};

/**
 * Emit event to a user
 */
export const emitToUser = (userId, event, data) => {
  return emitToRoom(`user:${userId}`, event, data);
};

/**
 * Emit event to all connected clients
 */
export const emitToAll = (event, data) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized, skipping emit');
      return false;
    }
    
    io.emit(event, data);
    return true;
  } catch (error) {
    logger.error('Socket.IO emit error:', error);
    return false;
  }
};

export default {
  initializeSocketIO,
  getIO,
  emitToRoom,
  emitToUser,
  emitToAll
};