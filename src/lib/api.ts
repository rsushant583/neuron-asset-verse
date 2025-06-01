
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network.');
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/auth';
      throw new Error('Authentication required. Please sign in.');
    }
    
    throw error;
  }
);

// Enhanced API Services with error handling
export const apiService = {
  // Authentication
  signIn: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/sign-in', { email, password });
      return response.data;
    } catch (error) {
      throw new Error('Sign in failed. Please check your credentials.');
    }
  },

  signOut: async () => {
    try {
      const response = await api.post('/auth/sign-out');
      localStorage.removeItem('auth_token');
      return response.data;
    } catch (error) {
      throw new Error('Sign out failed. Please try again.');
    }
  },

  // Title management
  checkTitle: async (title: string) => {
    try {
      const response = await api.post('/check-title', { title });
      return response.data;
    } catch (error) {
      console.warn('Title check failed:', error);
      return { isUnique: true, suggested: title }; // Fallback
    }
  },

  suggestTitle: async (theme: string, category?: string) => {
    try {
      const response = await api.post('/suggest-title', { theme, category });
      return response.data;
    } catch (error) {
      console.warn('Title suggestion failed:', error);
      // Fallback title suggestions
      const fallbackTitles = {
        medical: `Healing Wisdom: A ${theme} Journey`,
        business: `Success Stories: Lessons from ${theme}`,
        personal: `Life Lessons: My ${theme} Experience`,
        general: `Wisdom Shared: Stories of ${theme}`
      };
      
      const categoryKey = category as keyof typeof fallbackTitles || 'general';
      return { title: fallbackTitles[categoryKey] || fallbackTitles.general };
    }
  },

  // Draft management
  saveDraft: async (userId: string, content: string, title?: string, chapters?: string[]) => {
    try {
      const response = await api.post('/save-draft', { 
        userId, 
        content, 
        title, 
        chapters,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to save draft. Please try again.');
    }
  },

  getDrafts: async (userId: string) => {
    try {
      const response = await api.get(`/drafts/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to load drafts. Please try again.');
    }
  },

  deleteDraft: async (draftId: string) => {
    try {
      const response = await api.delete(`/drafts/${draftId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete draft. Please try again.');
    }
  },

  // AI Draft Generation
  createDraft: async (text: string, category?: string) => {
    try {
      const response = await api.post('/api/draft', { text, category });
      return response.data;
    } catch (error) {
      throw new Error('Failed to generate draft. Please try again.');
    }
  },

  // Update draft sections
  updateDraft: async (draftId: string, sections: any) => {
    try {
      const response = await api.post('/api/update-draft', { draftId, sections });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update draft. Please try again.');
    }
  },

  // Content analysis
  analyzeContent: async (content: string) => {
    try {
      const response = await api.post('/api/analyze-content', { content });
      return response.data;
    } catch (error) {
      console.warn('Content analysis failed:', error);
      // Fallback structure
      return {
        chapters: ['Introduction', 'Main Content', 'Conclusion'],
        structure: { introduction: '', body: content, conclusion: '' }
      };
    }
  },

  // Template rendering
  renderPDF: async (draftId: string, templateId: string) => {
    try {
      const response = await api.post('/api/render-pdf', { draftId, templateId });
      return response.data;
    } catch (error) {
      throw new Error('Failed to render PDF. Please try again.');
    }
  },

  // Product publishing
  publishProduct: async (productData: any) => {
    try {
      const response = await api.post('/api/publish', productData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to publish product. Please try again.');
    }
  },

  // User statistics
  getUserStats: async (userId: string) => {
    try {
      const response = await api.get(`/api/stats/${userId}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to load user stats:', error);
      return { products: 0, earnings: 0, views: 0 }; // Fallback
    }
  },

  // Marketplace products
  getProducts: async (filters?: any) => {
    try {
      const response = await api.get('/api/products', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error('Failed to load products. Please try again.');
    }
  },

  // Voice transcription
  transcribeAudio: async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await api.post('/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to transcribe audio. Please try again.');
    }
  },

  // Blockchain minting
  mintNFT: async (productId: string, metadata: any) => {
    try {
      const response = await api.post('/api/mint-nft', { productId, metadata });
      return response.data;
    } catch (error) {
      throw new Error('Failed to mint NFT. Please try again.');
    }
  }
};

// Direct API call functions for voice commands
export const checkTitle = async (title: string) => {
  return apiService.checkTitle(title);
};

export const suggestTitle = async (theme: string, category?: string) => {
  return apiService.suggestTitle(theme, category);
};

export const saveDraft = async (userId: string, content: string, title?: string, chapters?: string[]) => {
  return apiService.saveDraft(userId, content, title, chapters);
};

export const getDrafts = async (userId: string) => {
  return apiService.getDrafts(userId);
};

export default api;
