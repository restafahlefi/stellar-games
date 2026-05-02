/**
 * User Entity - Domain Model
 * Represents a registered user in the system
 */
class User {
  constructor({ id, username, passwordHash, createdAt, lastLoginAt }) {
    this.id = id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt || new Date().toISOString();
    this.lastLoginAt = lastLoginAt || null;
  }

  /**
   * Update last login timestamp
   */
  updateLastLogin() {
    this.lastLoginAt = new Date().toISOString();
  }

  /**
   * Convert to plain object (for storage/API response)
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt
    };
  }

  /**
   * Convert to safe object (without sensitive data)
   */
  toSafeJSON() {
    return {
      id: this.id,
      username: this.username,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
