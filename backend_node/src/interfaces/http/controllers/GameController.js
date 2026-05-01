// Game Controller - HTTP interface layer

class GameController {
  constructor(getAllGamesUseCase, createGameUseCase, gameService, getGlobalStatsUseCase) {
    this.getAllGamesUseCase = getAllGamesUseCase;
    this.createGameUseCase = createGameUseCase;
    this.gameService = gameService;
    this.getGlobalStatsUseCase = getGlobalStatsUseCase;
  }

  async getStats(req, res) {
    try {
      const result = await this.getGlobalStatsUseCase.execute();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async recordPlay(req, res) {
    try {
      const { id } = req.params;
      await this.gameService.recordGamePlay(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAllGames(req, res) {
    try {
      const result = await this.getAllGamesUseCase.execute();
      
      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      res.json({
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

  async getGameById(req, res) {
    try {
      const { id } = req.params;
      const game = await this.gameService.getGameById(id);
      
      res.json({
        status: 'success',
        data: game
      });
    } catch (error) {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async createGame(req, res) {
    try {
      const result = await this.createGameUseCase.execute(req.body);
      
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

  async getActiveGames(req, res) {
    try {
      const games = await this.gameService.getActiveGames();
      
      res.json({
        status: 'success',
        data: games
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getGamesByCategory(req, res) {
    try {
      const { category } = req.params;
      const games = await this.gameService.getGamesByCategory(category);
      
      res.json({
        status: 'success',
        data: games
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = GameController;
