// Use Case - Application-specific business rules
// Orchestrates the flow of data to and from entities

class GetAllGamesUseCase {
  constructor(gameService) {
    this.gameService = gameService;
  }

  async execute() {
    try {
      const games = await this.gameService.getAllGames();
      return {
        success: true,
        data: games
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GetAllGamesUseCase;
