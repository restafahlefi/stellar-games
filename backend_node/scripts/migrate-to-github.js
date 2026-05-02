#!/usr/bin/env node

/**
 * Migration Script: Migrate Existing User Data to GitHub Backup
 * 
 * This script migrates existing users.json to the new GitHub backup system.
 * Run this ONCE after setting up GitHub backup configuration.
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const githubBackupService = require('../src/infrastructure/backup/GitHubBackupService');

async function main() {
  console.log('\n🔄 Stellar Games - User Data Migration to GitHub\n');

  try {
    // Check if GitHub is configured
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO_URL) {
      console.error('❌ GitHub backup not configured!');
      console.error('   Please set GITHUB_TOKEN and GITHUB_REPO_URL in your .env file');
      console.error('   Run: node scripts/setup-github-backup.js\n');
      process.exit(1);
    }

    console.log('✅ GitHub configuration found');
    console.log(`   Repository: ${process.env.GITHUB_REPO_URL}`);
    console.log(`   Branch: ${process.env.GITHUB_BRANCH || 'main'}\n`);

    // Initialize GitHub backup service
    console.log('🔄 Initializing GitHub backup service...');
    await githubBackupService.initialize();

    const status = githubBackupService.getStatus();
    if (!status.initialized) {
      console.error('❌ Failed to initialize GitHub backup service');
      process.exit(1);
    }
    console.log('✅ GitHub backup service initialized\n');

    // Check if users.json exists
    const usersFilePath = path.join(__dirname, '../data/users.json');
    let usersExist = false;
    let userCount = 0;

    try {
      await fs.access(usersFilePath);
      const data = await fs.readFile(usersFilePath, 'utf8');
      const users = JSON.parse(data);
      userCount = users.length;
      usersExist = true;
      console.log(`📊 Found ${userCount} existing users in users.json`);
    } catch (error) {
      console.log('📝 No existing users.json found - starting fresh');
    }

    // Create pre-migration backup
    if (usersExist && userCount > 0) {
      console.log('\n💾 Creating pre-migration backup...');
      const backupDir = path.join(__dirname, '../data/backups');
      await fs.mkdir(backupDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `users-pre-migration-${timestamp}.json`);
      await fs.copyFile(usersFilePath, backupPath);
      console.log(`✅ Pre-migration backup saved: ${backupPath}`);
    }

    // Perform initial backup to GitHub
    console.log('\n⬆️  Pushing user data to GitHub...');
    const result = await githubBackupService.backup('Initial migration to GitHub backup system');

    if (result.success) {
      console.log('✅ Migration successful!');
      console.log(`   ${userCount} users backed up to GitHub`);
      console.log(`   Timestamp: ${result.timestamp || new Date().toISOString()}\n`);
      
      console.log('🎉 Migration Complete!\n');
      console.log('📋 What happens now:');
      console.log('   ✅ User data is now backed up to GitHub');
      console.log('   ✅ Data will persist across Railway redeployments');
      console.log('   ✅ Automatic backups on every user registration/update');
      console.log('   ✅ Data restored automatically on server startup\n');
      
      console.log('⚠️  Important Notes:');
      console.log('   - Keep your GitHub token secure');
      console.log('   - Never commit .env files to git');
      console.log('   - Your GitHub repository should be PRIVATE\n');
    } else {
      console.error('❌ Migration failed:', result.message);
      console.error('\n🔍 Troubleshooting:');
      console.error('   1. Check your GitHub token has "repo" scope');
      console.error('   2. Verify the repository URL is correct');
      console.error('   3. Ensure the repository exists and is accessible');
      console.error('   4. Check your internet connection\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
