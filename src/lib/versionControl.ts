
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com' 
    : 'http://localhost:8000',
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface DraftData {
  content: string;
  title?: string;
  chapters?: string[];
  word_count?: number;
}

interface Draft {
  id: string;
  version: number;
  content: string;
  title?: string;
  created_at: string;
  chapters?: string[];
  word_count?: number;
}

// Save a new draft version
export const saveDraft = async (userId: string, draftData: DraftData): Promise<Draft> => {
  try {
    const response = await api.post('/api/save-draft', {
      userId,
      ...draftData
    });
    return response.data;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw new Error('Failed to save draft');
  }
};

// Get all drafts for a user
export const getDrafts = async (userId: string): Promise<Draft[]> => {
  try {
    const response = await api.get(`/api/drafts/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching drafts:', error);
    throw new Error('Failed to fetch drafts');
  }
};

// Delete a specific draft
export const deleteDraft = async (draftId: string): Promise<void> => {
  try {
    await api.delete(`/api/drafts/${draftId}`);
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw new Error('Failed to delete draft');
  }
};

// Check if a title is unique and suggest alternatives
export const checkTitle = async (title: string): Promise<{isUnique: boolean, suggested?: string}> => {
  try {
    const response = await api.post('/api/check-title', { title });
    return response.data;
  } catch (error) {
    console.error('Error checking title:', error);
    return { isUnique: true }; // Fallback to allow the title
  }
};

// Generate unique title suggestions based on content and category
export const suggestTitles = async (content: string, category?: string): Promise<string[]> => {
  try {
    const response = await api.post('/api/suggest-titles', { content, category });
    return response.data.suggestions || [];
  } catch (error) {
    console.error('Error generating title suggestions:', error);
    // Fallback suggestions based on category
    const fallbackTitles = {
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
    
    return fallbackTitles[category as keyof typeof fallbackTitles] || fallbackTitles.personal;
  }
};

// Analyze content and structure it into chapters
export const analyzeContent = async (content: string): Promise<{chapters: string[], structure: any}> => {
  try {
    const response = await api.post('/api/analyze-content', { content });
    return response.data;
  } catch (error) {
    console.error('Error analyzing content:', error);
    // Fallback basic structure
    return {
      chapters: ['Introduction', 'Main Content', 'Conclusion'],
      structure: { introduction: '', body: content, conclusion: '' }
    };
  }
};

export default {
  saveDraft,
  getDrafts,
  deleteDraft,
  checkTitle,
  suggestTitles,
  analyzeContent
};
