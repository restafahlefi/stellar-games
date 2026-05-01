/**
 * Achievement Service
 * Mengelola achievement/badge untuk semua game dengan persistent storage
 */

import { persistentStorage } from './persistentStorageService';

const ACHIEVEMENTS = {
  // Universal Achievements
  first_win: {
    id: 'first_win',
    name: 'Kemenangan Pertama',
    description: 'Menang untuk pertama kalinya',
    icon: '🏆',
    points: 10,
    game: 'all'
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Menang dalam waktu kurang dari 1 menit',
    icon: '⚡',
    points: 25,
    game: 'all'
  },
  perfect_score: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Capai skor sempurna tanpa kesalahan',
    icon: '💯',
    points: 50,
    game: 'all'
  },
  
  // Snake Achievements
  snake_beginner: {
    id: 'snake_beginner',
    name: 'Snake Pemula',
    description: 'Capai score 50 di Snake',
    icon: '🐍',
    points: 10,
    game: 'snake'
  },
  snake_master: {
    id: 'snake_master',
    name: 'Snake Master',
    description: 'Capai score 100 di Snake',
    icon: '👑',
    points: 25,
    game: 'snake'
  },
  snake_legend: {
    id: 'snake_legend',
    name: 'Snake Legend',
    description: 'Capai score 200 di Snake',
    icon: '🔥',
    points: 50,
    game: 'snake'
  },
  
  // Memory Match Achievements
  memory_quick: {
    id: 'memory_quick',
    name: 'Quick Memory',
    description: 'Selesaikan Memory Match dalam 20 moves',
    icon: '🧠',
    points: 15,
    game: 'memory'
  },
  memory_perfect: {
    id: 'memory_perfect',
    name: 'Perfect Memory',
    description: 'Selesaikan tanpa salah',
    icon: '💎',
    points: 30,
    game: 'memory'
  },
  
  // Simon Says Achievements
  simon_10: {
    id: 'simon_10',
    name: 'Simon Sequence 10',
    description: 'Capai sequence 10',
    icon: '🎵',
    points: 15,
    game: 'simon'
  },
  simon_20: {
    id: 'simon_20',
    name: 'Simon Master',
    description: 'Capai sequence 20',
    icon: '🎼',
    points: 30,
    game: 'simon'
  },
  
  // Tic Tac Toe Achievements
  ttt_win_streak_3: {
    id: 'ttt_win_streak_3',
    name: 'Winning Streak',
    description: 'Menang 3x berturut-turut',
    icon: '🔥',
    points: 20,
    game: 'tictactoe'
  },
  ttt_online_win: {
    id: 'ttt_online_win',
    name: 'Online Champion',
    description: 'Menang di mode online',
    icon: '🌐',
    points: 25,
    game: 'tictactoe'
  },
  
  // Connect Four Achievements
  c4_win_streak_3: {
    id: 'c4_win_streak_3',
    name: 'Connect Four Streak',
    description: 'Menang 3x berturut-turut',
    icon: '🔴',
    points: 20,
    game: 'connect4'
  },
  c4_online_win: {
    id: 'c4_online_win',
    name: 'Connect Four Online',
    description: 'Menang di mode online',
    icon: '🟡',
    points: 25,
    game: 'connect4'
  },
  
  // Rock Paper Scissors Achievements
  rps_win_streak_5: {
    id: 'rps_win_streak_5',
    name: 'RPS Streak',
    description: 'Menang 5x berturut-turut',
    icon: '✊',
    points: 20,
    game: 'rps'
  },
  rps_perfect_game: {
    id: 'rps_perfect_game',
    name: 'Perfect Game',
    description: 'Menang 3-0',
    icon: '👑',
    points: 30,
    game: 'rps'
  },
  
  // Wordle Achievements
  wordle_first_try: {
    id: 'wordle_first_try',
    name: 'Lucky Guess',
    description: 'Tebak kata pertama kali',
    icon: '🍀',
    points: 50,
    game: 'wordle'
  },
  wordle_3_tries: {
    id: 'wordle_3_tries',
    name: 'Wordle Pro',
    description: 'Tebak dalam 3 percobaan',
    icon: '🎯',
    points: 25,
    game: 'wordle'
  },
  
  // Flappy Bird Achievements
  flappy_bronze: {
    id: 'flappy_bronze',
    name: 'Bronze Medal',
    description: 'Capai score 10',
    icon: '🥉',
    points: 10,
    game: 'flappybird'
  },
  flappy_silver: {
    id: 'flappy_silver',
    name: 'Silver Medal',
    description: 'Capai score 20',
    icon: '🥈',
    points: 20,
    game: 'flappybird'
  },
  flappy_gold: {
    id: 'flappy_gold',
    name: 'Gold Medal',
    description: 'Capai score 40',
    icon: '🥇',
    points: 40,
    game: 'flappybird'
  },
  
  // Pac-Man Achievements
  pacman_level_2: {
    id: 'pacman_level_2',
    name: 'Level 2',
    description: 'Capai level 2',
    icon: '👻',
    points: 15,
    game: 'pacman'
  },
  pacman_all_levels: {
    id: 'pacman_all_levels',
    name: 'Maze Master',
    description: 'Selesaikan semua level',
    icon: '🏆',
    points: 50,
    game: 'pacman'
  },
  
  // 2048 Achievements
  game2048_512: {
    id: 'game2048_512',
    name: '512 Tile',
    description: 'Capai tile 512',
    icon: '🎲',
    points: 15,
    game: 'game2048'
  },
  game2048_1024: {
    id: 'game2048_1024',
    name: '1024 Tile',
    description: 'Capai tile 1024',
    icon: '💎',
    points: 30,
    game: 'game2048'
  },
  game2048_2048: {
    id: 'game2048_2048',
    name: '2048 Master',
    description: 'Capai tile 2048',
    icon: '👑',
    points: 50,
    game: 'game2048'
  },
  
  // Minesweeper Achievements
  minesweeper_easy: {
    id: 'minesweeper_easy',
    name: 'Easy Clear',
    description: 'Selesaikan Easy mode',
    icon: '💣',
    points: 10,
    game: 'minesweeper'
  },
  minesweeper_hard: {
    id: 'minesweeper_hard',
    name: 'Hard Clear',
    description: 'Selesaikan Hard mode',
    icon: '💥',
    points: 30,
    game: 'minesweeper'
  },
  minesweeper_speed: {
    id: 'minesweeper_speed',
    name: 'Speed Sweeper',
    description: 'Selesaikan dalam 60 detik',
    icon: '⚡',
    points: 40,
    game: 'minesweeper'
  },
  
  // Typing Test Achievements
  typing_50wpm: {
    id: 'typing_50wpm',
    name: '50 WPM',
    description: 'Capai 50 WPM',
    icon: '⌨️',
    points: 15,
    game: 'typing'
  },
  typing_100wpm: {
    id: 'typing_100wpm',
    name: '100 WPM',
    description: 'Capai 100 WPM',
    icon: '🚀',
    points: 30,
    game: 'typing'
  },
  typing_perfect: {
    id: 'typing_perfect',
    name: 'Perfect Typing',
    description: '100% accuracy',
    icon: '💯',
    points: 25,
    game: 'typing'
  }
};

