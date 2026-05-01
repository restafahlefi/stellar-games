const express = require('express');
const router = express.Router();
const container = require('../../../infrastructure/di/container');

const playerController = container.playerController;

// GET /api/v1/players - Get all players
router.get('/', (req, res) => playerController.getAllPlayers(req, res));

// GET /api/v1/players/:id - Get player by ID
router.get('/:id', (req, res) => playerController.getPlayerById(req, res));

// GET /api/v1/players/:id/stats - Get player stats
router.get('/:id/stats', (req, res) => playerController.getPlayerStats(req, res));

// POST /api/v1/players - Create new player
router.post('/', (req, res) => playerController.createPlayer(req, res));

// POST /api/v1/players/heartbeat - Player heartbeat (for active tracking)
router.post('/heartbeat', (req, res) => {
  const { playerName } = req.body;
  
  if (!playerName) {
    return res.status(400).json({
      success: false,
      message: 'playerName is required'
    });
  }

  const activePlayersTracker = require('../../../infrastructure/persistence/ActivePlayersTracker');
  activePlayersTracker.heartbeat(playerName);

  res.json({
    success: true,
    message: 'Heartbeat recorded',
    activeCount: activePlayersTracker.getActiveCount()
  });
});

// POST /api/v1/players/disconnect - Player disconnect (explicit logout/close)
router.post('/disconnect', (req, res) => {
  const { playerName } = req.body;
  
  if (!playerName) {
    return res.status(400).json({
      success: false,
      message: 'playerName is required'
    });
  }

  const activePlayersTracker = require('../../../infrastructure/persistence/ActivePlayersTracker');
  activePlayersTracker.removePlayer(playerName);

  res.json({
    success: true,
    message: 'Player disconnected',
    activeCount: activePlayersTracker.getActiveCount()
  });
});

// PUT /api/v1/players/:id - Update player profile
router.put('/:id', (req, res) => playerController.updatePlayerProfile(req, res));

module.exports = router;
