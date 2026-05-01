import React, { useState, useEffect } from 'react';
import { dailyChallengeService } from '../services/dailyChallengeService';
import DailyChallengesModal from './DailyChallengesModal';
import DailyChallengeClaimModal from './DailyChallengeClaimModal';

/**
 * Daily Challenge Button - Tombol untuk buka modal daily challenges
 * Tampilkan di header dengan progress indicator dan claim functionality
 */
const DailyChallengeButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [unclaimedCount, setUnclaimedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    loadProgress();
    
    // Update every minute
    const interval = setInterval(() => {
      loadProgress();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadProgress = () => {
    const completed = dailyChallengeService.getCompletedCount();
    const total = dailyChallengeService.getTotalCount();
    const unclaimed = dailyChallengeService.getUnclaimedChallenges().length;
    const time = dailyChallengeService.getTimeUntilResetFormatted();
    
    setCompletedCount(completed);
    setTotalCount(total);
    setUnclaimedCount(unclaimed);
    setTimeLeft(time);
  };

  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleButtonClick = () => {
    if (unclaimedCount > 0) {
      setShowClaimModal(true);
    } else {
      setShowModal(true);
    }
  };

  const handleRewardClaimed = () => {
    loadProgress(); // Refresh progress after claiming rewards
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className={`relative px-4 py-2 rounded-xl border transition-all flex items-center gap-2 group ${
          unclaimedCount > 0 
            ? 'bg-gradient-to-r from-emerald-600 to-green-600 border-emerald-500 hover:from-emerald-500 hover:to-green-500 animate-pulse' 
            : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
        }`}
      >
        {/* Icon with glow effect */}
        <div className="relative">
          <span className={`text-xl group-hover:scale-110 transition-transform inline-block ${unclaimedCount > 0 ? 'animate-bounce' : ''}`}>
            {unclaimedCount > 0 ? '🎁' : '🎯'}
          </span>
          {unclaimedCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">
              {unclaimedCount}
            </div>
          )}
        </div>

        {/* Progress Text */}
        <div className="text-left">
          <div className={`text-xs font-bold leading-none ${unclaimedCount > 0 ? 'text-emerald-100' : 'text-slate-500'}`}>
            {unclaimedCount > 0 ? 'Claim' : 'Daily'}
          </div>
          <div className={`text-sm font-black leading-none mt-0.5 ${unclaimedCount > 0 ? 'text-white' : 'text-amber-400'}`}>
            {unclaimedCount > 0 ? `${unclaimedCount} Ready` : `${completedCount}/${totalCount}`}
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-8 h-8">
          <svg className="w-8 h-8 transform -rotate-90">
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className={unclaimedCount > 0 ? 'text-emerald-300/30' : 'text-slate-700'}
            />
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={`${2 * Math.PI * 12 * (1 - progressPercentage / 100)}`}
              className={unclaimedCount > 0 ? 'text-white' : 'text-emerald-500'}
              strokeLinecap="round"
              style={{ transition: 'all 0.5s ease' }}
            />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${
            unclaimedCount > 0 ? 'text-white' : 'text-emerald-400'
          }`}>
            {unclaimedCount > 0 ? '🎉' : `${progressPercentage}%`}
          </div>
        </div>

        {/* Time Left Badge */}
        {timeLeft && (
          <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-lg border ${
            unclaimedCount > 0 
              ? 'bg-emerald-800 border-emerald-600' 
              : 'bg-slate-800 border-slate-700'
          }`}>
            <div className={`text-[9px] font-bold ${
              unclaimedCount > 0 ? 'text-emerald-200' : 'text-slate-400'
            }`}>
              ⏰ {timeLeft}
            </div>
          </div>
        )}
      </button>

      <DailyChallengesModal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          loadProgress(); // Refresh progress when modal closes
        }}
      />

      <DailyChallengeClaimModal
        isOpen={showClaimModal}
        onClose={() => {
          setShowClaimModal(false);
          loadProgress(); // Refresh progress when modal closes
        }}
        onRewardClaimed={handleRewardClaimed}
      />
    </>
  );
};

export default DailyChallengeButton;
