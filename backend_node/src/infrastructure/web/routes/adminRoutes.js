const express = require('express');
const { rateLimitService } = require('../../middleware/rateLimitMiddleware');

/**
 * Admin API Routes
 * Secure admin endpoints untuk user management, system monitoring, backup control
 */
function createAdminRoutes(container) {
  const router = express.Router();
  const adminService = container.resolve('adminService');

  // Admin authentication middleware
  const requireAdmin = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({
          success: false,
          error: 'Admin authentication required'
        });
      }

      const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
      const [username, password] = credentials.split(':');

      const isValid = await adminService.authenticateAdmin(username, password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid admin credentials'
        });
      }

      req.adminUser = username;
      next();
    } catch (error) {
      console.error('❌ Admin auth middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication error'
      });
    }
  };

  // ===================
  // SYSTEM STATISTICS
  // ===================

  /**
   * GET /api/v1/admin/stats
   * Get comprehensive system statistics
   */
  router.get('/stats', requireAdmin, async (req, res) => {
    try {
      const stats = await adminService.getDashboardStats();
      const rateLimitStats = rateLimitService.getStats();
      const backupStatus = await adminService.getBackupStatus();

      res.json({
        success: true,
        data: {
          ...stats,
          rateLimiting: rateLimitStats,
          backup: backupStatus,
          serverInfo: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform
          }
        }
      });
    } catch (error) {
      console.error('❌ Admin stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get system statistics'
      });
    }
  });

  // ===================
  // USER MANAGEMENT
  // ===================

  /**
   * GET /api/v1/admin/users
   * Get all users with detailed info
   */
  router.get('/users', requireAdmin, async (req, res) => {
    try {
      const users = await adminService.getAllUsers();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('❌ Admin get users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get users'
      });
    }
  });

  /**
   * PUT /api/v1/admin/users/:id
   * Update user information
   */
  router.put('/users/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedUser = await adminService.updateUser(id, updates);
      
      console.log(`✅ Admin ${req.adminUser} updated user ${id}`);
      
      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('❌ Admin update user error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update user'
      });
    }
  });

  /**
   * DELETE /api/v1/admin/users/:id
   * Delete user and all related data
   */
  router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const result = await adminService.deleteUser(id);
      
      console.log(`✅ Admin ${req.adminUser} deleted user ${id}`);
      
      res.json({
        success: true,
        data: result,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('❌ Admin delete user error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to delete user'
      });
    }
  });

  // ===================
  // BACKUP MANAGEMENT
  // ===================

  /**
   * GET /api/v1/admin/backup/status
   * Get backup status dari semua services
   */
  router.get('/backup/status', requireAdmin, async (req, res) => {
    try {
      const status = await adminService.getBackupStatus();
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('❌ Admin backup status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get backup status'
      });
    }
  });

  /**
   * POST /api/v1/admin/backup/create
   * Force manual backup ke semua services
   */
  router.post('/backup/create', requireAdmin, async (req, res) => {
    try {
      const results = await adminService.forceBackup();
      
      console.log(`✅ Admin ${req.adminUser} triggered manual backup`);
      
      res.json({
        success: true,
        data: results,
        message: 'Manual backup completed'
      });
    } catch (error) {
      console.error('❌ Admin force backup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create backup'
      });
    }
  });

  /**
   * POST /api/v1/admin/backup/verify
   * Verify integrity semua backups
   */
  router.post('/backup/verify', requireAdmin, async (req, res) => {
    try {
      const results = await adminService.verifyBackups();
      
      console.log(`✅ Admin ${req.adminUser} verified backups`);
      
      res.json({
        success: true,
        data: results,
        message: 'Backup verification completed'
      });
    } catch (error) {
      console.error('❌ Admin verify backup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify backups'
      });
    }
  });

  // ===================
  // RATE LIMITING MANAGEMENT
  // ===================

  /**
   * GET /api/v1/admin/ratelimit/stats
   * Get rate limiting statistics
   */
  router.get('/ratelimit/stats', requireAdmin, async (req, res) => {
    try {
      const stats = rateLimitService.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Admin rate limit stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get rate limit statistics'
      });
    }
  });

  /**
   * POST /api/v1/admin/ratelimit/reset
   * Reset rate limit untuk IP atau username
   */
  router.post('/ratelimit/reset', requireAdmin, async (req, res) => {
    try {
      const { ip, username, endpoint } = req.body;

      if (ip && endpoint) {
        rateLimitService.resetIPLimit(ip, endpoint);
      }
      
      if (username) {
        rateLimitService.resetUserLimit(username);
      }
      
      console.log(`✅ Admin ${req.adminUser} reset rate limits`);
      
      res.json({
        success: true,
        message: 'Rate limits reset successfully'
      });
    } catch (error) {
      console.error('❌ Admin reset rate limit error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset rate limits'
      });
    }
  });

  // ===================
  // GAME ANALYTICS
  // ===================

  /**
   * GET /api/v1/admin/games/:gameId/analytics
   * Get detailed analytics untuk specific game
   */
  router.get('/games/:gameId/analytics', requireAdmin, async (req, res) => {
    try {
      const { gameId } = req.params;
      const analytics = await adminService.getGameAnalytics(gameId);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('❌ Admin game analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get game analytics'
      });
    }
  });

  /**
   * POST /api/v1/admin/leaderboard/reset
   * Reset leaderboard dengan archive
   */
  router.post('/leaderboard/reset', requireAdmin, async (req, res) => {
    try {
      const { gameId } = req.body;
      const result = await adminService.resetLeaderboard(gameId);
      
      console.log(`✅ Admin ${req.adminUser} reset leaderboard for ${gameId || 'all games'}`);
      
      res.json({
        success: true,
        data: result,
        message: 'Leaderboard reset successfully'
      });
    } catch (error) {
      console.error('❌ Admin reset leaderboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset leaderboard'
      });
    }
  });

  // ===================
  // SYSTEM LOGS
  // ===================

  /**
   * GET /api/v1/admin/logs
   * Get system logs
   */
  router.get('/logs', requireAdmin, async (req, res) => {
    try {
      const { limit = 100 } = req.query;
      const logs = await adminService.getSystemLogs(parseInt(limit));
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('❌ Admin get logs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get system logs'
      });
    }
  });

  return router;
}

module.exports = createAdminRoutes;