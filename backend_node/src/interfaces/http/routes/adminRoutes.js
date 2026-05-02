/**
 * Admin Routes
 * Protected routes for admin operations
 */

const express = require('express');
const router = express.Router();

module.exports = (container) => {
  const authMiddleware = require('../../../infrastructure/middleware/authMiddleware')(container);
  const adminMiddleware = require('../../../infrastructure/middleware/adminMiddleware');
  const AdminController = require('../controllers/AdminController');
  
  const adminService = container.resolve('adminService');
  const adminController = new AdminController(adminService);

  // All admin routes require authentication + admin role
  router.use(authMiddleware);
  router.use(adminMiddleware);

  // Dashboard
  router.get('/dashboard', (req, res) => adminController.getDashboard(req, res));

  // User Management
  router.get('/users', (req, res) => adminController.getUsers(req, res));
  router.get('/users/:id', (req, res) => adminController.getUserById(req, res));
  router.put('/users/:id', (req, res) => adminController.updateUser(req, res));
  router.delete('/users/:id', (req, res) => adminController.deleteUser(req, res));

  // Analytics
  router.get('/analytics/games/:gameId', (req, res) => adminController.getGameAnalytics(req, res));

  // Leaderboard Management
  router.post('/leaderboard/reset', (req, res) => adminController.resetLeaderboard(req, res));

  // System Logs
  router.get('/logs', (req, res) => adminController.getLogs(req, res));

  return router;
};
