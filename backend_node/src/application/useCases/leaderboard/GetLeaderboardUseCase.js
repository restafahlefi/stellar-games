// Get Leaderboard Use Case

class GetLeaderboardUseCase {
  constructor(leaderboardService) {
    this.leaderboardService = leaderboardService;
  }

  async execute(gameId, limit = 10) {
    try {
      const leaderboard = await this.leaderboardService.getLeaderboard(gameId, limit);
      return {
        success: true,
        data: leaderboard
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GetLeaderboardUseCase;
