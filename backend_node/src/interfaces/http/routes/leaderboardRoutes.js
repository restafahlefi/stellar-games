const express = require('express');
const router = express.Router();
const container = require('../../../infrastructure/di/container');

const leaderboardController = container.leaderboardController;

// GET /api/v1/leaderboard/global - Get global leaderboard
router.get('/global', (req, res) => leaderboardController.getGlobalLeaderboard(req, res));

// GET /api/v1/leaderboard/:gameId - Get leaderboard for specific game
router.get('/:gameId', (req, res) => leaderboardController.getLeaderboard(req, res));

// GET /api/v1/leaderboard/:gameId/player/:playerId/rank - Get player rank
router.get('/:gameId/player/:playerId/rank', (req, res) => leaderboardController.getPlayerRank(req, res));

// POST /api/v1/leaderboard/scores - Submit new score
router.post('/scores', (req, res) => leaderboardController.submitScore(req, res));

module.exports = router;