class AchievementService {
  constructor() {
    this.currentPlayer = null;
  }

  // Set current player for context
  setCurrentPlayer(playerName) {
    this.currentPlayer = playerName;
    if (playerName) {
      persistentStorage.initializePlayer(playerName);
    }
  }

  // Get all achievements
  getAllAchievements() {
    return ACHIEVEMENTS;
  }

  // Get achievements for specific game
  getGameAchievements(gameId) {
    return Object.values(ACHIEVEMENTS).filter(
      a => a.game === gameId || a.game === 'all'
    );
  }

  // Get unlocked achievements (persistent across identities)
  getUnlockedAchievements() {
    if (!this.currentPlayer) return {};
    return persistentStorage.getAllUnlockedAchievements(this.currentPlayer);
  }

  // Check if achievement is unlocked
  isUnlocked(achievementId) {
    const unlocked = this.getUnlockedAchievements();
    return !!unlocked[achievementId];
  }

  // Unlock achievement (persistent)
  unlockAchievement(achievementId) {
    if (!this.currentPlayer) return null;
    
    if (this.isUnlocked(achievementId)) {
      return null; // Already unlocked
    }

    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) {
      console.error('Achievement not found:', achievementId);
      return null;
    }

    const result = persistentStorage.unlockAchievement(this.currentPlayer, achievementId, achievement);
    
