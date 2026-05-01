// Use Case - Get Global Game Statistics
class GetGlobalStatsUseCase {
  constructor(gameService) {
    this.gameService = gameService;
  }

  async execute() {
    try {
      const stats = await this.gameService.getGlobalStats();
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GetGlobalStatsUseCase;
