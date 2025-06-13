import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://uhnljpccbukwshvkdooj.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobmxqcGNjYnVrd3Nodmtkb29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NjgwNzgsImV4cCI6MjA2NDE0NDA3OH0.uZe7b_u7ZkrdHI6WzTQn_yiiHnWRVQnJaF_OFqDJevg";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};