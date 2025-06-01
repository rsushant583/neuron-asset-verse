
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

// API Services
export const apiService = {
  // AI Draft Generation
  createDraft: async (text: string) => {
    const response = await api.post('/api/draft', { text });
    return response.data;
  },

  // Update draft sections
  updateDraft: async (draftId: string, sections: any) => {
    const response = await api.post('/api/update-draft', { draftId, sections });
    return response.data;
  },

  // Template rendering
  renderPDF: async (draftId: string, templateId: string) => {
    const response = await api.post('/api/render-pdf', { draftId, templateId });
    return response.data;
  },

  // Product publishing
  publishProduct: async (productData: any) => {
    const response = await api.post('/api/publish', productData);
    return response.data;
  },

  // User statistics
  getUserStats: async (userId: string) => {
    const response = await api.get(`/api/stats/${userId}`);
    return response.data;
  },

  // Marketplace products
  getProducts: async (filters?: any) => {
    const response = await api.get('/api/products', { params: filters });
    return response.data;
  },

  // Voice transcription
  transcribeAudio: async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    const response = await api.post('/api/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Blockchain minting
  mintNFT: async (productId: string, metadata: any) => {
    const response = await api.post('/api/mint-nft', { productId, metadata });
    return response.data;
  }
};

export default api;
