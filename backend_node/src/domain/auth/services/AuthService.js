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
    this.JWT_EXPIRY = '30d'; // 30 days (extended for better UX)
    
    // Log JWT secret (first 10 chars only for security)
    console.log('🔐 JWT Secret initialized:', this.JWT_SECRET.substring(0, 10) + '...');
  }

  /**
   * Register a new user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{user}>} - TIDAK mengirim token, user harus login manual
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

    // PERBAIKAN: TIDAK generate token saat registrasi
    // User harus login manual setelah registrasi
    return {
      user: user.toSafeJSON()
      // token: DIHAPUS!
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
      console.log('🔍 Verifying token:', token.substring(0, 20) + '...');
      const decoded = jwt.verify(token, this.JWT_SECRET);
      console.log('✅ Token decoded:', decoded);
      
      const user = await this.authRepository.findById(decoded.userId);
      
      if (!user) {
        console.log('❌ User not found:', decoded.userId);
        throw new Error('User not found');
      }

      console.log('✅ User verified:', user.username);
      return user;
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
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
