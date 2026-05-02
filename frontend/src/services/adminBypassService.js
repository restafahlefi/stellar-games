/**
 * Admin Bypass Service - EMERGENCY SOLUTION
 * Simple admin service tanpa complex authentication
 */

class AdminBypassService {
  constructor() {
    // PERBAIKAN: API URL detection untuk Railway
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Development
      this.apiUrl = 'http://localhost:5000/api/v1';
    } else {
      // Production (Railway) - gunakan relative path
      this.apiUrl = '/api/v1';
    }
    
    this.baseUrl = this.apiUrl.replace('/api/v1', '');
    this.adminKey = null;
    this.username = null;
    
    console.log('🚨 Admin Bypass Service initialized (EMERGENCY)');
    console.log('🔗 API URL:', this.apiUrl);
    console.log('🌐 Hostname:', window.location.hostname);
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      console.log('🧪 Testing API connection...');
      
      // Test basic health endpoint first
      const healthUrl = `${this.baseUrl}/health`;
      console.log('🌐 Testing health URL:', healthUrl);
      
      const response = await fetch(healthUrl, {
        method: 'GET'
      });
      
      console.log('📡 Health response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connection successful:', data);
        return true;
      }
      
      console.log('❌ API connection failed');
      return false;
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return false;
    }
  }

  /**
   * Simple admin login
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<boolean>}
   */
  async login(username, password) {
    try {
      console.log('🔄 Attempting admin bypass login...');
      console.log('📍 API URL:', this.apiUrl);
      console.log('👤 Username:', username);
      
      const url = `${this.apiUrl}/admin-bypass/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      console.log('🌐 Full URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        if (data.success) {
          this.adminKey = data.adminKey;
          this.username = data.username;
          
          // Save to localStorage
          localStorage.setItem('stellar_admin_key', this.adminKey);
          localStorage.setItem('stellar_admin_username', this.username);
          
          console.log('✅ Admin login successful!');
          return true;
        }
      }
      
      console.log('❌ Admin login failed - invalid response');
      return false;
    } catch (error) {
      console.error('❌ Admin bypass login failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return false;
    }
  }

  /**
   * Check if admin is logged in
   */
  isLoggedIn() {
    if (!this.adminKey) {
      this.adminKey = localStorage.getItem('stellar_admin_key');
      this.username = localStorage.getItem('stellar_admin_username');
    }
    return !!this.adminKey;
  }

  /**
   * Logout admin
   */
  logout() {
    this.adminKey = null;
    this.username = null;
    localStorage.removeItem('stellar_admin_key');
    localStorage.removeItem('stellar_admin_username');
  }

  /**
   * Get admin API URL with key
   */
  getApiUrl(endpoint) {
    return `${this.apiUrl}/admin-bypass${endpoint}?adminKey=${this.adminKey}`;
  }

  /**
   * Get system statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      if (!this.isLoggedIn()) {
        throw new Error('Not logged in');
      }

      const response = await fetch(this.getApiUrl('/stats'), {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Failed to get admin stats:', error);
      throw error;
    }
  }

  /**
   * Get all users
   * @returns {Promise<Array>}
   */
  async getUsers() {
    try {
      if (!this.isLoggedIn()) {
        throw new Error('Not logged in');
      }

      const response = await fetch(this.getApiUrl('/users'), {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Failed to get users:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} userId 
   * @returns {Promise<boolean>}
   */
  async deleteUser(userId) {
    try {
      if (!this.isLoggedIn()) {
        throw new Error('Not logged in');
      }

      const response = await fetch(this.getApiUrl(`/users/${userId}`), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  }

  /**
   * Get backup status
   * @returns {Promise<Object>}
   */
  async getBackupStatus() {
    try {
      if (!this.isLoggedIn()) {
        throw new Error('Not logged in');
      }

      const response = await fetch(this.getApiUrl('/backup/status'), {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Failed to get backup status:', error);
      throw error;
    }
  }

  /**
   * Force manual backup
   * @returns {Promise<Object>}
   */
  async forceBackup() {
    try {
      if (!this.isLoggedIn()) {
        throw new Error('Not logged in');
      }

      const response = await fetch(this.getApiUrl('/backup/create'), {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Failed to force backup:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const adminBypassService = new AdminBypassService();