import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { dailyChallengeService } from '../services/dailyChallengeService';

/**
 * Daily Challenge Claim Modal - Modal untuk claim daily challenge rewards
 */
const DailyChallengeClaimModal = ({ isOpen, onClose, onRewardClaimed }) => {
  const [unclaimedChallenges, setUnclaimedChallenges] = useState([]);
  const [claimingAll, setClaimingAll] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUnclaimedChallenges();
    }
  }, [isOpen]);

  const loadUnclaimedChallenges = () => {
    const unclaimed = dailyChallengeService.getUnclaimedChallenges();
    setUnclaimedChallenges(unclaimed);
  };

  const claimSingleChallenge = async (gameId) => {
    const result = dailyChallengeService.claimChallengeReward(gameId);
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
      loadUnclaimedChallenges();
      
      // Notify parent
      if (onRewardClaimed) onRewardClaimed(result);
      
      // Hide animation after 3 seconds
      setTimeout(() => {
        setShowRewardAnimation(false);
        setClaimedRewards([]);
      }, 3000);
    }
  };

  const claimAllChallenges = async () => {
    setClaimingAll(true);
    
    const results = dailyChallengeService.claimAllChallenges();
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
      loadUnclaimedChallenges();
      
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

  const totalXPReward = unclaimedChallenges.reduce((sum, ch) => sum + (ch.reward >= 100 ? 100 : ch.reward >= 75 ? 50 : 25), 0);
  const totalCoinReward = unclaimedChallenges.reduce((sum, ch) => sum + (ch.reward >= 100 ? 20 : ch.reward >= 75 ? 10 : 5), 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
      <div className="relative bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Reward Animation Overlay */}
        {showRewardAnimation && (
          <div className="absolute inset-0 z-50 bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-slate-900/90 border-2 border-emerald-400 rounded-3xl p-8 text-center animate-scale-in">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-3xl font-black text-emerald-400 mb-4">Daily Rewards Claimed!</h3>
              
              <div className="space-y-2">
                {claimedRewards.map((reward, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-xl p-3">
                    <div className="text-lg font-bold text-white mb-1">{reward.challenge.name}</div>
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
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl animate-bounce">🏆</div>
              <div>
                <h2 className="text-2xl font-black text-white">Daily Challenge Rewards</h2>
                <p className="text-emerald-100 text-sm font-bold">
                  {unclaimedChallenges.length} Challenge{unclaimedChallenges.length !== 1 ? 's' : ''} Ready to Claim
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
          {unclaimedChallenges.length > 0 && (
            <div className="mt-4 bg-slate-900/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold">Total Rewards Available:</span>
                <div className="flex items-center gap-4">
                  <span className="text-blue-300 font-black">+{totalXPReward} XP</span>
                  <span className="text-amber-300 font-black">+{totalCoinReward} Coins</span>
                </div>
              </div>
              
              <button
                onClick={claimAllChallenges}
                disabled={claimingAll}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-black rounded-xl transition-all shadow-lg"
              >
                {claimingAll ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Claiming All...
                  </span>
                ) : (
                  '🎉 Claim All Daily Rewards'
                )}
              </button>
            </div>
          )}

          {/* Reset Timer */}
          <div className="mt-4 bg-slate-900/30 rounded-xl p-3 text-center">
            <div className="text-emerald-200 text-xs font-bold mb-1">Challenges Reset In:</div>
            <div className="text-white font-black text-lg">
              {dailyChallengeService.getTimeUntilResetFormatted()}
            </div>
          </div>
        </div>

        {/* Challenges List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-320px)]">
          {unclaimedChallenges.length > 0 ? (
            <div className="space-y-4">
              {unclaimedChallenges.map(challenge => {
                const xpReward = challenge.reward >= 100 ? 100 : challenge.reward >= 75 ? 50 : 25;
                const coinReward = challenge.reward >= 100 ? 20 : challenge.reward >= 75 ? 10 : 5;
                const difficulty = challenge.reward >= 100 ? 'Hard' : challenge.reward >= 75 ? 'Medium' : 'Easy';
                const difficultyColor = challenge.reward >= 100 ? 'text-red-400' : challenge.reward >= 75 ? 'text-yellow-400' : 'text-green-400';
                
                return (
                  <div
                    key={challenge.id}
                    className="bg-gradient-to-r from-slate-800 to-slate-700 border-2 border-emerald-500/30 rounded-2xl p-4 hover:border-emerald-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* Challenge Icon */}
                      <div className="text-4xl animate-pulse">{challenge.icon}</div>
                      
                      {/* Challenge Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-black text-white">{challenge.name}</h3>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full bg-slate-800 ${difficultyColor}`}>
                            {difficulty}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">{challenge.desc}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-400 font-bold">+{xpReward} XP</span>
                          <span className="text-amber-400 font-bold">+{coinReward} Coins</span>
                          <span className="text-slate-500">
                            Completed: {new Date(challenge.completedAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-2 bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-emerald-400 to-green-400 h-full rounded-full transition-all"
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                        <div className="text-xs text-emerald-400 font-bold mt-1">
                          ✅ {challenge.progress}/{challenge.target} - COMPLETED!
                        </div>
                      </div>
                      
                      {/* Claim Button */}
                      <button
                        onClick={() => claimSingleChallenge(challenge.gameId)}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-black rounded-xl transition-all shadow-lg hover:scale-105"
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
              <h3 className="text-2xl font-bold text-white mb-2">All Challenges Claimed!</h3>
              <p className="text-slate-400">No daily challenges to claim right now.</p>
              <p className="text-slate-500 text-sm mt-2">Complete more challenges to earn rewards!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 p-4 border-t border-slate-700">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
            <span>⏰</span>
            <span className="font-bold">Daily challenges reset every day at midnight WIB!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallengeClaimModal;