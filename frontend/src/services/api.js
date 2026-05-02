// API URL Configuration
// In production (Railway), use relative path so frontend and backend are on same domain
// In development, use localhost
const API_URL = import.meta.env.VITE_API_URL || 
                (import.meta.env.MODE === 'production' ? '/api/v1' : 'http://localhost:5000/api/v1');

// Debug: Log API URL
console.log('🔧 API_URL Configuration:', API_URL);
console.log('🔧 Mode:', import.meta.env.MODE);

const api = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Request Failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`🔴 API GET Error [${endpoint}]:`, error);
      throw error;
    }
  },

  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Request Failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`🔴 API POST Error [${endpoint}]:`, error);
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Request Failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`🔴 API PUT Error [${endpoint}]:`, error);
      throw error;
    }
  }
};

export default api;
