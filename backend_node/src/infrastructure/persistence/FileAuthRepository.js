const fs = require('fs').promises;
const path = require('path');
const User = require('../../domain/auth/entities/User');
const { generateId } = require('../../shared/utils/idGenerator');
const githubBackupService = require('../backup/GitHubBackupService');

/**
 * File-based Auth Repository
 * Stores users in JSON file for persistence
 * Automatically backs up to GitHub to survive Railway redeployments
 */
class FileAuthRepository {
  constructor() {
    this.filePath = path.join(__dirname, '../../../data/users.json');
    this.users = new Map();
    this.initialized = false;
  }

  /**
   * Initialize repository (load from file)
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize GitHub backup service first
      await githubBackupService.initialize();
      
      // Try to restore from GitHub (in case of Railway redeploy)
      await githubBackupService.restore();

      // Ensure data directory exists
      const dataDir = path.dirname(this.filePath);
      await fs.mkdir(dataDir, { recursive: true });

      // Load existing users
      try {
        const data = await fs.readFile(this.filePath, 'utf8');
        const usersData = JSON.parse(data);
        
        usersData.forEach(userData => {
          const user = new User(userData);
          this.users.set(user.id, user);
        });
        
        console.log(`✅ Loaded ${this.users.size} users from file`);
      } catch (error) {
        // File doesn't exist yet, start with empty
        console.log('📝 No existing users file, starting fresh');
        await this.saveToFile();
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Error initializing FileAuthRepository:', error);
      throw error;
    }
  }

  /**
   * Save users to file and backup to GitHub
   */
  async saveToFile() {
    try {
      const usersArray = Array.from(this.users.values()).map(user => ({
        id: user.id,
        username: user.username,
        passwordHash: user.passwordHash,
        email: user.email || null,
        role: user.role || 'user',
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }));

      await fs.writeFile(
        this.filePath,
        JSON.stringify(usersArray, null, 2),
        'utf8'
      );

      // Trigger GitHub backup asynchronously (don't wait for it)
      githubBackupService.backup('User data modified').catch(err => {
        console.error('⚠️  GitHub backup failed:', err.message);
      });
    } catch (error) {
      console.error('❌ Error saving users to file:', error);
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData) {
    await this.initialize();

    const user = new User({
      id: generateId(),
      username: userData.username,
      passwordHash: userData.passwordHash,
      email: userData.email || null,
      role: userData.role || 'user',
      createdAt: new Date().toISOString()
    });

    this.users.set(user.id, user);
    await this.saveToFile();

    return user;
  }

  /**
   * Find user by username
   */
  async findByUsername(username) {
    await this.initialize();

    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }

    return null;
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    await this.initialize();
    return this.users.get(id) || null;
  }

  /**
   * Update user
   */
  async updateUser(id, updates) {
    await this.initialize();

    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updates);
    await this.saveToFile();

    return user;
  }

  /**
   * Check if username exists
   */
  async usernameExists(username) {
    await this.initialize();

    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all users (for admin/debug)
   */
  async getAllUsers() {
    await this.initialize();
    return Array.from(this.users.values());
  }

  /**
   * Find all users (alias for getAllUsers)
   */
  async findAll() {
    return this.getAllUsers();
  }

  /**
   * Update user (alias for updateUser)
   */
  async update(id, updates) {
    return this.updateUser(id, updates);
  }

  /**
   * Delete user
   */
  async delete(id) {
    await this.initialize();

    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    this.users.delete(id);
    await this.saveToFile();

    return true;
  }
}

module.exports = FileAuthRepository;
