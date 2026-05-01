// Score Entity - Represents a game score entry

class Score {
  constructor({
    id,
    playerId,
    playerName,
    gameId,
    score,
    playTime,
    difficulty = 'medium',
    metadata = {},
    achievedAt = new Date()
  }) {
    this.id = id;
    this.playerId = playerId;
    this.playerName = playerName;
    this.gameId = gameId;
    this.score = score;
    this.playTime = playTime;
    this.difficulty = difficulty;
    this.metadata = metadata;
    this.achievedAt = achievedAt;
  }

  isHigherThan(otherScore) {
    return this.score > otherScore.score;
  }

  isFasterThan(otherScore) {
    return this.playTime < otherScore.playTime;
  }

  validate() {
    if (!this.playerId || !this.gameId) {
      throw new Error('Score must have playerId and gameId');
    }
    if (typeof this.score !== 'number' || this.score < 0) {
      throw new Error('Score must be a non-negative number');
    }
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      playerId: this.playerId,
      playerName: this.playerName,
      gameId: this.gameId,
      score: this.score,
      playTime: this.playTime,
      difficulty: this.difficulty,
      metadata: this.metadata,
      achievedAt: this.achievedAt
    };
  }
}

module.exports = Score;
