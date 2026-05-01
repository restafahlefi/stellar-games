// Leaderboard Controller

class LeaderboardController {
  constructor(getLeaderboardUseCase, submitScoreUseCase, leaderboardService) {
    this.getLeaderboardUseCase = getLeaderboardUseCase;
    this.submitScoreUseCase = submitScoreUseCase;
    this.leaderboardService = leaderboardService;
  }

  async getLeaderboard(req, res) {
    try {
      const { gameId } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await this.getLeaderboardUseCase.execute(gameId, limit);
      
      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async submitScore(req, res) {
    try {
      const result = await this.submitScoreUseCase.execute(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      res.status(201).json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getGlobalLeaderboard(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const leaderboard = await this.leaderboardService.getGlobalLeaderboard(limit);
      
      res.json({
        status: 'success',
        data: leaderboard
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getPlayerRank(req, res) {
    try {
      const { playerId, gameId } = req.params;
      const rank = await this.leaderboardService.getPlayerRank(playerId, gameId);
      
      res.json({
        status: 'success',
        data: { rank }
      });
    } catch (error) {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = LeaderboardController;
