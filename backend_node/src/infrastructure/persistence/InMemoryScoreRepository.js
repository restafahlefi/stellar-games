// Concrete implementation of Score Repository

const IScoreRepository = require('../../domain/leaderboard/repositories/IScoreRepository');
const db = require('../../config/database');

class InMemoryScoreRepository extends IScoreRepository {
  constructor() {
    super();
    this.collection = 'scores';
  }

  async findById(scoreId) {
    return db.findById(this.collection, scoreId);
  }

  async findByGameId(gameId, limit = 10) {
    const scores = db.query(this.collection, score => score.gameId === gameId);
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async findByPlayerId(playerId) {
    return db.query(this.collection, score => score.playerId === playerId);
  }

  async findTopScores(gameId, limit = 10) {
    const scores = db.query(this.collection, score => score.gameId === gameId);
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async findPlayerBestScore(playerId, gameId) {
    const scores = db.query(
      this.collection, 
      score => score.playerId === playerId && score.gameId === gameId
    );
    
    if (scores.length === 0) return null;
    
    return scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  async findAll() {
    return db.findAll(this.collection);
  }

  async save(score) {
    return db.create(this.collection, score.id, score.toJSON());
  }

  async delete(scoreId) {
    return db.delete(this.collection, scoreId);
  }

  async getPlayerRank(playerId, gameId) {
    const allScores = await this.findTopScores(gameId, 1000);
    const playerBestScore = await this.findPlayerBestScore(playerId, gameId);
    
    if (!playerBestScore) return null;
    
    const rank = allScores.findIndex(score => 
      score.playerId === playerId && score.score === playerBestScore.score
    );
    
    return rank !== -1 ? rank + 1 : null;
  }
}

module.exports = InMemoryScoreRepository;
