// Leaderboard Domain Service

const Score = require('../entities/Score');

class LeaderboardService {
  constructor(scoreRepository, playerRepository) {
    this.scoreRepository = scoreRepository;
    this.playerRepository = playerRepository;
  }

  async submitScore(scoreData) {
    // Validate player exists
    const player = await this.playerRepository.findById(scoreData.playerId);
    if (!player) {
      throw new Error(`Player with id ${scoreData.playerId} not found`);
    }

    const score = new Score({
      ...scoreData,
      playerName: player.displayName || player.username
    });
    
    score.validate();
    return await this.scoreRepository.save(score);
  }

  async getLeaderboard(gameId, limit = 10) {
    const scores = await this.scoreRepository.findTopScores(gameId, limit);
    
    // Add rank to each score
    return scores.map((score, index) => ({
      ...score,
      rank: index + 1
    }));
  }

  async getPlayerScores(playerId) {
    return await this.scoreRepository.findByPlayerId(playerId);
  }

  async getPlayerBestScore(playerId, gameId) {
    return await this.scoreRepository.findPlayerBestScore(playerId, gameId);
  }

  async getPlayerRank(playerId, gameId) {
    const rank = await this.scoreRepository.getPlayerRank(playerId, gameId);
    return rank;
  }

  async getGlobalLeaderboard(limit = 50) {
    // Get top players across all games
    const allScores = await this.scoreRepository.findAll();
    
    // Aggregate scores by player
    const playerScores = {};
    allScores.forEach(score => {
      if (!playerScores[score.playerId]) {
        playerScores[score.playerId] = {
          playerId: score.playerId,
          playerName: score.playerName,
          totalScore: 0,
          gamesPlayed: 0
        };
      }
      playerScores[score.playerId].totalScore += score.score;
      playerScores[score.playerId].gamesPlayed += 1;
    });

    // Sort by total score
    const leaderboard = Object.values(playerScores)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);

    // Add ranks and ensure UI compatibility
    return leaderboard.map((entry, index) => ({
      ...entry,
      score: entry.totalScore, // Compatibility with UI
      rank: index + 1
    }));
  }

  async deleteScore(scoreId) {
    return await this.scoreRepository.delete(scoreId);
  }
}

module.exports = LeaderboardService;
