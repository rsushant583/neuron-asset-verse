import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Wrapper function for messages with retry logic
export const createMessage = async (params, retries = 3) => {
  try {
    return await anthropic.messages.create(params);
  } catch (error) {
    if (retries > 0 && (error.status === 429 || error.status >= 500)) {
      // Exponential backoff
      const delay = 2 ** (3 - retries) * 1000;
      logger.warn(`Anthropic API error (${error.status}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return createMessage(params, retries - 1);
    }
    throw error;
  }
};

export { anthropic };