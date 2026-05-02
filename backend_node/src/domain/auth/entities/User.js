/**
 * User Entity - Domain Model
 * Represents a registered user in the system
 */
class User {
  constructor({ id, username, passwordHash, email, role, createdAt, lastLoginAt }) {
    this.id = id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.email = email || null;
    this.role = role || 'user'; // 'user' or 'admin'
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
   * Check if user is admin
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Convert to plain object (for storage/API response)
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
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
      email: this.email,
      role: this.role,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
