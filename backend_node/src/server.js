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
app.use('/api/v1/games', require('./interfaces/http/routes/gameRoutes'));
app.use('/api/v1/players', require('./interfaces/http/routes/playerRoutes'));
app.use('/api/v1/leaderboard', require('./interfaces/http/routes/leaderboardRoutes'));

// Serve frontend static files (PRODUCTION ONLY)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  
  // Serve static files with caching
  app.use(express.static(frontendPath, {
    maxAge: '1d', // Cache for 1 day
    etag: true,
    index: false // Don't auto-serve index.html for all routes
  }));
  
  // SPA routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes and socket.io
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path.startsWith('/health')) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
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
