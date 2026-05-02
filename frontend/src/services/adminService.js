/**
 * Admin Service
 * API calls for admin operations
 */

import api from './api';

export const adminService = {
  /**
   * Get dashboard statistics
   */
  async getDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  /**
   * Get all users
   */
  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Update user
   */
  async updateUser(userId, updates) {
    const response = await api.put(`/admin/users/${userId}`, updates);
    return response.data;
  },

  /**
   * Delete user
   */
  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Get game analytics
   */
  async getGameAnalytics(gameId) {
    const response = await api.get(`/admin/analytics/games/${gameId}`);
    return response.data;
  },

  /**
   * Reset leaderboard
   */
  async resetLeaderboard(gameId = null) {
    const response = await api.post('/admin/leaderboard/reset', { gameId });
    return response.data;
  },

  /**
   * Get system logs
   */
  async getLogs(limit = 100) {
    const response = await api.get(`/admin/logs?limit=${limit}`);
    return response.data;
  },

  /**
   * Export data to CSV
   */
  exportToCSV(data, filename) {
    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Convert array of objects to CSV
   */
  convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
};

export default adminService;