    // Add to reward system's unclaimed list
    if (result && typeof window !== 'undefined') {
      // Import reward system dynamically to avoid circular dependency
      import('./rewardSystem').then(({ rewardSystem }) => {
        rewardSystem.setCurrentPlayer(this.currentPlayer);
        rewardSystem.addUnclaimedAchievement(achievement);
      });
    }
    
    return result;
  }

  // Get game stats (persistent)
  getGameStats(gameId) {
    if (!this.currentPlayer) return {};
    
    const allStats = persistentStorage.mergeGameStats(this.currentPlayer);
    return allStats[gameId] || {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      bestScore: 0,
      totalScore: 0,
      winStreak: 0,
      currentStreak: 0
    };
  }

  // Update game stats (persistent)
  updateGameStats(gameId, updates) {
    if (!this.currentPlayer) return null;
    
    return persistentStorage.updateGameStats(this.currentPlayer, gameId, updates);
  }

  // Check achievements after game
  checkAchievements(gameId, gameData) {
    const newAchievements = [];

    // Check game-specific achievements
    if (gameId === 'snake') {
      if (gameData.score >= 50 && !this.isUnlocked('snake_beginner')) {
        const ach = this.unlockAchievement('snake_beginner');
        if (ach) newAchievements.push(ach);
      }
      if (gameData.score >= 100 && !this.isUnlocked('snake_master')) {
        const ach = this.unlockAchievement('snake_master');
        if (ach) newAchievements.push(ach);
      }
      if (gameData.score >= 200 && !this.isUnlocked('snake_legend')) {
        const ach = this.unlockAchievement('snake_legend');
        if (ach) newAchievements.push(ach);
      }
    }

    if (gameId === 'simon' || gameId === 'simonsays') {
      if (gameData.score >= 10 && !this.isUnlocked('simon_10')) {
        const ach = this.unlockAchievement('simon_10');
        if (ach) newAchievements.push(ach);
      }
      if (gameData.score >= 20 && !this.isUnlocked('simon_20')) {
        const ach = this.unlockAchievement('simon_20');
        if (ach) newAchievements.push(ach);
      }
    }

    if (gameId === 'flappybird') {
      if (gameData.score >= 10 && !this.isUnlocked('flappy_bronze')) {
        const ach = this.unlockAchievement('flappy_bronze');
        if (ach) newAchievements.push(ach);
      }
      if (gameData.score >= 20 && !this.isUnlocked('flappy_silver')) {
        const ach = this.unlockAchievement('flappy_silver');
        if (ach) newAchievements.push(ach);
      }
      if (gameData.score >= 40 && !this.isUnlocked('flappy_gold')) {
        const ach = this.unlockAchievement('flappy_gold');
        if (ach) newAchievements.push(ach);
      }
    }

    if (gameId === 'typing') {
      if (gameData.wpm >= 50 && !this.isUnlocked('typing_50wpm')) {
        const ach = this.unlockAchievement('typing_50wpm');
        if (ach) newAchievements.push(ach);
      }
      if (gameData.wpm >= 100 && !this.isUnlocked('typing_100wpm')) {
        const ach = this.unlockAchievement('typing_100wpm');
        if (ach) newAchievements.push(ach);
      }
      if (gameData.accuracy === 100 && !this.isUnlocked('typing_perfect')) {
        const ach = this.unlockAchievement('typing_perfect');
        if (ach) newAchievements.push(ach);
      }
    }

    // Check universal achievements
    if (gameData.won && !this.isUnlocked('first_win')) {
      const stats = this.getGameStats(gameId);
      if (stats.wins === 0) {
        const ach = this.unlockAchievement('first_win');
        if (ach) newAchievements.push(ach);
      }
    }

    return newAchievements;
  }

  // Get total achievement points (persistent)
  getTotalPoints() {
    if (!this.currentPlayer) return 0;
    return persistentStorage.getTotalAchievementPoints(this.currentPlayer);
  }

  // Get achievement progress (persistent)
  getProgress() {
    if (!this.currentPlayer) return { unlocked: 0, total: 0, percentage: 0 };
    return persistentStorage.getAchievementProgress(this.currentPlayer, Object.keys(ACHIEVEMENTS).length);
  }

  // Reset all achievements (for testing)
  resetAchievements() {
    persistentStorage.clearAllData();
  }
}

export const achievementService = new AchievementService();
export default achievementService;
