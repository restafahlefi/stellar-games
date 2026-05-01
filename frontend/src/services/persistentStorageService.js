/**
 * Persistent Storage Service
 * Mengelola data yang persisten dan tidak hilang saat ganti identity
 */

class PersistentStorageService {
  constructor() {
    this.globalPrefix = 'stellar_global_';
    this.playerPrefix = 'stellar_player_';
  }

  /**
   * Get global data (shared across all identities)
   */
  getGlobalData(key) {
    try {
      const data = localStorage.getItem(this.globalPrefix + key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading global data:', error);
      return null;
    }
  }

  /**
   * Set global data (shared across all identities)
   */
  setGlobalData(key, value) {
    try {
      localStorage.setItem(this.globalPrefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving global data:', error);
      return false;
    }
  }

  /**
   * Get player-specific data
   */
  getPlayerData(playerName, key) {
    try {
      const data = localStorage.getItem(this.playerPrefix + playerName + '_' + key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading player data:', error);
      return null;
    }
  }

  /**
   * Set player-specific data
   */
  setPlayerData(playerName, key, value) {
    try {
      localStorage.setItem(this.playerPrefix + playerName + '_' + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving player data:', error);
      return false;
    }
  }

  /**
   * Merge achievements from different identities
   */
  mergeAchievements(currentPlayerName) {
    const globalAchievements = this.getGlobalData('achievements') || {};
    const playerAchievements = this.getPlayerData(currentPlayerName, 'achievements') || {};
    
    // Merge achievements (global takes precedence for unlock dates)
    const mergedAchievements = { ...playerAchievements };
    
    Object.keys(globalAchievements).forEach(achievementId => {
      if (!mergedAchievements[achievementId]) {
        mergedAchievements[achievementId] = globalAchievements[achievementId];
      } else {
        // Keep the earliest unlock date
        const globalDate = new Date(globalAchievements[achievementId].unlockedAt);
        const playerDate = new Date(mergedAchievements[achievementId].unlockedAt);
        if (globalDate < playerDate) {
          mergedAchievements[achievementId] = globalAchievements[achievementId];
        }
      }
    });

    // Save merged achievements back to both global and player storage
    this.setGlobalData('achievements', mergedAchievements);
    this.setPlayerData(currentPlayerName, 'achievements', mergedAchievements);
    
    return mergedAchievements;
  }

  /**
   * Unlock achievement globally and for current player
   */
  unlockAchievement(playerName, achievementId, achievement) {
    const unlockData = {
      unlockedAt: new Date().toISOString(),
      achievement: achievement,
      unlockedBy: playerName
    };

    // Save to global achievements
    const globalAchievements = this.getGlobalData('achievements') || {};
    if (!globalAchievements[achievementId]) {
      globalAchievements[achievementId] = unlockData;
      this.setGlobalData('achievements', globalAchievements);
    }

    // Save to player achievements
    const playerAchievements = this.getPlayerData(playerName, 'achievements') || {};
    if (!playerAchievements[achievementId]) {
      playerAchievements[achievementId] = unlockData;
      this.setPlayerData(playerName, 'achievements', playerAchievements);
    }

    return achievement;
  }

  /**
   * Get all unlocked achievements (merged from all sources)
   */
  getAllUnlockedAchievements(currentPlayerName) {
    return this.mergeAchievements(currentPlayerName);
  }

  /**
   * Merge game stats from different identities
   */
  mergeGameStats(currentPlayerName) {
    const globalStats = this.getGlobalData('game_stats') || {};
    const playerStats = this.getPlayerData(currentPlayerName, 'game_stats') || {};
    
    // Merge stats by taking the best scores and adding up totals
    const mergedStats = { ...playerStats };
    
    Object.keys(globalStats).forEach(gameId => {
      if (!mergedStats[gameId]) {
        mergedStats[gameId] = { ...globalStats[gameId] };
      } else {
        const global = globalStats[gameId];
        const player = mergedStats[gameId];
        
        // Merge stats intelligently
        mergedStats[gameId] = {
          gamesPlayed: (global.gamesPlayed || 0) + (player.gamesPlayed || 0),
          wins: (global.wins || 0) + (player.wins || 0),
          losses: (global.losses || 0) + (player.losses || 0),
          bestScore: Math.max(global.bestScore || 0, player.bestScore || 0),
          totalScore: (global.totalScore || 0) + (player.totalScore || 0),
          winStreak: Math.max(global.winStreak || 0, player.winStreak || 0),
          currentStreak: player.currentStreak || 0 // Keep current player's streak
        };
      }
    });

    // Save merged stats
    this.setGlobalData('game_stats', mergedStats);
    this.setPlayerData(currentPlayerName, 'game_stats', mergedStats);
    
    return mergedStats;
  }

  /**
   * Update game stats for current player and globally
   */
  updateGameStats(playerName, gameId, updates) {
    // Update player stats
    const playerStats = this.getPlayerData(playerName, 'game_stats') || {};
    if (!playerStats[gameId]) {
      playerStats[gameId] = {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        bestScore: 0,
        totalScore: 0,
        winStreak: 0,
        currentStreak: 0
      };
    }
    
    playerStats[gameId] = { ...playerStats[gameId], ...updates };
    this.setPlayerData(playerName, 'game_stats', playerStats);

    // Update global stats
    const globalStats = this.getGlobalData('game_stats') || {};
    if (!globalStats[gameId]) {
      globalStats[gameId] = { ...playerStats[gameId] };
    } else {
      // Merge with global stats
      globalStats[gameId] = {
        gamesPlayed: (globalStats[gameId].gamesPlayed || 0) + (updates.gamesPlayed || 0),
        wins: (globalStats[gameId].wins || 0) + (updates.wins || 0),
        losses: (globalStats[gameId].losses || 0) + (updates.losses || 0),
        bestScore: Math.max(globalStats[gameId].bestScore || 0, updates.bestScore || playerStats[gameId].bestScore || 0),
        totalScore: (globalStats[gameId].totalScore || 0) + (updates.totalScore || 0),
        winStreak: Math.max(globalStats[gameId].winStreak || 0, updates.winStreak || playerStats[gameId].winStreak || 0),
        currentStreak: updates.currentStreak !== undefined ? updates.currentStreak : playerStats[gameId].currentStreak
      };
    }
    
    this.setGlobalData('game_stats', globalStats);
    return playerStats[gameId];
  }

  /**
   * Get daily challenges (global, not player-specific)
   */
  getDailyChallenges() {
    return this.getGlobalData('daily_challenges') || {};
  }

  /**
   * Set daily challenges (global)
   */
  setDailyChallenges(challenges) {
    return this.setGlobalData('daily_challenges', challenges);
  }

  /**
   * Get daily challenge date (global)
   */
  getDailyChallengeDate() {
    return this.getGlobalData('challenge_date');
  }

  /**
   * Set daily challenge date (global)
   */
  setDailyChallengeDate(date) {
    return this.setGlobalData('challenge_date', date);
  }

  /**
   * Initialize player data when switching identity
   */
  initializePlayer(playerName) {
    // Merge achievements and stats from global storage
    this.mergeAchievements(playerName);
    this.mergeGameStats(playerName);
    
    console.log(`🔄 Initialized data for player: ${playerName}`);
  }

  /**
   * Get total achievement points across all identities
   */
  getTotalAchievementPoints(currentPlayerName) {
    const achievements = this.getAllUnlockedAchievements(currentPlayerName);
    return Object.values(achievements).reduce((total, item) => {
      return total + (item.achievement?.points || 0);
    }, 0);
  }

  /**
   * Get achievement progress across all identities
   */
  getAchievementProgress(currentPlayerName, totalAchievements) {
    const unlocked = Object.keys(this.getAllUnlockedAchievements(currentPlayerName)).length;
    return {
      unlocked,
      total: totalAchievements,
      percentage: Math.round((unlocked / totalAchievements) * 100)
    };
  }

  /**
   * Clear all data (for testing/reset)
   */
  clearAllData() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.globalPrefix) || key.startsWith(this.playerPrefix)) {
        localStorage.removeItem(key);
      }
    });
    console.log('🗑️ All persistent data cleared');
  }
}

export const persistentStorage = new PersistentStorageService();
export default persistentStorage;