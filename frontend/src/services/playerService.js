import api from './api';

export const playerService = {
  /**
   * Mendapatkan profil pemain berdasarkan ID
   */
  async getPlayerProfile(id) {
    const response = await api.get(`/players/${id}`);
    return response.data;
  },

  /**
   * Membuat profil pemain baru (Register/Login simple)
   */
  async createPlayer(username, email, displayName) {
    // Generate simple ID if not provided
    const id = `p_${Math.random().toString(36).substr(2, 9)}`;
    const response = await api.post('/players', {
      id,
      username,
      email,
      displayName: displayName || username
    });
    return response.data;
  },

  /**
   * Mengambil statistik permainan pemain
   */
  async getPlayerStats(id) {
    const response = await api.get(`/players/${id}/stats`);
    return response.data;
  },

  /**
   * Update profil pemain
   */
  async updateProfile(id, profileData) {
    const response = await api.put(`/players/${id}`, profileData);
    return response.data;
  },

  /**
   * Send heartbeat to track active players
   */
  async sendHeartbeat(playerName) {
    try {
      const response = await api.post('/players/heartbeat', { playerName });
      return response;
    } catch (error) {
      console.error('Heartbeat error:', error);
      return null;
    }
  }
};
