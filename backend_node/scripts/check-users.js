/**
 * Script to check users in users.json
 * Run: node scripts/check-users.js
 */

const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

console.log('🔍 Checking users data...\n');
console.log('File path:', usersFilePath);

try {
  // Check if file exists
  if (!fs.existsSync(usersFilePath)) {
    console.log('❌ users.json does NOT exist');
    console.log('📝 This is normal for first run');
    console.log('💡 File will be created when first user registers\n');
    process.exit(0);
  }

  // Read file
  const data = fs.readFileSync(usersFilePath, 'utf8');
  const users = JSON.parse(data);

  console.log('✅ users.json exists');
  console.log(`📊 Total users: ${users.length}\n`);

  if (users.length === 0) {
    console.log('📝 No users registered yet\n');
  } else {
    console.log('👥 Registered users:');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Username: ${user.username}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Last Login: ${user.lastLoginAt || 'Never'}`);
    });
    console.log('');
  }

} catch (error) {
  console.error('❌ Error reading users.json:', error.message);
  process.exit(1);
}
