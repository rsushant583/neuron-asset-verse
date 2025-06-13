import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import aiRoutes from './routes/ai.js';
import blockchainRoutes from './routes/blockchain.js';
import draftRoutes from './routes/drafts.js';
import paymentRoutes from './routes/payments.js';
import analyticsRoutes from './routes/analytics.js';
import voiceRoutes from './routes/voice.js';
import webhookRoutes from './routes/webhooks.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { logger } from './utils/logger.js';
import { initializeDatabase } from './database/connection.js';
import { initializeRedis } from './services/redis.js';
import { initializeQueues } from './services/queues.js';
import { initializeSocketIO } from './services/socket.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "https:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://metamind.app",
    "https://www.metamind.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/blockchain', authMiddleware, blockchainRoutes);
app.use('/api/drafts', authMiddleware, draftRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/voice', authMiddleware, voiceRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', notFoundHandler);

// Initialize services
async function initializeServices() {
  try {
    await initializeDatabase();
    
    // Only initialize Redis if configured
    if (process.env.REDIS_HOST) {
      await initializeRedis();
      await initializeQueues();
    } else {
      logger.warn('Redis not configured, skipping Redis initialization');
    }
    
    initializeSocketIO(io);
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    server.listen(PORT, () => {
      logger.info(`MetaMind backend server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

startServer();

export default server;