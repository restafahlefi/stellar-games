// Value Object - Immutable object yang tidak memiliki identitas
// Hanya didefinisikan oleh nilai atributnya

class GameMetadata {
  constructor({
    totalPlays = 0,
    averageScore = 0,
    highestScore = 0,
    averagePlayTime = 0,
    rating = 0,
    tags = []
  }) {
    this._totalPlays = totalPlays;
    this._averageScore = averageScore;
    this._highestScore = highestScore;
    this._averagePlayTime = averagePlayTime;
    this._rating = rating;
    this._tags = [...tags];
    
    Object.freeze(this); // Make immutable
  }

  get totalPlays() {
    return this._totalPlays;
  }

  get averageScore() {
    return this._averageScore;
  }

  get highestScore() {
    return this._highestScore;
  }

  get averagePlayTime() {
    return this._averagePlayTime;
  }

  get rating() {
    return this._rating;
  }

  get tags() {
    return [...this._tags];
  }

  // Create new instance with updated values
  incrementPlays() {
    return new GameMetadata({
      ...this.toJSON(),
      totalPlays: this._totalPlays + 1
    });
  }

  updateHighScore(score) {
    if (score > this._highestScore) {
      return new GameMetadata({
        ...this.toJSON(),
        highestScore: score
      });
    }
    return this;
  }

  toJSON() {
    return {
      totalPlays: this._totalPlays,
      averageScore: this._averageScore,
      highestScore: this._highestScore,
      averagePlayTime: this._averagePlayTime,
      rating: this._rating,
      tags: this._tags
    };
  }
}

module.exports = GameMetadata;
