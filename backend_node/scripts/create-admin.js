/**
 * Create Admin User Script
 * Run this once to create the admin user
 * Usage: node scripts/create-admin.js
 */

const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

async function createAdmin() {
  try {
    const dataDir = path.join(__dirname, '../data');
    const usersFile = path.join(dataDir, 'users.json');

    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Read existing users
    let users = [];
    try {
      const data = await fs.readFile(usersFile, 'utf8');
      users = JSON.parse(data);
    } catch (error) {
      console.log('📝 No existing users file, creating new one');
    }

    // Check if admin already exists
    const adminExists = users.some(u => u.username === 'adminresta');
    if (adminExists) {
      console.log('⚠️  Admin user already exists!');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash('adminresta123', 10);

    // Create admin user
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
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdmin();
