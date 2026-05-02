#!/bin/sh
# Startup script for Railway deployment
# Creates admin user before starting server

echo "🚀 Starting Stellar Games Backend..."

# Create admin user (will overwrite if exists)
echo "👤 Creating admin user..."
node scripts/force-create-admin.js

# Start the server
echo "🎮 Starting server..."
node src/index.js
