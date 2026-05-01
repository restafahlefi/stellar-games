// Player Controller

class PlayerController {
  constructor(createPlayerUseCase, playerService) {
    this.createPlayerUseCase = createPlayerUseCase;
    this.playerService = playerService;
  }

  async getAllPlayers(req, res) {
    try {
      const players = await this.playerService.getAllPlayers();
      
      res.json({
        status: 'success',
        data: players.map(p => p.toPublicProfile ? p.toPublicProfile() : p)
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getPlayerById(req, res) {
    try {
      const { id } = req.params;
      const player = await this.playerService.getPlayerById(id);
      
      res.json({
        status: 'success',
        data: player.toPublicProfile()
      });
    } catch (error) {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async createPlayer(req, res) {
    try {
      const result = await this.createPlayerUseCase.execute(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      res.status(201).json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getPlayerStats(req, res) {
    try {
      const { id } = req.params;
      const { gameId } = req.query;
      
      const stats = await this.playerService.getPlayerStats(id, gameId);
      
      res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async updatePlayerProfile(req, res) {
    try {
      const { id } = req.params;
      const player = await this.playerService.updatePlayerProfile(id, req.body);
      
      res.json({
        status: 'success',
        data: player.toPublicProfile()
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = PlayerController;
