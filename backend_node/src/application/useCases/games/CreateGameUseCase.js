// Create Game Use Case

class CreateGameUseCase {
  constructor(gameService) {
    this.gameService = gameService;
  }

  async execute(gameData) {
    try {
      const game = await this.gameService.createGame(gameData);
      return {
        success: true,
        data: game
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CreateGameUseCase;
