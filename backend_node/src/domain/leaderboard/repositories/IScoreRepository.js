// Score Repository Interface

class IScoreRepository {
  async findById(scoreId) {
    throw new Error('Method not implemented');
  }

  async findByGameId(gameId, limit = 10) {
    throw new Error('Method not implemented');
  }

  async findByPlayerId(playerId) {
    throw new Error('Method not implemented');
  }

  async findTopScores(gameId, limit = 10) {
    throw new Error('Method not implemented');
  }

  async findPlayerBestScore(playerId, gameId) {
    throw new Error('Method not implemented');
  }

  async save(score) {
    throw new Error('Method not implemented');
  }

  async delete(scoreId) {
    throw new Error('Method not implemented');
  }

  async getPlayerRank(playerId, gameId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IScoreRepository;
