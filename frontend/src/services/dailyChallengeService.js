/**
 * Daily Challenge Service
 * Mengelola tantangan harian untuk semua game dengan persistent storage
 * Reset setiap hari pukul 00:00 WIB
 */

import { persistentStorage } from './persistentStorageService';

const DAILY_CHALLENGES = {
  snake: [
    { id: 'snake_score_100', name: 'Snake Master', desc: 'Capai score 100', target: 100, reward: 50, icon: '🐍' },
    { id: 'snake_score_150', name: 'Snake Legend', desc: 'Capai score 150', target: 150, reward: 75, icon: '👑' },
    { id: 'snake_no_death', name: 'Perfect Run', desc: 'Capai score 50 tanpa mati', target: 50, reward: 100, icon: '💎' }
  ],
  memory: [
    { id: 'memory_15_moves', name: 'Quick Memory', desc: 'Selesaikan dalam 15 moves', target: 15, reward: 50, icon: '🧠' },
    { id: 'memory_hard', name: 'Memory Master', desc: 'Selesaikan Hard mode', target: 1, reward: 75, icon: '💎' },
    { id: 'memory_perfect', name: 'Perfect Memory', desc: 'Selesaikan tanpa salah', target: 1, reward: 100, icon: '🏆' }
  ],
  simon: [
    { id: 'simon_15', name: 'Simon 15', desc: 'Capai sequence 15', target: 15, reward: 50, icon: '🎵' },
    { id: 'simon_25', name: 'Simon Master', desc: 'Capai sequence 25', target: 25, reward: 100, icon: '🎼' }
  ],
  tictactoe: [
    { id: 'ttt_win_3', name: 'Win Streak', desc: 'Menang 3x berturut-turut', target: 3, reward: 50, icon: '🔥' },
    { id: 'ttt_online', name: 'Online Victory', desc: 'Menang 1x di mode online', target: 1, reward: 75, icon: '🌐' }
  ],
  connect4: [
    { id: 'c4_win_3', name: 'Connect Streak', desc: 'Menang 3x berturut-turut', target: 3, reward: 50, icon: '🔴' },
    { id: 'c4_online', name: 'Online Champion', desc: 'Menang 1x di mode online', target: 1, reward: 75, icon: '🟡' }
  ],
  rps: [
    { id: 'rps_win_5', name: 'RPS Streak', desc: 'Menang 5x berturut-turut', target: 5, reward: 50, icon: '✊' },
    { id: 'rps_perfect', name: 'Perfect Game', desc: 'Menang 3-0', target: 1, reward: 75, icon: '👑' }
  ],
  wordle: [
    { id: 'wordle_3_tries', name: 'Quick Guess', desc: 'Tebak dalam 3 percobaan', target: 3, reward: 75, icon: '🎯' },
    { id: 'wordle_win', name: 'Daily Wordle', desc: 'Selesaikan Wordle hari ini', target: 1, reward: 50, icon: '📝' }
  ],
  flappybird: [
    { id: 'flappy_30', name: 'Flappy 30', desc: 'Capai score 30', target: 30, reward: 50, icon: '🐦' },
    { id: 'flappy_50', name: 'Flappy Master', desc: 'Capai score 50', target: 50, reward: 100, icon: '🏆' }
  ],
  pacman: [
    { id: 'pacman_level_3', name: 'Level 3', desc: 'Capai level 3', target: 3, reward: 75, icon: '👻' },
    { id: 'pacman_5000', name: 'Score 5000', desc: 'Capai score 5000', target: 5000, reward: 100, icon: '🏆' }
  ],
  game2048: [
    { id: '2048_1024', name: '1024 Tile', desc: 'Capai tile 1024', target: 1024, reward: 75, icon: '🎲' },
    { id: '2048_2048', name: '2048 Tile', desc: 'Capai tile 2048', target: 2048, reward: 150, icon: '👑' }
  ],
  minesweeper: [
    { id: 'mines_medium', name: 'Medium Clear', desc: 'Selesaikan Medium mode', target: 1, reward: 50, icon: '💣' },
    { id: 'mines_hard', name: 'Hard Clear', desc: 'Selesaikan Hard mode', target: 1, reward: 100, icon: '💥' }
  ],
  typing: [
    { id: 'typing_60wpm', name: '60 WPM', desc: 'Capai 60 WPM', target: 60, reward: 50, icon: '⌨️' },
    { id: 'typing_80wpm', name: '80 WPM', desc: 'Capai 80 WPM', target: 80, reward: 75, icon: '🚀' },
    { id: 'typing_100_acc', name: 'Perfect Typing', desc: '100% accuracy', target: 100, reward: 100, icon: '💯' }
  ]
};

class DailyChallengeService {
  constructor() {
    // Daily challenges are global, not player-specific
  }

