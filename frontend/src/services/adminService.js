/**
 * Admin Service
 * Frontend service untuk admin panel operations
 */

class AdminService {
  constructor() {
    // Auto-detect API URL (same as authService)
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    this.baseUrl = this.apiUrl.replace('/api/v1', '');
    
    console.log('👑 Admin Service initialized');
    console.log('🔗 API URL:', this.apiUrl);
  }

  /**
   * Set admin credentials untuk authentication
   * @param {string} username 
   * @param {string} password 
   */
  setCredentials(username, password) {
    this.credentials = btoa(`${username}:${password}`);
  }

  /**
   * Get headers dengan admin authentication
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${this.credentials}`
    };
  }

  /**
   * Test admin authentication
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<boolean>}
   */
  async testAuth(username, password) {
    try {
      this.setCredentials(username, password);
      
      const response = await fetch(`${this.apiUrl}/admin/test-auth`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return data.success;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Admin auth test failed:', error);
      return false;
    }
  }

  /**
   * Get system statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      const response = await fetch(`${this.apiUrl}/admin/stats`, {
        method: 'GET',
        headers: this.getHeaders()
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
      const response = await fetch(`${this.apiUrl}/admin/users`, {
        method: 'GET',
        headers: this.getHeaders()
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
   * Update user
   * @param {string} userId 
   * @param {Object} updates 
   * @returns {Promise<Object>}
   */
  async updateUser(userId, updates) {
    try {
      const response = await fetch(`${this.apiUrl}/admin/users/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Failed to update user:', error);
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
      const response = await fetch(`${this.apiUrl}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
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
      const response = await fetch(`${this.apiUrl}/admin/backup/status`, {
        method: 'GET',
        headers: this.getHeaders()
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
      const response = await fetch(`${this.apiUrl}/admin/backup/create`, {
        method: 'POST',
        headers: this.getHeaders()
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

  /**
   * Verify backups
   * @returns {Promise<Object>}
   */
  async verifyBackups() {
    try {
      const response = await fetch(`${this.apiUrl}/admin/backup/verify`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Failed to verify backups:', error);
      throw error;
    }
  }

  /**
   * Get rate limiting stats
   * @returns {Promise<Object>}
   */
  async getRateLimitStats() {
    try {
      const response = await fetch(`${this.apiUrl}/admin/ratelimit/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Failed to get rate limit stats:', error);
      throw error;
    }
  }

  /**
   * Reset rate limits
   * @param {Object} params - { ip, username, endpoint }
   * @returns {Promise<boolean>}
   */
  async resetRateLimit(params) {
    try {
      const response = await fetch(`${this.apiUrl}/admin/ratelimit/reset`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to reset rate limit:', error);
      throw error;
    }
  }

  /**
   * Reset leaderboard
   * @param {string} gameId - Game ID atau null untuk semua games
   * @returns {Promise<Object>}
   */
  async resetLeaderboard(gameId = null) {
    try {
      const response = await fetch(`${this.apiUrl}/admin/leaderboard/reset`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ gameId })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Failed to reset leaderboard:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const adminService = new AdminService();