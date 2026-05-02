const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Auth Service - Domain Logic
 * Handles authentication business logic
 */
class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
    this.JWT_SECRET = process.env.JWT_SECRET || 'stellar-games-secret-key-2026';
    this.JWT_EXPIRY = '7d'; // 7 days
  }

  /**
   * Register a new user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{user, token}>}
   */
  async register(username, password) {
    // Validate username
    if (!username || username.length < 3 || username.length > 15) {
      throw new Error('Username must be between 3-15 characters');
    }

    // Validate password
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if username already exists
    const exists = await this.authRepository.usernameExists(username);
    if (exists) {
      throw new Error('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.authRepository.createUser({
      username,
      passwordHash
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      user: user.toSafeJSON(),
      token
    };
  }

  /**
   * Login user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{user, token}>}
   */
  async login(username, password) {
    // Find user
    const user = await this.authRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    // Update last login
    user.updateLastLogin();
    await this.authRepository.updateUser(user.id, {
      lastLoginAt: user.lastLoginAt
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      user: user.toSafeJSON(),
      token
    };
  }

  /**
   * Verify JWT token
   * @param {string} token
   * @returns {Promise<User>}
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      const user = await this.authRepository.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate JWT token
   * @param {User} user
   * @returns {string}
   */
  generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRY }
    );
  }
}

module.exports = AuthService;
