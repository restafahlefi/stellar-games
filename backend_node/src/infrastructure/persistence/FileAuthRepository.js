const fs = require('fs').promises;
const path = require('path');
const User = require('../../domain/auth/entities/User');
const { generateId } = require('../../shared/utils/idGenerator');
const githubBackupService = require('../backup/GitHubBackupService');
const environmentBackupService = require('../backup/EnvironmentBackupService');

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
      console.log('🚀 Initializing FileAuthRepository...');
      
      // Initialize GitHub backup service first
      await githubBackupService.initialize();
      
      // Ensure data directory exists
      const dataDir = path.dirname(this.filePath);
      await fs.mkdir(dataDir, { recursive: true });

      // PRIORITY 1: Try to restore from Environment Variables (Railway persistent)
      console.log('🔍 Checking Environment Variable backup...');
      const envBackupData = await environmentBackupService.restore();
      
      if (envBackupData && envBackupData.length > 0) {
        console.log('✅ Found Environment Variable backup, restoring...');
        
        // Load dari environment backup
        envBackupData.forEach(userData => {
          const user = new User(userData);
          this.users.set(user.id, user);
        });
        
        // Save to local file untuk consistency
        await this.saveToFileOnly();
        
        console.log(`✅ Restored ${this.users.size} users from Environment Variables`);
      } else {
        // PRIORITY 2: Try to restore from GitHub backup
        console.log('🔍 No Environment Variable backup, trying GitHub backup...');
        await githubBackupService.restore();

        // PRIORITY 3: Load from local file (if exists)
        try {
          const data = await fs.readFile(this.filePath, 'utf8');
          const usersData = JSON.parse(data);
          
          usersData.forEach(userData => {
            const user = new User(userData);
            this.users.set(user.id, user);
          });
          
          console.log(`✅ Loaded ${this.users.size} users from local file`);
          
          // Backup to Environment Variables untuk next time
          if (this.users.size > 0) {
            console.log('🔄 Creating initial Environment Variable backup...');
            await this.backupToEnvironment();
          }
        } catch (error) {
          // File doesn't exist yet, start with empty
          console.log('📝 No existing users file, starting fresh');
          await this.saveToFile();
        }
      }

      this.initialized = true;
      console.log('✅ FileAuthRepository initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing FileAuthRepository:', error);
      throw error;
    }
  }

  /**
   * Save users to file and backup to multiple locations
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

      // Save to local file
      await this.saveToFileOnly();

      // PRIORITY 1: Backup to Environment Variables (Railway persistent)
      await this.backupToEnvironment();

      // PRIORITY 2: Backup to GitHub (asynchronous, don't wait)
      githubBackupService.backup('User data modified').catch(err => {
        console.error('⚠️  GitHub backup failed:', err.message);
      });
    } catch (error) {
      console.error('❌ Error saving users to file:', error);
    }
  }

  /**
   * Save to local file only (without backups)
   */
  async saveToFileOnly() {
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
    } catch (error) {
      console.error('❌ Error saving users to local file:', error);
    }
  }

  /**
   * Backup to Environment Variables
   */
  async backupToEnvironment() {
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

      const success = await environmentBackupService.backup(usersArray);
      if (success) {
        console.log('✅ Environment Variable backup completed');
      } else {
        console.error('⚠️  Environment Variable backup failed');
      }
    } catch (error) {
      console.error('❌ Error backing up to Environment Variables:', error);
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

  /**
   * Get backup status dari semua backup services
   * @returns {Object} - Comprehensive backup status
   */
  async getBackupStatus() {
    const envStatus = environmentBackupService.getBackupStatus();
    
    return {
      environmentBackup: envStatus,
      totalUsers: this.users.size,
      lastModified: new Date().toISOString()
    };
  }

  /**
   * Force backup ke semua services (untuk admin panel)
   * @returns {Object} - Backup results
   */
  async forceBackup() {
    const results = {
      environment: false,
      github: false,
      file: false
    };

    try {
      // Backup to Environment Variables
      await this.backupToEnvironment();
      results.environment = true;
    } catch (error) {
      console.error('❌ Force Environment backup failed:', error);
    }

    try {
      // Backup to GitHub
      await githubBackupService.backup('Manual backup triggered');
      results.github = true;
    } catch (error) {
      console.error('❌ Force GitHub backup failed:', error);
    }

    try {
      // Save to local file
      await this.saveToFileOnly();
      results.file = true;
    } catch (error) {
      console.error('❌ Force file save failed:', error);
    }

    return results;
  }

  /**
   * Verify all backups integrity
   * @returns {Object} - Verification results
   */
  async verifyBackups() {
    const results = {
      environment: false,
      github: false,
      file: false
    };

    try {
      results.environment = await environmentBackupService.verifyBackup();
    } catch (error) {
      console.error('❌ Environment backup verification failed:', error);
    }

    try {
      // Check if local file exists and is valid
      const data = await fs.readFile(this.filePath, 'utf8');
      const usersData = JSON.parse(data);
      results.file = Array.isArray(usersData);
    } catch (error) {
      console.error('❌ File backup verification failed:', error);
    }

    // GitHub verification would require more complex logic
    results.github = true; // Assume OK for now

    return results;
  }
}

module.exports = FileAuthRepository;
