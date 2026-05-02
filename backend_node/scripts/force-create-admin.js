/**
 * Force Create Admin User Script
 * This will overwrite existing admin user if exists
 * Run this on Railway to ensure admin user is created correctly
 */

const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

async function forceCreateAdmin() {
  try {
    console.log('🔧 Force creating admin user...');
    
    const dataDir = path.join(__dirname, '../data');
    const usersFile = path.join(dataDir, 'users.json');

    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Read existing users
    let users = [];
    try {
      const data = await fs.readFile(usersFile, 'utf8');
      users = JSON.parse(data);
      console.log(`📋 Found ${users.length} existing users`);
    } catch (error) {
      console.log('📝 No existing users file');
    }

    // Remove existing admin user if exists
    users = users.filter(u => u.username !== 'adminresta');
    console.log(`🗑️  Removed old admin user (if existed)`);

    // Hash password
    const passwordHash = await bcrypt.hash('adminresta123', 10);
    console.log('🔐 Password hashed');

    // Create new admin user
    const adminUser = {
      id: 'admin_' + Date.now(),
      username: 'adminresta',
      passwordHash,
      email: 'admin@stellargames.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    };

    // Add to users array
    users.push(adminUser);

    // Save to file
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf8');

    console.log('✅ Admin user created successfully!');
    console.log('📧 Username: adminresta');
    console.log('🔑 Password: adminresta123');
    console.log(`👤 User ID: ${adminUser.id}`);
    console.log(`📊 Total users: ${users.length}`);
    
    // Also log the hash for verification
    console.log(`🔐 Password hash: ${passwordHash.substring(0, 20)}...`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

forceCreateAdmin();
