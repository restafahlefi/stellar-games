/**
 * Fix Admin Role Script
 * Memastikan akun adminresta memiliki role admin
 * Run: node scripts/fix-admin-role.js
 */

const path = require('path');
const fs = require('fs');

async function fixAdminRole() {
  console.log('🔧 Fixing admin role for adminresta...\n');

  const usersFilePath = path.join(__dirname, '../data/users.json');

  try {
    // Read users file
    if (!fs.existsSync(usersFilePath)) {
      console.log('❌ users.json not found');
      return;
    }

    const data = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(data);

    console.log(`📊 Found ${users.length} users`);

    // Find adminresta
    const adminUser = users.find(user => user.username === 'adminresta');

    if (!adminUser) {
      console.log('❌ adminresta user not found');
      return;
    }

    console.log('👤 Found adminresta user:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Current Role: ${adminUser.role || 'user'}`);
    console.log(`   Created: ${adminUser.createdAt}`);

    // Check if already admin
    if (adminUser.role === 'admin') {
      console.log('✅ adminresta already has admin role!');
      return;
    }

    // Update role to admin
    adminUser.role = 'admin';

    // Save back to file
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    console.log('✅ Successfully updated adminresta role to admin!');
    console.log('\n🎯 Admin credentials:');
    console.log('   Username: adminresta');
    console.log('   Password: adminresta123');
    console.log('   Role: admin');

  } catch (error) {
    console.error('❌ Error fixing admin role:', error);
  }
}

// Run the fix
fixAdminRole().catch(console.error);