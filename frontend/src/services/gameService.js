import api from './api';

export const gameService = {
  /**
   * Mengambil semua daftar game dari backend
   */
  async getAllGames() {
    const response = await api.get('/games');
    return response.data; // DDD structure wrapper
  },
  
  /**
   * Mengambil detail game spesifik berdasarkan ID
   */
  async getGameById(id) {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  /**
   * Mengambil game yang aktif saja
   */
  async getActiveGames() {
    const response = await api.get('/games/active');
    return response.data;
  },

  /**
   * Mengambil statistik global dari backend
   */
  async getGlobalStats() {
    const response = await api.get('/games/stats');
    // Response format: {success: true, data: {totalGames, totalPlays, totalPlayers, activePlayers}}
    return response.success ? response.data : response;
  },

  /**
   * Mengirim laporan bahwa game telah dimainkan ke backend
   */
  async recordGamePlay(id) {
    return await api.post(`/games/${id}/play`, {});
  }
};
