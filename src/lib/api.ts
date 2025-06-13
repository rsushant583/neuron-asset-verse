import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  async (config) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized access
      supabase.auth.signOut();
      window.location.href = '/auth';
    }
    
    // Return a fallback response for offline scenarios
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return Promise.resolve({
        data: {
          error: 'Network error - using offline mode',
          offline: true
        }
      });
    }
    
    return Promise.reject(error);
  }
);

// Authentication APIs
export const checkTitle = async (title: string) => {
  try {
    const { data, error } = await supabase
      .from('ai_products')
      .select('title')
      .ilike('title', title)
      .limit(1);
      
    if (error) throw error;
    
    return {
      isUnique: data.length === 0,
      suggested: data.length > 0 ? `${title} - Revised Edition` : null
    };
  } catch (error) {
    console.error('Title check error:', error);
    return { isUnique: true };
  }
};

export const suggestTitles = async (content: string, category?: string) => {
  try {
    // This would normally call the AI service
    // For now, return mock suggestions based on category
    const mockSuggestions = {
      medical: [
        'Healing Wisdom: A Medical Professional\'s Journey',
        'Life Lessons from the Clinic',
        'The Art of Caring: Medical Insights'
      ],
      business: [
        'Entrepreneurial Wisdom: Lessons Learned',
        'Building Success: A Business Journey',
        'The Path to Leadership'
      ],
      personal: [
        'Life Lessons Shared',
        'Wisdom from Experience',
        'My Journey: Stories and Insights'
      ]
    };
    
    return mockSuggestions[category as keyof typeof mockSuggestions] || mockSuggestions.personal;
  } catch (error) {
    console.error('Error generating title suggestions:', error);
    return ['My Knowledge Journey', 'Insights and Wisdom', 'Lessons Learned'];
  }
};

export const analyzeContent = async (content: string) => {
  try {
    // This would normally call the AI service
    // For now, return a mock analysis
    return {
      chapters: ['Introduction', 'Key Insights', 'Practical Applications', 'Conclusion'],
      structure: {
        introduction: content.substring(0, 200),
        body: content.substring(200, content.length - 200),
        conclusion: content.substring(content.length - 200)
      },
      word_count: content.split(/\s+/).filter(word => word.length > 0).length,
      estimated_reading_time: Math.ceil(content.split(/\s+/).length / 200) // 200 WPM
    };
  } catch (error) {
    console.error('Error analyzing content:', error);
    return {
      chapters: ['Introduction', 'Main Content', 'Conclusion'],
      structure: { introduction: '', body: content, conclusion: '' }
    };
  }
};

export const saveDraft = async (userId: string, draftData: any) => {
  try {
    // Get next version number
    const { data: drafts, error: fetchError } = await supabase
      .from('drafts')
      .select('version')
      .eq('user_id', userId)
      .order('version', { ascending: false })
      .limit(1);
      
    if (fetchError) throw fetchError;
    
    const nextVersion = drafts.length > 0 ? drafts[0].version + 1 : 1;
    
    // Create new draft
    const { data, error } = await supabase
      .from('drafts')
      .insert([{
        user_id: userId,
        version: nextVersion,
        content: draftData.content,
        title: draftData.title || null,
        chapters: draftData.chapters || [],
        word_count: draftData.word_count || draftData.content.split(/\s+/).filter(word => word.length > 0).length
      }])
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

export const getDrafts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return [];
  }
};

export const deleteDraft = async (draftId: string) => {
  try {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', draftId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};

export default api;