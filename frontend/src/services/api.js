// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Debug: Log API URL untuk memastikan environment variable terbaca
console.log('🔧 API_URL Configuration (HARDCODED):', API_URL);

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
