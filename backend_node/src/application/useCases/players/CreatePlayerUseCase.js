// Create Player Use Case

class CreatePlayerUseCase {
  constructor(playerService) {
    this.playerService = playerService;
  }

  async execute(playerData) {
    try {
      const player = await this.playerService.createPlayer(playerData);
      return {
        success: true,
        data: player.toPublicProfile()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CreatePlayerUseCase;
