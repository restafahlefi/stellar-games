const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Initialize seed data
const container = require('./infrastructure/di/container');
const { seedGames } = require('./infrastructure/seeders/gameSeed');
const { seedPlayers } = require('./infrastructure/seeders/playerSeed');

// Initialize Leaderboard Scheduler
const LeaderboardScheduler = require('./infrastructure/schedulers/LeaderboardScheduler');
const leaderboardScheduler = new LeaderboardScheduler(container.scoreRepository);

// Start scheduler
leaderboardScheduler.start();

// Make scheduler available globally for admin endpoints
app.locals.leaderboardScheduler = leaderboardScheduler;

// Seed games and players on startup
seedGames(container.gameService).catch(console.error);
seedPlayers(container.playerService).catch(console.error);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Stellar Games API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint - list all registered routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = middleware.regexp.source.replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/');
          routes.push({
            path: path + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
});

// Leaderboard reset info endpoint
app.get('/api/v1/leaderboard/reset-info', (req, res) => {
  const resetInfo = leaderboardScheduler.getResetInfo();
  res.json({
    success: true,
    data: resetInfo
  });
});

// Manual reset endpoint (untuk admin)
app.post('/api/v1/admin/leaderboard/reset', async (req, res) => {
  const result = await leaderboardScheduler.manualReset();
  res.json(result);
});

// API Routes
console.log('📍 Registering API routes...');
app.use('/api/v1/games', require('./interfaces/http/routes/gameRoutes'));
console.log('✅ Games routes registered');
app.use('/api/v1/players', require('./interfaces/http/routes/playerRoutes'));
console.log('✅ Players routes registered');
app.use('/api/v1/leaderboard', require('./interfaces/http/routes/leaderboardRoutes'));
console.log('✅ Leaderboard routes registered');
app.use('/api/v1/auth', require('./interfaces/http/routes/authRoutes')(container.authController));
console.log('✅ Auth routes registered');
app.use('/api/v1/admin', require('./interfaces/http/routes/adminRoutes')(container));
console.log('✅ Admin routes registered');
console.log('🎯 All API routes registered successfully');

// Serve frontend static files (PRODUCTION ONLY)
// Check if running in production or on Railway
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

if (isProduction) {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  
  console.log('🌐 Production mode detected');
  console.log('🌐 Serving frontend from:', frontendPath);
  
  // Serve static files with caching
  app.use(express.static(frontendPath, {
    maxAge: '1d', // Cache for 1 day
    etag: true
  }));
  
  // SPA routing - serve index.html for all non-API routes
  app.use((req, res, next) => {
    // Skip API routes, socket.io, and health check
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path === '/health') {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
      if (err) {
        console.error('❌ Error serving index.html:', err);
        next(err);
      }
    });
  });
  
  console.log('✅ Frontend static files configured');
} else {
  console.log('🔧 Development mode - frontend not served from backend');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler (only for API routes in production)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

module.exports = app;
