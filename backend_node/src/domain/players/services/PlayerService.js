// Player Domain Service

const Player = require('../entities/Player');

class PlayerService {
  constructor(playerRepository) {
    this.playerRepository = playerRepository;
  }

  async getAllPlayers() {
    return await this.playerRepository.findAll();
  }

  async getPlayerById(playerId) {
    const player = await this.playerRepository.findById(playerId);
    if (!player) {
      throw new Error(`Player with id ${playerId} not found`);
    }
    return player;
  }

  async getPlayerByUsername(username) {
    const player = await this.playerRepository.findByUsername(username);
    if (!player) {
      throw new Error(`Player with username ${username} not found`);
    }
    return player;
  }

  async createPlayer(playerData) {
    // Check if username already exists
    const existingPlayer = await this.playerRepository.findByUsername(playerData.username);
    if (existingPlayer) {
      throw new Error(`Username ${playerData.username} already exists`);
    }

    const player = new Player(playerData);
    player.validate();
    return await this.playerRepository.save(player);
  }

  async updatePlayer(playerId, updateData) {
    const existingPlayer = await this.getPlayerById(playerId);
    
    const updatedPlayer = new Player({
      ...existingPlayer,
      ...updateData,
      id: playerId
    });
    
    updatedPlayer.validate();
    return await this.playerRepository.update(playerId, updatedPlayer);
  }

  async updatePlayerProfile(playerId, profileData) {
    const player = await this.getPlayerById(playerId);
    player.updateProfile(profileData);
    return await this.playerRepository.update(playerId, player);
  }

  async recordPlayerLogin(playerId) {
    const player = await this.getPlayerById(playerId);
    player.recordLogin();
    return await this.playerRepository.update(playerId, player);
  }

  async recordGamePlay(playerId, gameId, score, playTime) {
    const playerData = await this.getPlayerById(playerId);
    
    // Pastikan stats ada
    const stats = playerData.stats || {};
    const gameStats = stats[gameId] || { plays: 0, highestScore: 0, totalTime: 0 };
    
    gameStats.plays += 1;
    gameStats.highestScore = Math.max(gameStats.highestScore, score);
    gameStats.totalTime += playTime;
    
    stats[gameId] = gameStats;
    
    // Update langsung ke repository
    const updatePayload = { ...playerData, stats };
    return await this.playerRepository.update(playerId, updatePayload);
  }

  async getPlayerStats(playerId, gameId = null) {
    const player = await this.getPlayerById(playerId);
    
    if (gameId) {
      return player.stats[gameId] || null;
    }
    
    return player.stats;
  }

  async deletePlayer(playerId) {
    const exists = await this.playerRepository.exists(playerId);
    if (!exists) {
      throw new Error(`Player with id ${playerId} not found`);
    }
    return await this.playerRepository.delete(playerId);
  }
}

module.exports = PlayerService;
