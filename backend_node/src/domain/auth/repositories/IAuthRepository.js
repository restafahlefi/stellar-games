/**
 * Auth Repository Interface
 * Defines contract for auth data persistence
 */
class IAuthRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<User>}
   */
  async createUser(userData) {
    throw new Error('Method not implemented');
  }

  /**
   * Find user by username
   * @param {string} username
   * @returns {Promise<User|null>}
   */
  async findByUsername(username) {
    throw new Error('Method not implemented');
  }

  /**
   * Find user by ID
   * @param {string} id
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Update user
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<User>}
   */
  async updateUser(id, updates) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if username exists
   * @param {string} username
   * @returns {Promise<boolean>}
   */
  async usernameExists(username) {
    throw new Error('Method not implemented');
  }
}

module.exports = IAuthRepository;
