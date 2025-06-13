import OpenAI from 'openai';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Wrapper function for chat completions with retry logic
export const createChatCompletion = async (params, retries = 3) => {
  try {
    return await openai.chat.completions.create(params);
  } catch (error) {
    if (retries > 0 && (error.status === 429 || error.status >= 500)) {
      // Exponential backoff
      const delay = 2 ** (3 - retries) * 1000;
      logger.warn(`OpenAI API error (${error.status}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return createChatCompletion(params, retries - 1);
    }
    throw error;
  }
};

// Wrapper function for image generation with retry logic
export const createImage = async (params, retries = 3) => {
  try {
    return await openai.images.generate(params);
  } catch (error) {
    if (retries > 0 && (error.status === 429 || error.status >= 500)) {
      // Exponential backoff
      const delay = 2 ** (3 - retries) * 1000;
      logger.warn(`OpenAI API error (${error.status}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return createImage(params, retries - 1);
    }
    throw error;
  }
};

// Wrapper function for audio transcription with retry logic
export const createTranscription = async (params, retries = 3) => {
  try {
    return await openai.audio.transcriptions.create(params);
  } catch (error) {
    if (retries > 0 && (error.status === 429 || error.status >= 500)) {
      // Exponential backoff
      const delay = 2 ** (3 - retries) * 1000;
      logger.warn(`OpenAI API error (${error.status}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return createTranscription(params, retries - 1);
    }
    throw error;
  }
};

export { openai };