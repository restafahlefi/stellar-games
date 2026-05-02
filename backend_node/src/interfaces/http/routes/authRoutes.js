const express = require('express');

/**
 * Auth Routes
 * Defines authentication endpoints
 */
function createAuthRoutes(authController) {
  const router = express.Router();

  // Register new user
  router.post('/register', (req, res) => authController.register(req, res));

  // Login user
  router.post('/login', (req, res) => authController.login(req, res));

  // Verify token
  router.get('/verify', (req, res) => authController.verify(req, res));

  // Logout (client-side)
  router.post('/logout', (req, res) => authController.logout(req, res));

  return router;
}

module.exports = createAuthRoutes;
