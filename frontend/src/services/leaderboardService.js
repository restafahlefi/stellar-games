import api from './api';

export const leaderboardService = {
  /**
   * Mengambil leaderboard untuk game tertentu
   */
  async getGameLeaderboard(gameId) {
    const response = await api.get(`/leaderboard/${gameId}`);
    return response.data;
  },

  /**
   * Mengambil leaderboard global (semua game)
   */
  async getGlobalLeaderboard() {
    const response = await api.get('/leaderboard/global');
    return response.data;
  },

  /**
   * Mengirim skor baru ke sistem
   */
  async submitScore(playerId, gameId, score, playTime) {
    const response = await api.post('/leaderboard/scores', {
      playerId,
      gameId,
      score,
      playTime
    });
    return response.data;
  },

  /**
   * Mengambil peringkat pemain di game tertentu
   */
  async getPlayerRank(gameId, playerId) {
    const response = await api.get(`/leaderboard/${gameId}/player/${playerId}/rank`);
    return response.data;
  }
};
