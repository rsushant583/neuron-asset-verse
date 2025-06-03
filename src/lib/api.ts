
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com' 
    : 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
      localStorage.removeItem('authToken');
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
export const signIn = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/signin', { email, password });
    return response.data;
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: 'Sign in failed', offline: true };
  }
};

export const signOut = async () => {
  try {
    const response = await api.post('/auth/signout');
    localStorage.removeItem('authToken');
    return response.data;
  } catch (error) {
    console.error('Sign out error:', error);
    // Always allow local sign out
    localStorage.removeItem('authToken');
    return { success: true };
  }
};

export const register = async (email: string, password: string, userData: any = {}) => {
  try {
    const response = await api.post('/auth/register', { email, password, ...userData });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Registration failed', offline: true };
  }
};

// Title and content APIs
export const checkTitle = async (title: string) => {
  try {
    const response = await api.post('/content/check-title', { title });
    return response.data;
  } catch (error) {
    console.error('Title check error:', error);
    // Fallback for offline mode
    return {
      isUnique: true,
      suggested: title,
      offline: true
    };
  }
};

export const suggestTitle = async (theme: string, category?: string) => {
  try {
    const response = await api.post('/content/suggest-title', { theme, category });
    return response.data;
  } catch (error) {
    console.error('Title suggestion error:', error);
    // Fallback suggestions for offline mode
    const fallbackTitles = {
      medical: [
        "Healing Wisdom: A Medical Journey",
        "Life Lessons from the Ward",
        "The Art of Caring: Medical Stories"
      ],
      business: [
        "Success Strategies: A Business Guide",
        "Leadership Lessons Learned",
        "The Path to Professional Growth"
      ],
      fiction: [
        "Tales of Wonder and Mystery",
        "Stories from the Heart",
        "Adventures in Imagination"
      ],
      general: [
        "My Life Story: Lessons and Wisdom",
        "Experiences That Shaped Me",
        "A Journey of Discovery"
      ]
    };
    
    const titles = fallbackTitles[category as keyof typeof fallbackTitles] || fallbackTitles.general;
    return {
      title: titles[Math.floor(Math.random() * titles.length)],
      offline: true
    };
  }
};

export const generateContent = async (prompt: string, category?: string) => {
  try {
    const response = await api.post('/content/generate', { prompt, category });
    return response.data;
  } catch (error) {
    console.error('Content generation error:', error);
    return {
      content: `Generated content for: ${prompt}\n\nThis is a placeholder response while in offline mode. Your content would be generated here with AI assistance.`,
      offline: true
    };
  }
};

// Draft management APIs
export const saveDraft = async (userId: string, draftData: any) => {
  try {
    const response = await api.post('/drafts/save', {
      userId,
      ...draftData,
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Save draft error:', error);
    // Fallback to localStorage for offline mode
    const drafts = JSON.parse(localStorage.getItem('offlineDrafts') || '[]');
    const newDraft = {
      id: `offline_${Date.now()}`,
      userId,
      ...draftData,
      timestamp: new Date().toISOString(),
      version: drafts.filter((d: any) => d.userId === userId).length + 1,
      offline: true
    };
    drafts.push(newDraft);
    localStorage.setItem('offlineDrafts', JSON.stringify(drafts));
    return newDraft;
  }
};

export const getDrafts = async (userId: string) => {
  try {
    const response = await api.get(`/drafts/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get drafts error:', error);
    // Fallback to localStorage for offline mode
    const drafts = JSON.parse(localStorage.getItem('offlineDrafts') || '[]');
    return drafts.filter((draft: any) => draft.userId === userId);
  }
};

export const deleteDraft = async (draftId: string) => {
  try {
    const response = await api.delete(`/drafts/${draftId}`);
    return response.data;
  } catch (error) {
    console.error('Delete draft error:', error);
    // Fallback to localStorage for offline mode
    if (draftId.startsWith('offline_')) {
      const drafts = JSON.parse(localStorage.getItem('offlineDrafts') || '[]');
      const filteredDrafts = drafts.filter((draft: any) => draft.id !== draftId);
      localStorage.setItem('offlineDrafts', JSON.stringify(filteredDrafts));
      return { success: true, offline: true };
    }
    return { error: 'Delete failed', offline: true };
  }
};

export const updateDraft = async (draftId: string, updates: any) => {
  try {
    const response = await api.put(`/drafts/${draftId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Update draft error:', error);
    // Fallback to localStorage for offline mode
    if (draftId.startsWith('offline_')) {
      const drafts = JSON.parse(localStorage.getItem('offlineDrafts') || '[]');
      const draftIndex = drafts.findIndex((draft: any) => draft.id === draftId);
      if (draftIndex !== -1) {
        drafts[draftIndex] = { ...drafts[draftIndex], ...updates };
        localStorage.setItem('offlineDrafts', JSON.stringify(drafts));
        return drafts[draftIndex];
      }
    }
    return { error: 'Update failed', offline: true };
  }
};

// Publishing APIs
export const publishEbook = async (ebookData: any) => {
  try {
    const response = await api.post('/ebooks/publish', ebookData);
    return response.data;
  } catch (error) {
    console.error('Publish error:', error);
    return {
      error: 'Publishing failed - your content has been saved as a draft',
      offline: true
    };
  }
};

export const getPublishedEbooks = async (userId?: string) => {
  try {
    const url = userId ? `/ebooks/user/${userId}` : '/ebooks';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Get ebooks error:', error);
    return { ebooks: [], offline: true };
  }
};

// Analytics APIs
export const getAnalytics = async (userId: string) => {
  try {
    const response = await api.get(`/analytics/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Analytics error:', error);
    return {
      views: 0,
      earnings: 0,
      downloads: 0,
      offline: true
    };
  }
};

// User profile APIs
export const getUserProfile = async (userId: string) => {
  try {
    const response = await api.get(`/users/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Profile error:', error);
    return {
      error: 'Profile unavailable',
      offline: true
    };
  }
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const response = await api.put(`/users/profile/${userId}`, profileData);
    return response.data;
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      error: 'Profile update failed',
      offline: true
    };
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'offline', error: true };
  }
};

export default api;