  // Get today's date string (YYYY-MM-DD)
  getTodayDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  // Check if challenges need reset
  shouldResetChallenges() {
    const lastDate = persistentStorage.getDailyChallengeDate();
    const today = this.getTodayDate();
    return lastDate !== today;
  }

  // Reset daily challenges (global)
  resetChallenges() {
    const today = this.getTodayDate();
    persistentStorage.setDailyChallengeDate(today);
    persistentStorage.setDailyChallenges({});
  }

  // Get random challenge for a game
  getDailyChallenge(gameId) {
    // Check if need reset
    if (this.shouldResetChallenges()) {
      this.resetChallenges();
    }

    const challenges = DAILY_CHALLENGES[gameId];
    if (!challenges || challenges.length === 0) {
      return null;
    }

    // Get or generate today's challenge
    const savedChallenges = this.getSavedChallenges();
    
    if (savedChallenges[gameId]) {
      return savedChallenges[gameId];
    }

    // Generate new challenge (deterministic based on date)
    const today = this.getTodayDate();
    const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    const index = seed % challenges.length;
    const challenge = { ...challenges[index], gameId, completed: false, progress: 0 };

    // Save it
    savedChallenges[gameId] = challenge;
    this.saveChallenges(savedChallenges);

    return challenge;
  }

  // Get all saved challenges (global)
  getSavedChallenges() {
    return persistentStorage.getDailyChallenges();
  }

  // Save challenges (global)
  saveChallenges(challenges) {
    return persistentStorage.setDailyChallenges(challenges);
  }

  // Update challenge progress
  updateProgress(gameId, progress) {
    const challenge = this.getDailyChallenge(gameId);
    if (!challenge || challenge.completed) {
      return null;
    }

    challenge.progress = Math.max(challenge.progress, progress);

    // Check if completed
    if (challenge.progress >= challenge.target) {
      challenge.completed = true;
      challenge.completedAt = new Date().toISOString();
      challenge.claimed = false; // Mark as unclaimed for reward system
    }

    const savedChallenges = this.getSavedChallenges();
    savedChallenges[gameId] = challenge;
    this.saveChallenges(savedChallenges);

    return challenge;
  }

  // Get unclaimed completed challenges
  getUnclaimedChallenges() {
    const challenges = this.getAllTodayChallenges();
    return Object.values(challenges).filter(c => c && c.completed && !c.claimed);
  }

  // Claim challenge reward
  claimChallengeReward(gameId) {
    const challenge = this.getDailyChallenge(gameId);
    if (!challenge || !challenge.completed || challenge.claimed) {
      return null;
    }

    // Mark as claimed
    challenge.claimed = true;
    const savedChallenges = this.getSavedChallenges();
    savedChallenges[gameId] = challenge;
    this.saveChallenges(savedChallenges);

    // Integrate with reward system
    if (typeof window !== 'undefined') {
      import('./rewardSystem').then(({ rewardSystem }) => {
        const difficulty = challenge.reward >= 100 ? 'hard' : challenge.reward >= 75 ? 'medium' : 'easy';
        return rewardSystem.claimDailyChallengeReward(challenge.id, difficulty);
      });
    }

    return {
      challenge,
      xpReward: challenge.reward >= 100 ? 100 : challenge.reward >= 75 ? 50 : 25,
      coinReward: challenge.reward >= 100 ? 20 : challenge.reward >= 75 ? 10 : 5
    };
  }

  // Claim all completed challenges
  claimAllChallenges() {
    const unclaimed = this.getUnclaimedChallenges();
    const results = [];
    
    unclaimed.forEach(challenge => {
      const result = this.claimChallengeReward(challenge.gameId);
      if (result) results.push(result);
    });
    
    return results;
  }

  // Check if challenge is completed
  isCompleted(gameId) {
    const challenge = this.getDailyChallenge(gameId);
    return challenge ? challenge.completed : false;
  }

  // Get all today's challenges
  getAllTodayChallenges() {
    const allChallenges = {};
    Object.keys(DAILY_CHALLENGES).forEach(gameId => {
      allChallenges[gameId] = this.getDailyChallenge(gameId);
    });
    return allChallenges;
  }

  // Get completed challenges count
  getCompletedCount() {
    const challenges = this.getAllTodayChallenges();
    return Object.values(challenges).filter(c => c && c.completed).length;
  }

  // Get total challenges count
  getTotalCount() {
    return Object.keys(DAILY_CHALLENGES).length;
  }

  // Get time until reset (in milliseconds)
  getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow - now;
  }

  // Get time until reset (formatted string)
  getTimeUntilResetFormatted() {
    const ms = this.getTimeUntilReset();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${minutes}m`;
  }
}

export const dailyChallengeService = new DailyChallengeService();
export default dailyChallengeService;
