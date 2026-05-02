/**
 * Debug Admin Authentication
 * Test admin authentication step by step
 * Run: node scripts/debug-admin-auth.js
 */

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Import admin service
const AdminService = require('../src/domain/admin/services/AdminService');
const FileAuthRepository = require('../src/infrastructure/persistence/FileAuthRepository');

async function debugAdminAuth() {
  console.log('🔍 Debugging Admin Authentication...\n');

  try {
    // Initialize repository
    const authRepository = new FileAuthRepository();
    await authRepository.initialize();
    
    // Initialize admin service
    const adminService = new AdminService(authRepository);

    // Test credentials
    const testCredentials = [
      { username: 'admin', password: 'stellar2026!' },
      { username: 'adminresta', password: 'adminresta123' }
    ];

    for (const cred of testCredentials) {
      console.log(`🧪 Testing: ${cred.username} / ${cred.password}`);
      
      try {
        const isValid = await adminService.authenticateAdmin(cred.username, cred.password);
        console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        
        if (!isValid) {
          // Debug further
          console.log('   🔍 Debugging further...');
          
          // Check if user exists in database
          const user = await authRepository.findByUsername(cred.username);
          if (!user) {
            console.log('   ❌ User not found in database');
          } else {
            console.log(`   ✅ User found: ${user.username}`);
            console.log(`   📋 Role: ${user.role || 'user'}`);
            console.log(`   🔐 Password Hash: ${user.passwordHash.substring(0, 20)}...`);
            
            // Test password manually
            const passwordMatch = await bcrypt.compare(cred.password, user.passwordHash);
            console.log(`   🔑 Password Match: ${passwordMatch ? '✅ YES' : '❌ NO'}`);
            
            if (!passwordMatch) {
              console.log('   🔧 Fixing password...');
              const newHash = await bcrypt.hash(cred.password, 10);
              user.passwordHash = newHash;
              user.role = 'admin';
              await authRepository.updateUser(user.id, { passwordHash: newHash, role: 'admin' });
              console.log('   ✅ Password fixed!');
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log('');
    }

    // Test again after fixes
    console.log('🔄 Testing again after fixes...\n');
    
    for (const cred of testCredentials) {
      console.log(`🧪 Re-testing: ${cred.username} / ${cred.password}`);
      
      try {
        const isValid = await adminService.authenticateAdmin(cred.username, cred.password);
        console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n🎯 Admin Authentication Debug Complete!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run debug
debugAdminAuth().catch(console.error);