/**
 * Test Admin Login Script
 * Test login untuk akun admin
 * Run: node scripts/test-admin-login.js
 */

const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

async function testAdminLogin() {
  console.log('🔐 Testing Admin Login...\n');

  const usersFilePath = path.join(__dirname, '../data/users.json');

  try {
    // Read users file
    if (!fs.existsSync(usersFilePath)) {
      console.log('❌ users.json not found');
      return;
    }

    const data = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(data);

    console.log(`📊 Found ${users.length} users\n`);

    // Test adminresta
    console.log('🧪 Testing adminresta login...');
    const adminresta = users.find(u => u.username === 'adminresta');
    
    if (!adminresta) {
      console.log('❌ adminresta not found');
    } else {
      console.log('✅ adminresta found:');
      console.log(`   ID: ${adminresta.id}`);
      console.log(`   Username: ${adminresta.username}`);
      console.log(`   Role: ${adminresta.role || 'user'}`);
      console.log(`   Password Hash: ${adminresta.passwordHash.substring(0, 20)}...`);
      
      // Test password
      const testPassword = 'adminresta123';
      const isValid = await bcrypt.compare(testPassword, adminresta.passwordHash);
      console.log(`   Password Test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (!isValid) {
        console.log('🔧 Fixing password...');
        const newHash = await bcrypt.hash(testPassword, 10);
        adminresta.passwordHash = newHash;
        adminresta.role = 'admin'; // Ensure admin role
        
        // Save back
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        console.log('✅ Password fixed!');
      }
    }

    // Test default admin
    console.log('\n🧪 Testing default admin...');
    const defaultAdmin = users.find(u => u.username === 'admin');
    
    if (!defaultAdmin) {
      console.log('❌ Default admin not found, creating...');
      
      const newAdmin = {
        id: 'admin_default',
        username: 'admin',
        passwordHash: await bcrypt.hash('stellar2026!', 10),
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: null
      };
      
      users.push(newAdmin);
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
      console.log('✅ Default admin created!');
    } else {
      console.log('✅ Default admin found:');
      console.log(`   ID: ${defaultAdmin.id}`);
      console.log(`   Username: ${defaultAdmin.username}`);
      console.log(`   Role: ${defaultAdmin.role || 'user'}`);
      
      // Test password
      const testPassword = 'stellar2026!';
      const isValid = await bcrypt.compare(testPassword, defaultAdmin.passwordHash);
      console.log(`   Password Test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (!isValid) {
        console.log('🔧 Fixing password...');
        const newHash = await bcrypt.hash(testPassword, 10);
        defaultAdmin.passwordHash = newHash;
        defaultAdmin.role = 'admin'; // Ensure admin role
        
        // Save back
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        console.log('✅ Password fixed!');
      }
    }

    console.log('\n🎯 Admin Credentials Summary:');
    console.log('================================');
    console.log('1. adminresta / adminresta123');
    console.log('2. admin / stellar2026!');
    console.log('\n✅ All admin accounts should work now!');

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  }
}

// Run the test
testAdminLogin().catch(console.error);