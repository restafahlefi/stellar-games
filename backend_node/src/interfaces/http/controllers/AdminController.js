/**
 * Admin Controller
 * Handles HTTP requests for admin operations
 */

class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  /**
   * GET /api/v1/admin/dashboard
   * Get dashboard overview statistics
   */
  async getDashboard(req, res) {
    try {
      const stats = await this.adminService.getDashboardStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }

  /**
   * GET /api/v1/admin/users
   * Get all users with stats
   */
  async getUsers(req, res) {
    try {
      const users = await this.adminService.getAllUsers();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
  }

  /**
   * GET /api/v1/admin/users/:id
   * Get user details
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const users = await this.adminService.getAllUsers();
      const user = users.find(u => u.id === id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error.message
      });
    }
  }

  /**
   * PUT /api/v1/admin/users/:id
   * Update user
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedUser = await this.adminService.updateUser(id, updates);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /api/v1/admin/users/:id
   * Delete user
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const result = await this.adminService.deleteUser(id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/admin/analytics/games/:gameId
   * Get game analytics
   */
  async getGameAnalytics(req, res) {
    try {
      const { gameId } = req.params;
      const analytics = await this.adminService.getGameAnalytics(gameId);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get game analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch game analytics',
        error: error.message
      });
    }
  }

  /**
   * POST /api/v1/admin/leaderboard/reset
   * Reset leaderboard
   */
  async resetLeaderboard(req, res) {
    try {
      const { gameId } = req.body;

      const result = await this.adminService.resetLeaderboard(gameId);

      res.json({
        success: true,
        message: `Leaderboard reset successfully. Archived ${result.archived} scores.`,
        data: result
      });
    } catch (error) {
      console.error('Reset leaderboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset leaderboard',
        error: error.message
      });
    }
  }

  /**
   * GET /api/v1/admin/logs
   * Get system logs
   */
  async getLogs(req, res) {
    try {
      const { limit } = req.query;
      const logs = await this.adminService.getSystemLogs(parseInt(limit) || 100);

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch logs',
        error: error.message
      });
    }
  }
}

module.exports = AdminController;
