const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');

/**
 * GitHub Backup Service
 * Automatically backs up users.json to a private GitHub repository
 * Solves Railway ephemeral filesystem issue
 */
class GitHubBackupService {
  constructor() {
    this.repoPath = path.join(__dirname, '../../../data');
    this.usersFilePath = path.join(this.repoPath, 'users.json');
    this.git = null;
    this.isInitialized = false;
    this.isBackupInProgress = false;
    this.backupQueue = [];
    
    // GitHub configuration from environment variables
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubRepoUrl = process.env.GITHUB_REPO_URL;
    this.githubBranch = process.env.GITHUB_BRANCH || 'main';
    this.githubUsername = process.env.GITHUB_USERNAME || 'stellar-games-bot';
    this.githubEmail = process.env.GITHUB_EMAIL || 'bot@stellargames.com';
  }

  /**
   * Initialize GitHub repository
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Initializing GitHub Backup Service...');

      // Validate environment variables
      if (!this.githubToken || !this.githubRepoUrl) {
        console.warn('⚠️  GitHub backup disabled: Missing GITHUB_TOKEN or GITHUB_REPO_URL');
        console.warn('⚠️  User data will NOT persist across Railway redeployments!');
        return;
      }

      // Ensure data directory exists
      await fs.mkdir(this.repoPath, { recursive: true });

      // Initialize git
      this.git = simpleGit(this.repoPath);

      // Configure git user
      await this.git.addConfig('user.name', this.githubUsername);
      await this.git.addConfig('user.email', this.githubEmail);

      // Check if .git exists
      const gitDir = path.join(this.repoPath, '.git');
      let gitExists = false;
      try {
        await fs.access(gitDir);
        gitExists = true;
      } catch (error) {
        gitExists = false;
      }

      if (!gitExists) {
        console.log('📦 Initializing new git repository...');
        await this.git.init();
        
        // Add remote with authentication token
        const authenticatedUrl = this.githubRepoUrl.replace(
          'https://',
          `https://${this.githubToken}@`
        );
        await this.git.addRemote('origin', authenticatedUrl);
        
        // Try to pull existing data from GitHub
        try {
          console.log('⬇️  Pulling existing data from GitHub...');
          await this.git.pull('origin', this.githubBranch, ['--allow-unrelated-histories']);
          console.log('✅ Successfully pulled existing data from GitHub');
        } catch (pullError) {
          console.log('📝 No existing data on GitHub, starting fresh');
        }
      } else {
        console.log('📂 Git repository already exists');
        
        // Update remote URL with token (in case it changed)
        try {
          const authenticatedUrl = this.githubRepoUrl.replace(
            'https://',
            `https://${this.githubToken}@`
          );
          await this.git.removeRemote('origin');
          await this.git.addRemote('origin', authenticatedUrl);
        } catch (error) {
          // Remote might not exist, add it
          const authenticatedUrl = this.githubRepoUrl.replace(
            'https://',
            `https://${this.githubToken}@`
          );
          await this.git.addRemote('origin', authenticatedUrl);
        }
        
        // Pull latest changes
        try {
          console.log('⬇️  Pulling latest changes from GitHub...');
          await this.git.pull('origin', this.githubBranch);
          console.log('✅ Successfully pulled latest changes');
        } catch (pullError) {
          console.log('⚠️  Could not pull from GitHub:', pullError.message);
        }
      }

      // Create .gitignore if it doesn't exist
      const gitignorePath = path.join(this.repoPath, '.gitignore');
      try {
        await fs.access(gitignorePath);
      } catch (error) {
        await fs.writeFile(gitignorePath, '# Ignore nothing - we want to backup everything\n', 'utf8');
      }

      this.isInitialized = true;
      console.log('✅ GitHub Backup Service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing GitHub Backup Service:', error);
      console.warn('⚠️  Backup service disabled - data will NOT persist across redeployments!');
    }
  }

  /**
   * Backup users.json to GitHub
   */
  async backup(reason = 'User data updated') {
    if (!this.isInitialized || !this.git) {
      console.warn('⚠️  GitHub backup skipped: Service not initialized');
      return { success: false, message: 'Backup service not initialized' };
    }

    // If backup is in progress, queue this request
    if (this.isBackupInProgress) {
      console.log('⏳ Backup already in progress, queuing...');
      return new Promise((resolve) => {
        this.backupQueue.push({ reason, resolve });
      });
    }

    this.isBackupInProgress = true;

    try {
      console.log(`🔄 Starting backup: ${reason}`);

      // Check if users.json exists
      try {
        await fs.access(this.usersFilePath);
      } catch (error) {
        console.log('📝 users.json does not exist yet, creating empty file');
        await fs.writeFile(this.usersFilePath, '[]', 'utf8');
      }

      // Add users.json to git
      await this.git.add('users.json');

      // Check if there are changes to commit
      const status = await this.git.status();
      if (status.files.length === 0) {
        console.log('✅ No changes to backup');
        this.isBackupInProgress = false;
        this.processQueue();
        return { success: true, message: 'No changes to backup' };
      }

      // Commit changes
      const timestamp = new Date().toISOString();
      const commitMessage = `[AUTO-BACKUP] ${reason} - ${timestamp}`;
      await this.git.commit(commitMessage);

      // Push to GitHub with retry logic
      let pushSuccess = false;
      let lastError = null;
      const maxRetries = 3;
      const retryDelays = [5000, 10000, 20000]; // 5s, 10s, 20s

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          console.log(`⬆️  Pushing to GitHub (attempt ${attempt + 1}/${maxRetries})...`);
          await this.git.push('origin', this.githubBranch);
          pushSuccess = true;
          console.log('✅ Successfully pushed to GitHub');
          break;
        } catch (pushError) {
          lastError = pushError;
          console.error(`❌ Push attempt ${attempt + 1} failed:`, pushError.message);
          
          if (attempt < maxRetries - 1) {
            const delay = retryDelays[attempt];
            console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      this.isBackupInProgress = false;

      if (pushSuccess) {
        this.processQueue();
        return { 
          success: true, 
          message: 'Backup successful',
          timestamp 
        };
      } else {
        console.error('❌ All push attempts failed:', lastError?.message);
        this.processQueue();
        return { 
          success: false, 
          message: `Backup failed after ${maxRetries} attempts: ${lastError?.message}` 
        };
      }
    } catch (error) {
      console.error('❌ Error during backup:', error);
      this.isBackupInProgress = false;
      this.processQueue();
      return { 
        success: false, 
        message: `Backup error: ${error.message}` 
      };
    }
  }

  /**
   * Process queued backup requests
   */
  processQueue() {
    if (this.backupQueue.length > 0) {
      console.log(`📋 Processing ${this.backupQueue.length} queued backup(s)...`);
      
      // Take the last queued request (most recent)
      const { reason, resolve } = this.backupQueue.pop();
      
      // Clear the rest of the queue (they're redundant)
      this.backupQueue = [];
      
      // Execute the backup
      this.backup(reason).then(resolve);
    }
  }

  /**
   * Restore users.json from GitHub (called on startup)
   */
  async restore() {
    if (!this.isInitialized || !this.git) {
      console.warn('⚠️  GitHub restore skipped: Service not initialized');
      return { success: false, message: 'Backup service not initialized' };
    }

    try {
      console.log('🔄 Restoring user data from GitHub...');

      // Pull latest changes
      await this.git.pull('origin', this.githubBranch);

      // Check if users.json exists
      try {
        await fs.access(this.usersFilePath);
        const stats = await fs.stat(this.usersFilePath);
        console.log(`✅ Restored users.json (${stats.size} bytes)`);
        return { success: true, message: 'Data restored successfully' };
      } catch (error) {
        console.log('📝 No users.json found, starting with empty database');
        return { success: true, message: 'No existing data to restore' };
      }
    } catch (error) {
      console.error('❌ Error restoring from GitHub:', error);
      return { 
        success: false, 
        message: `Restore error: ${error.message}` 
      };
    }
  }

  /**
   * Get backup status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      backupInProgress: this.isBackupInProgress,
      queuedBackups: this.backupQueue.length,
      configured: !!(this.githubToken && this.githubRepoUrl)
    };
  }
}

// Singleton instance
const githubBackupService = new GitHubBackupService();

module.exports = githubBackupService;
