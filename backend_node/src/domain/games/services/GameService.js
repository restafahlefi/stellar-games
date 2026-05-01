// Domain Service - Business logic yang tidak cocok di Entity
// Koordinasi antar entities dan repositories

const Game = require('../entities/Game');

class GameService {
  constructor(gameRepository, playerRepository) {
    this.gameRepository = gameRepository;
    this.playerRepository = playerRepository;
  }

  async getAllGames() {
    return await this.gameRepository.findAll();
  }

  async getActiveGames() {
    return await this.gameRepository.findActive();
  }

  async getGameById(gameId) {
    const game = await this.gameRepository.findById(gameId);
    if (!game) {
      throw new Error(`Game with id ${gameId} not found`);
    }
    return game;
  }

  async getGamesByCategory(category) {
    return await this.gameRepository.findByCategory(category);
  }

  async createGame(gameData) {
    const game = new Game(gameData);
    game.validate();
    return await this.gameRepository.save(game);
  }

  async updateGame(gameId, updateData) {
    const existingGame = await this.getGameById(gameId);

    const updatedGame = new Game({
      ...existingGame,
      ...updateData,
      id: gameId // Ensure ID doesn't change
    });

    updatedGame.validate();
    return await this.gameRepository.update(gameId, updatedGame);
  }

  async activateGame(gameId) {
    const game = await this.getGameById(gameId);
    game.activate();
    return await this.gameRepository.update(gameId, game);
  }

  async deactivateGame(gameId) {
    const game = await this.getGameById(gameId);
    game.deactivate();
    return await this.gameRepository.update(gameId, game);
  }

  async deleteGame(gameId) {
    const exists = await this.gameRepository.exists(gameId);
    if (!exists) {
      throw new Error(`Game with id ${gameId} not found`);
    }
    return await this.gameRepository.delete(gameId);
  }

  async recordGamePlay(gameId) {
    const gameData = await this.getGameById(gameId);
    
    // Pastikan metadata ada
    const metadata = gameData.metadata || { totalPlays: 0 };
    metadata.totalPlays = (metadata.totalPlays || 0) + 1;
    
    // Update langsung ke repository tanpa lewat entity method jika data mentah
    const updatePayload = { ...gameData, metadata };
    return await this.gameRepository.update(gameId, updatePayload);
  }

  async getGlobalStats() {
    const [games, players] = await Promise.all([
      this.gameRepository.findAll(),
      this.playerRepository ? this.playerRepository.findAll() : []
    ]);
    
    const totalGames = games.length;
    const totalPlays = games.reduce((sum, game) => sum + (game.metadata?.totalPlays || 0), 0);
    const totalPlayers = players.length;
    
    // Get real-time active players count
    const activePlayersTracker = require('../../../infrastructure/persistence/ActivePlayersTracker');
    const activePlayers = activePlayersTracker.getActiveCount();

    return {
      totalGames,
      totalPlays,
      totalPlayers,
      activePlayers
    };
  }
}

module.exports = GameService;
