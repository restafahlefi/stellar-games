// Submit Score Use Case

class SubmitScoreUseCase {
  constructor(leaderboardService, gameService, playerService) {
    this.leaderboardService = leaderboardService;
    this.gameService = gameService;
    this.playerService = playerService;
  }

  async execute(scoreData) {
    try {
      // Validate game exists
      await this.gameService.getGameById(scoreData.gameId);
      
      // AUTO-REGISTRATION: Jika player tidak ada, buatkan otomatis
      let player;
      try {
        player = await this.playerService.getPlayerById(scoreData.playerId);
      } catch (e) {
        // Cek berdasarkan username jika ID gagal
        try {
          player = await this.playerService.getPlayerByUsername(scoreData.playerId);
        } catch (usernameError) {
          console.log(`👤 Auto-registering new player: ${scoreData.playerId}`);
          player = await this.playerService.createPlayer({
            id: scoreData.playerId,
            username: scoreData.playerId,
            email: `${scoreData.playerId.toLowerCase()}@stellargames.com`,
            displayName: scoreData.playerId,
            status: 'active'
          });
        }
      }
      
      // Submit score with unique ID
      const score = await this.leaderboardService.submitScore({
        ...scoreData,
        id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
      
      // Update player stats
      await this.playerService.recordGamePlay(
        scoreData.playerId,
        scoreData.gameId,
        scoreData.score,
        scoreData.playTime || 0
      );
      
      // Record game play
      await this.gameService.recordGamePlay(scoreData.gameId);
      
      return {
        success: true,
        data: score
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = SubmitScoreUseCase;
