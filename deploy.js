#!/usr/bin/env node

/**
 * Simple Railway Deployment Trigger
 * Updates .railway-deploy file to force new deployment
 */

const fs = require('fs');
const path = require('path');

function updateDeploymentTrigger(message = 'Manual deployment') {
  const timestamp = new Date().toISOString();
  const deploymentId = `deploy-${Date.now()}`;
  
  const content = `# Railway Deployment Trigger
# Timestamp: ${timestamp}
# This file forces Railway to detect new deployment

DEPLOYMENT_ID=${deploymentId}
TIMESTAMP=${timestamp}
BUILD_TYPE=DOCKER
COMMIT_MESSAGE=${message}
STATUS=PENDING_DEPLOYMENT

# Changes in this deployment:
# - ${message}
# - Updated at ${new Date().toLocaleString()}
`;

  const filePath = path.join(__dirname, '.railway-deploy');
  
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Railway deployment triggered!');
    console.log('🚀 Deployment ID:', deploymentId);
    console.log('📝 Message:', message);
    console.log('⏰ Timestamp:', timestamp);
    console.log('');
    console.log('🌐 Check deployment status at: https://railway.app/');
    console.log('🔗 Website will be available at: https://stellargame.up.railway.app/');
    console.log('');
    console.log('⚠️  Note: Deployment takes ~10 minutes. Test in incognito mode after deployment.');
  } catch (error) {
    console.error('❌ Failed to trigger deployment:', error.message);
    process.exit(1);
  }
}

// Get message from command line argument
const message = process.argv[2] || 'Manual deployment';
updateDeploymentTrigger(message);