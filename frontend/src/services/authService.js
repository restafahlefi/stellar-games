/**
 * Auth Service
 * Handles authentication API calls
 */

// Auto-detect API URL based on environment
const getApiUrl = () => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (Railway), use relative path since frontend and backend are on same domain
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api/v1';
  }
  
  // In development, use localhost
  return 'http://localhost:5000/api/v1';
};

const API_URL = getApiUrl();

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'stellar_auth_token';
    this.USER_KEY = 'stellar_user';
  }

  /**
   * Register new user
   */
  async register(username, password) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      // Save token and user
      this.saveAuth(data.data.token, data.data.user);

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token and user
      this.saveAuth(data.data.token, data.data.user);

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify token
   */
  async verifyToken() {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        this.clearAuth();
        return null;
      }

      return data.data.user;
    } catch (error) {
      this.clearAuth();
      return null;
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.clearAuth();
    // Clear session storage too
    sessionStorage.removeItem('stellar_playerName');
  }

  /**
   * Save auth data
   */
  saveAuth(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    // Also save to session storage for compatibility
    sessionStorage.setItem('stellar_playerName', user.username);
  }

  /**
   * Clear auth data
   */
  clearAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem('stellar_playerName');
  }

  /**
   * Get token
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get user
   */
  getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
