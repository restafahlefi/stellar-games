/**
 * Admin Bypass Service - EMERGENCY SOLUTION
 * Simple admin service tanpa complex authentication
 */

class AdminBypassService {
  constructor() {
    // Auto-detect API URL (same as authService)
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    this.baseUrl = this.apiUrl.replace('/api/v1', '');
    this.adminKey = null;
    this.username = null;
    
    console.log('🚨 Admin Bypass Service initialized (EMERGENCY)');
    console.log('🔗 API URL:', this.apiUrl);
  }

  /**
   * Simple admin login
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<boolean>}
   */
  async login(username, password) {
    try {
      const response = await fetch(`${this.apiUrl}/admin-bypass/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.adminKey = data.adminKey;
          this.username = data.username;
          
          // Save to localStorage
          localStorage.setItem('stellar_admin_key', this.adminKey);
          localStorage.setItem('stellar_admin_username', this.username);
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Admin bypass login failed:', error);
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