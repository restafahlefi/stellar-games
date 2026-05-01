// Utility untuk generate unique IDs

class IdGenerator {
  static generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}${randomStr}` : `${timestamp}${randomStr}`;
  }

  static generateGameId() {
    return this.generateId('game');
  }

  static generatePlayerId() {
    return this.generateId('player');
  }

  static generateScoreId() {
    return this.generateId('score');
  }
}

module.exports = IdGenerator;
