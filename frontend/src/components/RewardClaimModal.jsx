import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { rewardSystem } from '../services/rewardSystem';

/**
 * Reward Claim Modal - Modal untuk claim achievements dan rewards
 */
const RewardClaimModal = ({ isOpen, onClose, onRewardClaimed }) => {
  const [unclaimedAchievements, setUnclaimedAchievements] = useState([]);
  const [claimingAll, setClaimingAll] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUnclaimedAchievements();
    }
  }, [isOpen]);

  const loadUnclaimedAchievements = () => {
    const unclaimed = rewardSystem.getUnclaimedAchievements();
    setUnclaimedAchievements(unclaimed);
  };

  const claimSingleAchievement = async (achievementId) => {
    const result = rewardSystem.claimAchievement(achievementId);
    if (result) {
      // Show reward animation
      setClaimedRewards([result]);
      setShowRewardAnimation(true);
      
      // Confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Update list
      loadUnclaimedAchievements();
      
      // Notify parent
      if (onRewardClaimed) onRewardClaimed(result);
      
      // Hide animation after 3 seconds
      setTimeout(() => {
        setShowRewardAnimation(false);
        setClaimedRewards([]);
      }, 3000);
    }
  };

  const claimAllAchievements = async () => {
    setClaimingAll(true);
    
    const results = rewardSystem.claimAllAchievements();
    if (results.length > 0) {
      // Show reward animation
      setClaimedRewards(results);
      setShowRewardAnimation(true);
      
      // Big confetti effect
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
      
      // Update list
      loadUnclaimedAchievements();
      
      // Notify parent
      if (onRewardClaimed) {
        results.forEach(result => onRewardClaimed(result));
      }
      
      // Hide animation after 4 seconds
      setTimeout(() => {
        setShowRewardAnimation(false);
        setClaimedRewards([]);
      }, 4000);
    }
    
    setClaimingAll(false);
  };

  if (!isOpen) return null;

  const totalXPReward = unclaimedAchievements.reduce((sum, ach) => sum + (ach.points * 5), 0);
  const totalCoinReward = unclaimedAchievements.reduce((sum, ach) => sum + (ach.points * 2), 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
      <div className="relative bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Reward Animation Overlay */}
        {showRewardAnimation && (
          <div className="absolute inset-0 z-50 bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-slate-900/90 border-2 border-amber-400 rounded-3xl p-8 text-center animate-scale-in">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-3xl font-black text-amber-400 mb-4">Rewards Claimed!</h3>
              
              <div className="space-y-2">
                {claimedRewards.map((reward, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-xl p-3">
                    <div className="text-lg font-bold text-white mb-1">{reward.achievement.name}</div>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="text-blue-400 font-bold">+{reward.xpReward} XP</span>
                      <span className="text-amber-400 font-bold">+{reward.coinReward} Coins</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {claimedRewards.length > 1 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-xl font-black text-emerald-400">
                    Total: +{claimedRewards.reduce((sum, r) => sum + r.xpReward, 0)} XP, 
                    +{claimedRewards.reduce((sum, r) => sum + r.coinReward, 0)} Coins
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl animate-bounce">🎁</div>
              <div>
                <h2 className="text-2xl font-black text-white">Claim Rewards</h2>
                <p className="text-amber-100 text-sm font-bold">
                  {unclaimedAchievements.length} Achievement{unclaimedAchievements.length !== 1 ? 's' : ''} Ready to Claim
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white text-2xl transition-all"
            >
              ×
            </button>
          </div>

          {/* Total Rewards Preview */}
          {unclaimedAchievements.length > 0 && (
            <div className="mt-4 bg-slate-900/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold">Total Rewards Available:</span>
                <div className="flex items-center gap-4">
                  <span className="text-blue-300 font-black">+{totalXPReward} XP</span>
                  <span className="text-amber-300 font-black">+{totalCoinReward} Coins</span>
                </div>
              </div>
              
              <button
                onClick={claimAllAchievements}
                disabled={claimingAll}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-black rounded-xl transition-all shadow-lg"
              >
                {claimingAll ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Claiming All...
                  </span>
                ) : (
                  '🎉 Claim All Rewards'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Achievements List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {unclaimedAchievements.length > 0 ? (
            <div className="space-y-4">
              {unclaimedAchievements.map(achievement => {
                const xpReward = achievement.points * 5;
                const coinReward = achievement.points * 2;
                
                return (
                  <div
                    key={achievement.id}
                    className="bg-gradient-to-r from-slate-800 to-slate-700 border-2 border-amber-500/30 rounded-2xl p-4 hover:border-amber-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* Achievement Icon */}
                      <div className="text-4xl animate-pulse">{achievement.icon}</div>
                      
                      {/* Achievement Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-white mb-1">{achievement.name}</h3>
                        <p className="text-slate-300 text-sm mb-2">{achievement.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-400 font-bold">+{xpReward} XP</span>
                          <span className="text-amber-400 font-bold">+{coinReward} Coins</span>
                          <span className="text-slate-500">
                            Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Claim Button */}
                      <button
                        onClick={() => claimSingleAchievement(achievement.id)}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black rounded-xl transition-all shadow-lg hover:scale-105"
                      >
                        Claim
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
              <p className="text-slate-400">No achievements to claim right now.</p>
              <p className="text-slate-500 text-sm mt-2">Keep playing to unlock more achievements!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 p-4 border-t border-slate-700">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
            <span>💡</span>
            <span className="font-bold">Achievements give you XP and Coins to level up and unlock rewards!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardClaimModal;