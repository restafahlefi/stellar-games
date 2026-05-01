/**
 * Reward System Service
 * Mengelola XP, Level, Coins, dan Reward Claims
 */

import { persistentStorage } from './persistentStorageService';

class RewardSystemService {
  constructor() {
    this.currentPlayer = null;
  }

  setCurrentPlayer(playerName) {
    this.currentPlayer = playerName;
  }

  // Get player profile with XP, Level, Coins
  getPlayerProfile() {
    if (!this.currentPlayer) return this.getDefaultProfile();
    
    const profile = persistentStorage.getPlayerData(this.currentPlayer, 'profile') || this.getDefaultProfile();
    return profile;
  }

  getDefaultProfile() {
    return {
      xp: 0,
      level: 1,
      coins: 0,
      totalAchievements: 0,
      totalGamesPlayed: 0,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
  }

  // Calculate level from XP
  calculateLevel(xp) {
    // Level formula: Level = floor(sqrt(XP / 100)) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  // Calculate XP needed for next level
  getXPForNextLevel(currentLevel) {
    return Math.pow(currentLevel, 2) * 100;
  }

  // Get XP progress for current level
  getLevelProgress() {
    const profile = this.getPlayerProfile();
    const currentLevel = this.calculateLevel(profile.xp);
    const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
    const nextLevelXP = this.getXPForNextLevel(currentLevel);
    const progressXP = profile.xp - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    
    return {
      currentLevel,
      currentXP: profile.xp,
      progressXP,
      neededXP,
      percentage: Math.round((progressXP / neededXP) * 100)
    };
  }

  // Add XP and update level
  addXP(amount, reason = 'Game Activity') {
    if (!this.currentPlayer) return null;
    
    const profile = this.getPlayerProfile();
    const oldLevel = this.calculateLevel(profile.xp);
    
    profile.xp += amount;
    profile.lastActive = new Date().toISOString();
    
    const newLevel = this.calculateLevel(profile.xp);
    const leveledUp = newLevel > oldLevel;
    
    // Level up rewards
    if (leveledUp) {
      const levelReward = newLevel * 10; // 10 coins per level
      profile.coins += levelReward;
    }
    
    persistentStorage.setPlayerData(this.currentPlayer, 'profile', profile);
    
    return {
      xpGained: amount,
      totalXP: profile.xp,
      oldLevel,
      newLevel,
      leveledUp,
      levelReward: leveledUp ? newLevel * 10 : 0,
      reason
    };
  }

  // Add coins
  addCoins(amount, reason = 'Reward') {
    if (!this.currentPlayer) return null;
    
    const profile = this.getPlayerProfile();
    profile.coins += amount;
    profile.lastActive = new Date().toISOString();
    
    persistentStorage.setPlayerData(this.currentPlayer, 'profile', profile);
    
    return {
      coinsGained: amount,
      totalCoins: profile.coins,
      reason
    };
  }

  // Spend coins
  spendCoins(amount, reason = 'Purchase') {
    if (!this.currentPlayer) return false;
    
    const profile = this.getPlayerProfile();
    if (profile.coins < amount) return false;
    
    profile.coins -= amount;
    profile.lastActive = new Date().toISOString();
    
    persistentStorage.setPlayerData(this.currentPlayer, 'profile', profile);
    
    return {
      coinsSpent: amount,
      remainingCoins: profile.coins,
      reason
    };
  }

  // Get unclaimed achievements
  getUnclaimedAchievements() {
    if (!this.currentPlayer) return [];
    
    const unclaimed = persistentStorage.getPlayerData(this.currentPlayer, 'unclaimed_achievements') || [];
    return unclaimed;
  }

  // Add achievement to unclaimed list
  addUnclaimedAchievement(achievement) {
    if (!this.currentPlayer) return;
    
    const unclaimed = this.getUnclaimedAchievements();
    const exists = unclaimed.find(a => a.id === achievement.id);
    
    if (!exists) {
      unclaimed.push({
        ...achievement,
        unlockedAt: new Date().toISOString(),
        claimed: false
      });
      
      persistentStorage.setPlayerData(this.currentPlayer, 'unclaimed_achievements', unclaimed);
    }
  }

  // Claim achievement rewards
  claimAchievement(achievementId) {
    if (!this.currentPlayer) return null;
    
    const unclaimed = this.getUnclaimedAchievements();
    const achievement = unclaimed.find(a => a.id === achievementId);
    
    if (!achievement) return null;
    
    // Calculate rewards
    const xpReward = achievement.points * 5; // 5 XP per point
    const coinReward = achievement.points * 2; // 2 coins per point
    
    // Add rewards
    const xpResult = this.addXP(xpReward, `Achievement: ${achievement.name}`);
    const coinResult = this.addCoins(coinReward, `Achievement: ${achievement.name}`);
    
    // Remove from unclaimed
    const newUnclaimed = unclaimed.filter(a => a.id !== achievementId);
    persistentStorage.setPlayerData(this.currentPlayer, 'unclaimed_achievements', newUnclaimed);
    
    // Update profile stats
    const profile = this.getPlayerProfile();
    profile.totalAchievements += 1;
    persistentStorage.setPlayerData(this.currentPlayer, 'profile', profile);
    
    return {
      achievement,
      xpReward,
      coinReward,
      xpResult,
      coinResult
    };
  }

  // Claim all achievements
  claimAllAchievements() {
    const unclaimed = this.getUnclaimedAchievements();
    const results = [];
    
    unclaimed.forEach(achievement => {
      const result = this.claimAchievement(achievement.id);
      if (result) results.push(result);
    });
    
    return results;
  }

  // Get daily challenge rewards
  getDailyChallengeRewards() {
    return {
      easy: { xp: 25, coins: 5 },
      medium: { xp: 50, coins: 10 },
      hard: { xp: 100, coins: 20 },
      completion_bonus: { xp: 200, coins: 50 } // For completing all daily challenges
    };
  }

  // Claim daily challenge reward
  claimDailyChallengeReward(challengeId, difficulty = 'medium') {
    if (!this.currentPlayer) return null;
    
    const rewards = this.getDailyChallengeRewards();
    const reward = rewards[difficulty] || rewards.medium;
    
    const xpResult = this.addXP(reward.xp, `Daily Challenge: ${challengeId}`);
    const coinResult = this.addCoins(reward.coins, `Daily Challenge: ${challengeId}`);
    
    return {
      challengeId,
      difficulty,
      xpReward: reward.xp,
      coinReward: reward.coins,
      xpResult,
      coinResult
    };
  }

  // Get milestone rewards
  getMilestones() {
    return [
      { id: 'first_game', requirement: 1, type: 'games_played', reward: { xp: 50, coins: 10 }, name: 'First Game', icon: '🎮' },
      { id: 'games_10', requirement: 10, type: 'games_played', reward: { xp: 100, coins: 25 }, name: '10 Games', icon: '🎯' },
      { id: 'games_50', requirement: 50, type: 'games_played', reward: { xp: 250, coins: 50 }, name: '50 Games', icon: '🏆' },
      { id: 'games_100', requirement: 100, type: 'games_played', reward: { xp: 500, coins: 100 }, name: '100 Games', icon: '👑' },
      { id: 'level_5', requirement: 5, type: 'level', reward: { xp: 0, coins: 50 }, name: 'Level 5', icon: '⭐' },
      { id: 'level_10', requirement: 10, type: 'level', reward: { xp: 0, coins: 100 }, name: 'Level 10', icon: '🌟' },
      { id: 'achievements_5', requirement: 5, type: 'achievements', reward: { xp: 100, coins: 25 }, name: '5 Achievements', icon: '🏅' },
      { id: 'achievements_10', requirement: 10, type: 'achievements', reward: { xp: 200, coins: 50 }, name: '10 Achievements', icon: '🎖️' }
    ];
  }

  // Check and claim milestone rewards
  checkMilestones() {
    if (!this.currentPlayer) return [];
    
    const profile = this.getPlayerProfile();
    const progress = this.getLevelProgress();
    const milestones = this.getMilestones();
    const claimedMilestones = persistentStorage.getPlayerData(this.currentPlayer, 'claimed_milestones') || [];
    
    const newMilestones = [];
    
    milestones.forEach(milestone => {
      if (claimedMilestones.includes(milestone.id)) return;
      
      let achieved = false;
      
      switch (milestone.type) {
        case 'games_played':
          achieved = profile.totalGamesPlayed >= milestone.requirement;
          break;
        case 'level':
          achieved = progress.currentLevel >= milestone.requirement;
          break;
        case 'achievements':
          achieved = profile.totalAchievements >= milestone.requirement;
          break;
      }
      
      if (achieved) {
        // Claim milestone
        const xpResult = this.addXP(milestone.reward.xp, `Milestone: ${milestone.name}`);
        const coinResult = this.addCoins(milestone.reward.coins, `Milestone: ${milestone.name}`);
        
        claimedMilestones.push(milestone.id);
        persistentStorage.setPlayerData(this.currentPlayer, 'claimed_milestones', claimedMilestones);
        
        newMilestones.push({
          milestone,
          xpResult,
          coinResult
        });
      }
    });
    
    return newMilestones;
  }

  // Update game stats and check for rewards
  updateGameStats(gameId) {
    if (!this.currentPlayer) return;
    
    const profile = this.getPlayerProfile();
    profile.totalGamesPlayed += 1;
    profile.lastActive = new Date().toISOString();
    persistentStorage.setPlayerData(this.currentPlayer, 'profile', profile);
    
    // Base XP for playing a game
    this.addXP(10, 'Game Completed');
    
    // Check milestones
    return this.checkMilestones();
  }

  // Get player rank based on XP
  getPlayerRank() {
    const profile = this.getPlayerProfile();
    const progress = this.getLevelProgress();
    
    let rank = 'Newbie';
    let rankIcon = '🌱';
    
    if (progress.currentLevel >= 50) {
      rank = 'Legend';
      rankIcon = '👑';
    } else if (progress.currentLevel >= 30) {
      rank = 'Master';
      rankIcon = '🏆';
    } else if (progress.currentLevel >= 20) {
      rank = 'Expert';
      rankIcon = '⭐';
    } else if (progress.currentLevel >= 10) {
      rank = 'Pro';
      rankIcon = '🎯';
    } else if (progress.currentLevel >= 5) {
      rank = 'Intermediate';
      rankIcon = '🎮';
    }
    
    return { rank, rankIcon, level: progress.currentLevel };
  }
}

export const rewardSystem = new RewardSystemService();
export default rewardSystem;