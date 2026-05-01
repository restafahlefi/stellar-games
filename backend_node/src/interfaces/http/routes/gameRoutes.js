const express = require('express');
const router = express.Router();
const container = require('../../../infrastructure/di/container');

const gameController = container.gameController;

// GET /api/v1/games/stats - Get global stats
router.get('/stats', (req, res) => gameController.getStats(req, res));

// POST /api/v1/games/:id/play - Record a game play
router.post('/:id/play', (req, res) => gameController.recordPlay(req, res));

// GET /api/v1/games - Get all games
router.get('/', (req, res) => gameController.getAllGames(req, res));

// GET /api/v1/games/active - Get active games
router.get('/active', (req, res) => gameController.getActiveGames(req, res));

// GET /api/v1/games/category/:category - Get games by category
router.get('/category/:category', (req, res) => gameController.getGamesByCategory(req, res));

// GET /api/v1/games/:id - Get game by ID
router.get('/:id', (req, res) => gameController.getGameById(req, res));

// POST /api/v1/games - Create new game
router.post('/', (req, res) => gameController.createGame(req, res));

module.exports = router;
