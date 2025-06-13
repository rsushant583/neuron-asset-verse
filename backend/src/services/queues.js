import Queue from 'bull';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
import { processContentGeneration } from '../workers/contentGenerationWorker.js';
import { processNFTMinting } from '../workers/nftMintingWorker.js';
import { processImageGeneration } from '../workers/imageGenerationWorker.js';
import { processEmailNotifications } from '../workers/emailNotificationWorker.js';

dotenv.config();

// Redis connection options
const redisOptions = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined
  }
};

// Define queues
const queues = {
  contentGeneration: new Queue('content-generation', redisOptions),
  nftMinting: new Queue('nft-minting', redisOptions),
  imageGeneration: new Queue('image-generation', redisOptions),
  emailNotifications: new Queue('email-notifications', redisOptions)
};

// Initialize queues and process jobs
export const initializeQueues = async () => {
  try {
    // Content generation queue
    queues.contentGeneration.process(async (job) => {
      try {
        logger.info(`Processing content generation job ${job.id}`);
        await processContentGeneration(job.data);
        return { success: true };
      } catch (error) {
        logger.error(`Error processing content generation job ${job.id}:`, error);
        throw error;
      }
    });
    
    // NFT minting queue
    queues.nftMinting.process(async (job) => {
      try {
        logger.info(`Processing NFT minting job ${job.id}`);
        await processNFTMinting(job.data);
        return { success: true };
      } catch (error) {
        logger.error(`Error processing NFT minting job ${job.id}:`, error);
        throw error;
      }
    });
    
    // Image generation queue
    queues.imageGeneration.process(async (job) => {
      try {
        logger.info(`Processing image generation job ${job.id}`);
        await processImageGeneration(job.data);
        return { success: true };
      } catch (error) {
        logger.error(`Error processing image generation job ${job.id}:`, error);
        throw error;
      }
    });
    
    // Email notifications queue
    queues.emailNotifications.process(async (job) => {
      try {
        logger.info(`Processing email notification job ${job.id}`);
        await processEmailNotifications(job.data);
        return { success: true };
      } catch (error) {
        logger.error(`Error processing email notification job ${job.id}:`, error);
        throw error;
      }
    });
    
    // Set up event listeners for all queues
    Object.values(queues).forEach(queue => {
      queue.on('completed', (job) => {
        logger.info(`Job ${job.id} completed successfully`);
      });
      
      queue.on('failed', (job, error) => {
        logger.error(`Job ${job.id} failed:`, error);
      });
      
      queue.on('error', (error) => {
        logger.error(`Queue error:`, error);
      });
    });
    
    logger.info('All queues initialized successfully');
  } catch (error) {
    logger.error('Error initializing queues:', error);
    throw error;
  }
};

// Add job to queue
export const addToQueue = async (queueName, data, options = {}) => {
  try {
    if (!queues[queueName]) {
      throw new Error(`Queue ${queueName} does not exist`);
    }
    
    const defaultOptions = {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: true,
      removeOnFail: false
    };
    
    const job = await queues[queueName].add(data, { ...defaultOptions, ...options });
    logger.info(`Added job ${job.id} to ${queueName} queue`);
    
    return job.id;
  } catch (error) {
    logger.error(`Error adding job to ${queueName} queue:`, error);
    throw error;
  }
};

// Get job status
export const getJobStatus = async (queueName, jobId) => {
  try {
    if (!queues[queueName]) {
      throw new Error(`Queue ${queueName} does not exist`);
    }
    
    const job = await queues[queueName].getJob(jobId);
    
    if (!job) {
      return { status: 'not_found' };
    }
    
    const state = await job.getState();
    
    return {
      id: job.id,
      status: state,
      progress: job.progress,
      data: job.data,
      result: job.returnvalue,
      error: job.failedReason,
      attempts: job.attemptsMade
    };
  } catch (error) {
    logger.error(`Error getting job status from ${queueName} queue:`, error);
    throw error;
  }
};

export default {
  queues,
  initializeQueues,
  addToQueue,
  getJobStatus
};