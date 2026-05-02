#!/usr/bin/env node

/**
 * Test Admin Bypass System
 * Verifies that the emergency admin bypass routes are working
 */

// Test configuration
const BASE_URL = process.env.TEST_URL || 'https://stellargame.up.railway.app';
const API_URL = `${BASE_URL}/api/v1`;

// Admin credentials to test
const ADMIN_CREDENTIALS = [
  { username: 'admin', password: 'stellar2026!' },
  { username: 'adminresta', password: 'adminresta123' }
];

async function testHealthEndpoint() {
  console.log('🧪 Testing health endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed:', data.message);
      return true;
    } else {
      console.log('❌ Health check failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    return false;
  }
}

async function testAdminBypassLogin(username, password) {
  console.log(`🔐 Testing admin bypass login for: ${username}`);
  
  try {
    const url = `${API_URL}/admin-bypass/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    console.log('🌐 Request URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success && data.adminKey) {
        console.log(`✅ Admin bypass login successful for ${username}!`);
        console.log(`🔑 Admin key: ${data.adminKey}`);
        return data.adminKey;
      } else {
        console.log(`❌ Admin bypass login failed for ${username}: Invalid response`);
        return null;
      }
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.log(`❌ Admin bypass login failed for ${username}:`, errorData);
      return null;
    }
  } catch (error) {
    console.error(`❌ Admin bypass login error for ${username}:`, error.message);
    return null;
  }
}

async function testAdminBypassStats(adminKey) {
  console.log('📊 Testing admin bypass stats...');
  
  try {
    const url = `${API_URL}/admin-bypass/stats?adminKey=${adminKey}`;
    
    const response = await fetch(url, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Admin bypass stats successful:', data.data);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.log('❌ Admin bypass stats failed:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Admin bypass stats error:', error.message);
    return false;
  }
}

async function testAdminBypassUsers(adminKey) {
  console.log('👥 Testing admin bypass users...');
  
  try {
    const url = `${API_URL}/admin-bypass/users?adminKey=${adminKey}`;
    
    const response = await fetch(url, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Admin bypass users successful:', `Found ${data.data.length} users`);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.log('❌ Admin bypass users failed:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Admin bypass users error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚨 ADMIN BYPASS SYSTEM TEST');
  console.log('=' .repeat(50));
  console.log('🌐 Base URL:', BASE_URL);
  console.log('🔗 API URL:', API_URL);
  console.log('');
  
  // Test 1: Health check
  const healthOk = await testHealthEndpoint();
  if (!healthOk) {
    console.log('❌ Cannot proceed - server is not responding');
    process.exit(1);
  }
  
  console.log('');
  
  // Test 2: Admin bypass login for each credential
  let workingAdminKey = null;
  let workingUsername = null;
  
  for (const cred of ADMIN_CREDENTIALS) {
    const adminKey = await testAdminBypassLogin(cred.username, cred.password);
    if (adminKey) {
      workingAdminKey = adminKey;
      workingUsername = cred.username;
      break;
    }
    console.log('');
  }
  
  if (!workingAdminKey) {
    console.log('❌ CRITICAL: No admin credentials are working!');
    console.log('');
    console.log('🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Check if deployment is complete (~10 minutes)');
    console.log('2. Test in incognito/private browser mode');
    console.log('3. Check Railway deployment logs');
    console.log('4. Verify admin bypass routes are registered');
    process.exit(1);
  }
  
  console.log('');
  
  // Test 3: Admin bypass endpoints with working key
  console.log(`🔑 Using working admin key from: ${workingUsername}`);
  console.log('');
  
  const statsOk = await testAdminBypassStats(workingAdminKey);
  console.log('');
  
  const usersOk = await testAdminBypassUsers(workingAdminKey);
  console.log('');
  
  // Final results
  console.log('📋 TEST RESULTS:');
  console.log('=' .repeat(30));
  console.log(`✅ Health Check: ${healthOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Admin Login: ${workingAdminKey ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Admin Stats: ${statsOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Admin Users: ${usersOk ? 'PASS' : 'FAIL'}`);
  console.log('');
  
  if (healthOk && workingAdminKey && statsOk && usersOk) {
    console.log('🎉 ALL TESTS PASSED! Admin bypass system is working.');
    console.log('');
    console.log('🌐 You can now access admin panel at:');
    console.log(`   ${BASE_URL}`);
    console.log('');
    console.log('👑 Admin login steps:');
    console.log('1. Click "Admin Access" in login modal');
    console.log(`2. Enter username: ${workingUsername}`);
    console.log('3. Enter the correct password');
    console.log('4. Admin panel will open automatically');
  } else {
    console.log('❌ SOME TESTS FAILED! Check the errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});