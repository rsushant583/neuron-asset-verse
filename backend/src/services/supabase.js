import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase credentials. Please check your environment variables.');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      logger.error('Supabase connection test failed:', error);
      return false;
    }
    
    logger.info('Supabase connection test successful');
    return true;
  } catch (error) {
    logger.error('Supabase connection test failed:', error);
    return false;
  }
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  if (error.code === 'PGRST116') {
    return { status: 404, message: 'Resource not found' };
  } else if (error.code === '23505') {
    return { status: 409, message: 'Duplicate resource' };
  } else if (error.code === '23503') {
    return { status: 400, message: 'Foreign key violation' };
  } else if (error.code === '42P01') {
    return { status: 500, message: 'Table does not exist' };
  } else {
    logger.error('Supabase error:', error);
    return { status: 500, message: 'Database error' };
  }
};

export default {
  supabase,
  testConnection,
  handleSupabaseError
};