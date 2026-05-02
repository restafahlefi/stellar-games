#!/usr/bin/env node

/**
 * GitHub Backup Setup Script
 * 
 * This script helps you set up GitHub backup for user data persistence.
 * It will guide you through creating a private GitHub repository and
 * configuring the necessary environment variables.
 */

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚀 Stellar Games - GitHub Backup Setup\n');
  console.log('This script will help you configure GitHub backup for user data persistence.\n');
  
  console.log('📋 Prerequisites:');
  console.log('1. A GitHub account');
  console.log('2. A private GitHub repository for storing user data');
  console.log('3. A GitHub Personal Access Token with "repo" scope\n');
  
  const proceed = await question('Do you want to continue? (y/n): ');
  if (proceed.toLowerCase() !== 'y') {
    console.log('Setup cancelled.');
    rl.close();
    return;
  }

  console.log('\n📝 Step 1: Create a Private GitHub Repository');
  console.log('   Go to: https://github.com/new');
  console.log('   - Repository name: stellar-games-data (or any name you prefer)');
  console.log('   - Visibility: PRIVATE (important!)');
  console.log('   - Do NOT initialize with README, .gitignore, or license\n');
  
  await question('Press Enter when you have created the repository...');

  console.log('\n🔑 Step 2: Generate a Personal Access Token');
  console.log('   Go to: https://github.com/settings/tokens/new');
  console.log('   - Note: Stellar Games Data Backup');
  console.log('   - Expiration: No expiration (or 1 year)');
  console.log('   - Scopes: Check "repo" (Full control of private repositories)');
  console.log('   - Click "Generate token" and COPY the token\n');
  
  await question('Press Enter when you have generated the token...');

  console.log('\n⚙️  Step 3: Configure Environment Variables\n');
  
  const githubToken = await question('Enter your GitHub Personal Access Token: ');
  const githubUsername = await question('Enter your GitHub username: ');
  const repoName = await question('Enter your repository name (e.g., stellar-games-data): ');
  const githubRepoUrl = `https://github.com/${githubUsername}/${repoName}.git`;
  const githubBranch = await question('Enter branch name (default: main): ') || 'main';

  console.log('\n📄 Generating .env file...\n');

  const envContent = `# Server Configuration
PORT=5000
NODE_ENV=production

# GitHub Backup Configuration
GITHUB_TOKEN=${githubToken}
GITHUB_REPO_URL=${githubRepoUrl}
GITHUB_BRANCH=${githubBranch}
GITHUB_USERNAME=${githubUsername}
GITHUB_EMAIL=${githubUsername}@users.noreply.github.com

# JWT Configuration
JWT_SECRET=${generateRandomSecret()}
JWT_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=https://stellargame.up.railway.app

# Admin Configuration (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$placeholder-change-this-in-production
`;

  const envPath = path.join(__dirname, '../.env.production');
  await fs.writeFile(envPath, envContent, 'utf8');

  console.log('✅ .env.production file created!\n');
  console.log('📋 Next Steps:\n');
  console.log('1. Copy the environment variables to Railway:');
  console.log('   - Go to your Railway project dashboard');
  console.log('   - Click on "Variables" tab');
  console.log('   - Add each variable from .env.production\n');
  console.log('2. Deploy your application to Railway');
  console.log('3. User data will now persist across redeployments!\n');
  console.log('⚠️  IMPORTANT: Keep your .env.production file secure and do NOT commit it to git!\n');
  console.log('✅ Setup complete!\n');

  rl.close();
}

function generateRandomSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

main().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});
