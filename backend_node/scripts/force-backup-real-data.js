/**
 * Force Backup Real User Data
 * Backup data users yang sebenarnya ke Environment Variables
 * Run: node scripts/force-backup-real-data.js
 */

const path = require('path');
const fs = require('fs');
const environmentBackupService = require('../src/infrastructure/backup/EnvironmentBackupService');

async function forceBackupRealData() {
  console.log('🔄 Force Backup Real User Data...\n');

  const usersFilePath = path.join(__dirname, '../data/users.json');

  try {
    // Read current users file
    if (!fs.existsSync(usersFilePath)) {
      console.log('❌ users.json not found');
      return;
    }

    const data = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(data);

    console.log(`📊 Found ${users.length} real users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.role || 'user'})`);
    });

    // Force backup to Environment Variables
    console.log('\n🔄 Backing up to Environment Variables...');
    const success = await environmentBackupService.backup(users);

    if (success) {
      console.log('✅ Real user data backed up successfully!');
      
      // Verify backup
      console.log('\n🔍 Verifying backup...');
      const restored = await environmentBackupService.restore();
      
      if (restored && restored.length === users.length) {
        console.log(`✅ Backup verified: ${restored.length} users`);
        restored.forEach((user, index) => {
          console.log(`${index + 1}. ${user.username} (${user.role || 'user'})`);
        });
      } else {
        console.log('❌ Backup verification failed');
      }
    } else {
      console.log('❌ Backup failed');
    }

    console.log('\n🎯 Admin accounts in backup:');
    const adminUsers = users.filter(u => u.role === 'admin');
    if (adminUsers.length > 0) {
      adminUsers.forEach(admin => {
        console.log(`👑 ${admin.username} (ID: ${admin.id})`);
      });
    } else {
      console.log('⚠️  No admin users found');
    }

  } catch (error) {
    console.error('❌ Error forcing backup:', error);
  }
}

// Run the backup
forceBackupRealData().catch(console.error);