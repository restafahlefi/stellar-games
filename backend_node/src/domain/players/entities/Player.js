// Player Entity

class Player {
  constructor({
    id,
    username,
    email,
    displayName,
    avatar = null,
    status = 'active',
    stats = {},
    preferences = {},
    createdAt = new Date(),
    lastLoginAt = null
  }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.displayName = displayName;
    this.avatar = avatar;
    this.status = status;
    this.stats = stats;
    this.preferences = preferences;
    this.createdAt = createdAt;
    this.lastLoginAt = lastLoginAt;
    this.updatedAt = new Date();
  }

  // Business logic
  updateProfile({ displayName, avatar, preferences }) {
    if (displayName) this.displayName = displayName;
    if (avatar) this.avatar = avatar;
    if (preferences) this.preferences = { ...this.preferences, ...preferences };
    this.updatedAt = new Date();
  }

  recordLogin() {
    this.lastLoginAt = new Date();
  }

  activate() {
    this.status = 'active';
    this.updatedAt = new Date();
  }

  deactivate() {
    this.status = 'inactive';
    this.updatedAt = new Date();
  }

  ban() {
    this.status = 'banned';
    this.updatedAt = new Date();
  }

  isActive() {
    return this.status === 'active';
  }

  updateStats(gameId, score, playTime) {
    if (!this.stats[gameId]) {
      this.stats[gameId] = {
        gamesPlayed: 0,
        totalScore: 0,
        highScore: 0,
        totalPlayTime: 0
      };
    }

    const gameStats = this.stats[gameId];
    gameStats.gamesPlayed += 1;
    gameStats.totalScore += score;
    gameStats.highScore = Math.max(gameStats.highScore, score);
    gameStats.totalPlayTime += playTime;

    this.updatedAt = new Date();
  }

  validate() {
    if (!this.id || !this.username || !this.email) {
      throw new Error('Player must have id, username, and email');
    }
    if (!this.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (this.username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      displayName: this.displayName,
      avatar: this.avatar,
      status: this.status,
      stats: this.stats,
      preferences: this.preferences,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt,
      updatedAt: this.updatedAt
    };
  }

  // Public profile (without sensitive data)
  toPublicProfile() {
    return {
      id: this.id,
      username: this.username,
      displayName: this.displayName,
      avatar: this.avatar,
      stats: this.stats
    };
  }
}

module.exports = Player;
