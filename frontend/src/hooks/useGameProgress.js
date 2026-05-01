import { useState, useCallback } from 'react';
import { achievementService } from '../services/achievementService';
import { dailyChallengeService } from '../services/dailyChallengeService';

/**
 * Custom Hook untuk mengelola Achievement & Daily Challenge dengan Reward System
 * Digunakan di semua game untuk tracking progress
 */
export const useGameProgress = (gameId) => {
  const [newAchievements, setNewAchievements] = useState([]);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [milestoneRewards, setMilestoneRewards] = useState([]);

  /**
   * Check achievements setelah game selesai
   * @param {Object} gameData - Data game (score, won, etc)
   * @returns {Array} - Array of newly unlocked achievements
   */
  const checkAchievements = useCallback((gameData) => {
    const unlocked = achievementService.checkAchievements(gameId, gameData);
    if (unlocked.length > 0) {
      setNewAchievements(unlocked);
      
      // Update reward system stats and check milestones
      if (typeof window !== 'undefined') {
        import('../services/rewardSystem').then(({ rewardSystem }) => {
          const milestones = rewardSystem.updateGameStats(gameId);
          if (milestones && milestones.length > 0) {
            setMilestoneRewards(milestones);
          }
        });
      }
    }
    return unlocked;
  }, [gameId]);

  /**
   * Update daily challenge progress
   * @param {Number} progress - Current progress value
   * @returns {Object|null} - Challenge object if completed, null otherwise
   */
  const updateChallenge = useCallback((progress) => {
    const challenge = dailyChallengeService.updateProgress(gameId, progress);
    if (challenge && challenge.completed && !challengeCompleted) {
      setChallengeCompleted(true);
      return challenge;
    }
    return null;
  }, [gameId, challengeCompleted]);

  /**
   * Update game stats (wins, losses, etc) and add XP
   * @param {Object} updates - Stats to update
   * @param {Number} xpAmount - XP to award (default: 10)
   * @param {String} reason - Reason for XP gain
   */
  const updateStats = useCallback((updates, xpAmount = 10, reason = 'Game Completed') => {
    achievementService.updateGameStats(gameId, updates);
    
    // Add XP and check for level up
    if (typeof window !== 'undefined') {
      import('../services/rewardSystem').then(({ rewardSystem }) => {
        const xpResult = rewardSystem.addXP(xpAmount, reason);
        if (xpResult && xpResult.leveledUp) {
          setLevelUpData(xpResult);
        }
      });
    }
  }, [gameId]);

  /**
   * Award bonus XP for special achievements
   * @param {Number} amount - XP amount
   * @param {String} reason - Reason for bonus
   */
  const awardBonusXP = useCallback((amount, reason) => {
    if (typeof window !== 'undefined') {
      import('../services/rewardSystem').then(({ rewardSystem }) => {
        const xpResult = rewardSystem.addXP(amount, reason);
        if (xpResult && xpResult.leveledUp) {
          setLevelUpData(xpResult);
        }
      });
    }
  }, []);

  /**
   * Get current daily challenge
   * @returns {Object|null} - Current challenge or null
   */
  const getCurrentChallenge = useCallback(() => {
    return dailyChallengeService.getDailyChallenge(gameId);
  }, [gameId]);

  /**
   * Clear new achievements (after showing popup)
   */
  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  /**
   * Reset challenge completed flag
   */
  const resetChallengeCompleted = useCallback(() => {
    setChallengeCompleted(false);
  }, []);

  /**
   * Clear level up notification
   */
  const clearLevelUp = useCallback(() => {
    setLevelUpData(null);
  }, []);

  /**
   * Clear milestone rewards
   */
  const clearMilestoneRewards = useCallback(() => {
    setMilestoneRewards([]);
  }, []);

  return {
    // State
    newAchievements,
    challengeCompleted,
    levelUpData,
    milestoneRewards,
    
    // Methods
    checkAchievements,
    updateChallenge,
    updateStats,
    awardBonusXP,
    getCurrentChallenge,
    clearNewAchievements,
    resetChallengeCompleted,
    clearLevelUp,
    clearMilestoneRewards
  };
};

export default useGameProgress;
