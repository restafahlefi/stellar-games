import React, { useState, useEffect } from 'react';
import { rewardSystem } from '../services/rewardSystem';
import RewardClaimModal from './RewardClaimModal';

/**
 * Player Profile Component - Menampilkan XP, Level, Coins, dan Progress
 */
const PlayerProfile = ({ playerName, compact = false }) => {
  const [profile, setProfile] = useState(null);
  const [levelProgress, setLevelProgress] = useState(null);
  const [playerRank, setPlayerRank] = useState(null);
  const [unclaimedCount, setUnclaimedCount] = useState(0);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    if (playerName) {
      rewardSystem.setCurrentPlayer(playerName);
      loadProfile();
    }
  }, [playerName]);

  const loadProfile = () => {
    const prof = rewardSystem.getPlayerProfile();
    const progress = rewardSystem.getLevelProgress();
    const rank = rewardSystem.getPlayerRank();
    const unclaimed = rewardSystem.getUnclaimedAchievements();
    
    setProfile(prof);
    setLevelProgress(progress);
    setPlayerRank(rank);
    setUnclaimedCount(unclaimed.length);
  };

  const handleRewardClaimed = () => {
    loadProfile(); // Refresh profile after claiming rewards
  };

  if (!profile || !levelProgress || !playerRank) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded mb-2"></div>
        <div className="h-6 bg-slate-700 rounded"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex items-center gap-3 hover:border-amber-500/50 transition-all">
          {/* Rank Icon */}
          <div className="text-2xl">{playerRank.rankIcon}</div>
          
          {/* Level & XP */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-black text-white">Lv.{levelProgress.currentLevel}</span>
              <span className="text-xs text-slate-400">{playerRank.rank}</span>
            </div>
            
            {/* XP Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelProgress.percentage}%` }}
              ></div>
            </div>
            
            <div className="text-xs text-slate-500 mt-1">
              {levelProgress.progressXP}/{levelProgress.neededXP} XP
            </div>
          </div>
          
          {/* Coins */}
          <div className="text-right">
            <div className="text-amber-400 font-black text-lg">{profile.coins}</div>
            <div className="text-xs text-slate-500">Coins</div>
          </div>
          
          {/* Claim Button */}
          {unclaimedCount > 0 && (
            <button
              onClick={() => setShowClaimModal(true)}
              className="relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-3 py-2 rounded-lg transition-all text-xs"
            >
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black">
                {unclaimedCount}
              </div>
              Claim
            </button>
          )}
        </div>

        <RewardClaimModal 
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          onRewardClaimed={handleRewardClaimed}
        />
      </>
    );
  }

  // Full profile view
  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{playerRank.rankIcon}</div>
            <div>
              <h2 className="text-2xl font-black text-white">{playerName}</h2>
              <p className="text-slate-400 font-bold">{playerRank.rank}</p>
            </div>
          </div>
          
          {unclaimedCount > 0 && (
            <button
              onClick={() => setShowClaimModal(true)}
              className="relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black px-4 py-2 rounded-xl transition-all shadow-lg hover:scale-105"
            >
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-black">
                {unclaimedCount}
              </div>
              🎁 Claim Rewards
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-blue-400">{levelProgress.currentLevel}</div>
            <div className="text-xs text-slate-500 font-bold">Level</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-cyan-400">{profile.xp.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-bold">Total XP</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-amber-400">{profile.coins}</div>
            <div className="text-xs text-slate-500 font-bold">Coins</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-emerald-400">{profile.totalAchievements}</div>
            <div className="text-xs text-slate-500 font-bold">Achievements</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold">Level Progress</span>
            <span className="text-slate-400 text-sm">
              {levelProgress.progressXP}/{levelProgress.neededXP} XP ({levelProgress.percentage}%)
            </span>
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden mb-2">
            <div 
              className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500 relative"
              style={{ width: `${levelProgress.percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Level {levelProgress.currentLevel}</span>
            <span>Level {levelProgress.currentLevel + 1}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-slate-400 mb-1">Games Played</div>
            <div className="text-white font-bold">{profile.totalGamesPlayed}</div>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-slate-400 mb-1">Member Since</div>
            <div className="text-white font-bold">
              {new Date(profile.joinDate).toLocaleDateString('id-ID')}
            </div>
          </div>
        </div>
      </div>

      <RewardClaimModal 
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onRewardClaimed={handleRewardClaimed}
      />
    </>
  );
};

export default PlayerProfile;