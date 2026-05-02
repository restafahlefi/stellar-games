const express = require('express');

/**
 * Admin Bypass Routes - EMERGENCY SOLUTION
 * Simple admin access tanpa complex authentication
 */
function createAdminBypassRoutes(container) {
  const router = express.Router();
  const adminService = container.resolve('adminService');
  const authRepository = container.resolve('authRepository');

  // Simple password check - no complex auth
  const simpleAdminCheck = (req, res, next) => {
    const { adminKey } = req.query;
    
    // Simple admin key check
    if (adminKey === 'stellar2026admin' || adminKey === 'adminresta123key') {
      req.isAdmin = true;
      next();
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid admin key'
      });
    }
  };

  /**
   * GET /api/v1/admin-bypass/login
   * Simple admin login dengan query parameter
   */
  router.get('/login', (req, res) => {
    const { username, password } = req.query;
    
    // Simple credential check
    const validCredentials = [
      { username: 'admin', password: 'stellar2026!' },
      { username: 'adminresta', password: 'adminresta123' }
    ];
    
    const isValid = validCredentials.some(cred => 
      cred.username === username && cred.password === password
    );
    
    if (isValid) {
      res.json({
        success: true,
        message: 'Admin login successful',
        adminKey: username === 'admin' ? 'stellar2026admin' : 'adminresta123key',
        username: username
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  });

  /**
   * GET /api/v1/admin-bypass/stats
   * Get system stats dengan simple auth
   */
  router.get('/stats', simpleAdminCheck, async (req, res) => {
    try {
      const stats = await adminService.getDashboardStats();
      
      res.json({
        success: true,
        data: {
          ...stats,
          serverInfo: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform
          }
        }
      });
    } catch (error) {
      console.error('❌ Admin bypass stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get stats'
      });
    }
  });

  /**
   * GET /api/v1/admin-bypass/users
   * Get all users dengan simple auth
   */
  router.get('/users', simpleAdminCheck, async (req, res) => {
    try {
      const users = await adminService.getAllUsers();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('❌ Admin bypass users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get users'
      });
    }
  });

  /**
   * DELETE /api/v1/admin-bypass/users/:id
   * Delete user dengan simple auth
   */
  router.delete('/users/:id', simpleAdminCheck, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await adminService.deleteUser(id);
      
      res.json({
        success: true,
        data: result,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('❌ Admin bypass delete user error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to delete user'
      });
    }
  });

  /**
   * GET /api/v1/admin-bypass/backup/status
   * Get backup status dengan simple auth
   */
  router.get('/backup/status', simpleAdminCheck, async (req, res) => {
    try {
      const status = await adminService.getBackupStatus();
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('❌ Admin bypass backup status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get backup status'
      });
    }
  });

  /**
   * POST /api/v1/admin-bypass/backup/create
   * Force backup dengan simple auth
   */
  router.post('/backup/create', simpleAdminCheck, async (req, res) => {
    try {
      const results = await adminService.forceBackup();
      
      res.json({
        success: true,
        data: results,
        message: 'Manual backup completed'
      });
    } catch (error) {
      console.error('❌ Admin bypass force backup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create backup'
      });
    }
  });

  return router;
}

module.exports = createAdminBypassRoutes;