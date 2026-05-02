/**
 * Admin Domain Service
 * Business logic for admin operations
 */

class AdminService {
  constructor(authRepository, playerRepository, scoreRepository, gameRepository) {
    this.authRepository = authRepository;
    this.playerRepository = playerRepository;
    this.scoreRepository = scoreRepository;
    this.gameRepository = gameRepository;
  }

  /**
   * Get dashboard overview statistics
   */
  async getDashboardStats() {
    const users = await this.authRepository.findAll();
    const players = await this.playerRepository.findAll();
    const scores = await this.scoreRepository.findAll();
    const games = await this.gameRepository.findAll();

    // Calculate active players (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activePlayers = players.filter(p => 
      p.lastActive && new Date(p.lastActive) > fiveMinutesAgo
    ).length;

    // Calculate total games played
    const totalGamesPlayed = scores.length;

    // Get top players
    const playerScores = {};
    scores.forEach(score => {
      if (!playerScores[score.playerId]) {
        playerScores[score.playerId] = {
          playerId: score.playerId,
          playerName: score.playerName,
          totalScore: 0,
          gamesPlayed: 0
        };
      }
      playerScores[score.playerId].totalScore += score.score;
      playerScores[score.playerId].gamesPlayed += 1;
    });

    const topPlayers = Object.values(playerScores)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);

    // Game popularity
    const gameStats = {};
    scores.forEach(score => {
      if (!gameStats[score.gameId]) {
        gameStats[score.gameId] = {
          gameId: score.gameId,
          plays: 0,
          uniquePlayers: new Set()
        };
      }
      gameStats[score.gameId].plays += 1;
      gameStats[score.gameId].uniquePlayers.add(score.playerId);
    });

    const gamePopularity = Object.entries(gameStats).map(([gameId, stats]) => ({
      gameId,
      plays: stats.plays,
      uniquePlayers: stats.uniquePlayers.size
    })).sort((a, b) => b.plays - a.plays);

    return {
      totalUsers: users.length,
      totalPlayers: players.length,
      activePlayers,
      totalGamesPlayed,
      topPlayers,
      gamePopularity,
      recentActivity: this.getRecentActivity(scores, users)
    };
  }

  /**
   * Get recent activity (last 10 actions)
   */
  getRecentActivity(scores, users) {
    const activities = [];

    // Recent scores
    const recentScores = scores
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    recentScores.forEach(score => {
      activities.push({
        type: 'score',
        message: `${score.playerName} scored ${score.score} in ${score.gameId}`,
        timestamp: score.createdAt
      });
    });

    // Recent registrations
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    recentUsers.forEach(user => {
      activities.push({
        type: 'registration',
        message: `New user registered: ${user.username}`,
        timestamp: user.createdAt
      });
    });

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }

  /**
   * Get all users with stats
   */
  async getAllUsers() {
    const users = await this.authRepository.findAll();
    const players = await this.playerRepository.findAll();
    const scores = await this.scoreRepository.findAll();

    return users.map(user => {
      const player = players.find(p => p.username === user.username);
      const userScores = scores.filter(s => s.playerName === user.username);
      const totalScore = userScores.reduce((sum, s) => sum + s.score, 0);

      return {
        id: user.id,
        username: user.username,
        email: user.email || '-',
        role: user.role || 'user',
        createdAt: user.createdAt,
        lastActive: player?.lastActive || user.createdAt,
        totalGames: userScores.length,
        totalScore,
        status: this.getUserStatus(player)
      };
    });
  }

  /**
   * Get user status (active/inactive)
   */
  getUserStatus(player) {
    if (!player || !player.lastActive) return 'inactive';
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(player.lastActive) > fiveMinutesAgo ? 'active' : 'inactive';
  }

  /**
   * Update user
   */
  async updateUser(userId, updates) {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate updates
    if (updates.role && !['user', 'admin'].includes(updates.role)) {
      throw new Error('Invalid role');
    }

    // Update user
    const updatedUser = { ...user, ...updates };
    await this.authRepository.update(userId, updatedUser);

    return updatedUser;
  }

  /**
   * Delete user and all related data
   */
  async deleteUser(userId) {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Don't allow deleting yourself
    if (user.role === 'admin') {
      throw new Error('Cannot delete admin user');
    }

    // Delete user's scores
    const scores = await this.scoreRepository.findByPlayerId(userId);
    for (const score of scores) {
      await this.scoreRepository.delete(score.id);
    }

    // Delete user
    await this.authRepository.delete(userId);

    return { success: true, message: 'User deleted successfully' };
  }

  /**
   * Get game analytics
   */
  async getGameAnalytics(gameId) {
    const scores = await this.scoreRepository.findByGameId(gameId);
    
    if (scores.length === 0) {
      return {
        gameId,
        totalPlays: 0,
        uniquePlayers: 0,
        avgScore: 0,
        highestScore: 0,
        topPlayers: []
      };
    }

    const uniquePlayers = new Set(scores.map(s => s.playerId)).size;
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const avgScore = Math.round(totalScore / scores.length);
    const highestScore = Math.max(...scores.map(s => s.score));

    // Top players for this game
    const playerScores = {};
    scores.forEach(score => {
      if (!playerScores[score.playerId]) {
        playerScores[score.playerId] = {
          playerId: score.playerId,
          playerName: score.playerName,
          bestScore: 0,
          plays: 0
        };
      }
      playerScores[score.playerId].bestScore = Math.max(
        playerScores[score.playerId].bestScore,
        score.score
      );
      playerScores[score.playerId].plays += 1;
    });

    const topPlayers = Object.values(playerScores)
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, 10);

    return {
      gameId,
      totalPlays: scores.length,
      uniquePlayers,
      avgScore,
      highestScore,
      topPlayers
    };
  }

  /**
   * Reset leaderboard with archive
   */
  async resetLeaderboard(gameId = null) {
    const scores = gameId 
      ? await this.scoreRepository.findByGameId(gameId)
      : await this.scoreRepository.findAll();

    // Archive data
    const archiveData = {
      resetDate: new Date().toISOString(),
      gameId: gameId || 'all',
      totalScores: scores.length,
      scores
    };

    // Delete scores
    for (const score of scores) {
      await this.scoreRepository.delete(score.id);
    }

    return {
      success: true,
      archived: scores.length,
      archiveData
    };
  }

  /**
   * Get system logs (placeholder - implement based on logging system)
   */
  async getSystemLogs(limit = 100) {
    // This would integrate with your logging system
    // For now, return placeholder
    return {
      logs: [],
      message: 'Logging system not yet implemented'
    };
  }
}

module.exports = AdminService;
