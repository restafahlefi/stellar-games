const express = require('express');
const { registrationLimit, loginLimit, apiLimit } = require('../../../infrastructure/middleware/rateLimitMiddleware');

/**
 * Auth Routes
 * Defines authentication endpoints with rate limiting
 */
function createAuthRoutes(authController) {
  const router = express.Router();

  // Register new user (with rate limiting)
  router.post('/register', registrationLimit, (req, res) => authController.register(req, res));

  // Login user (with rate limiting)
  router.post('/login', loginLimit, (req, res) => authController.login(req, res));

  // Verify token (with general API rate limiting)
  router.get('/verify', apiLimit, (req, res) => authController.verify(req, res));

  // Logout (client-side, with general API rate limiting)
  router.post('/logout', apiLimit, (req, res) => authController.logout(req, res));

  return router;
}

module.exports = createAuthRoutes;
