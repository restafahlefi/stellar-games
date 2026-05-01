import React, { useState, useEffect } from 'react';
import { achievementService } from '../services/achievementService';
import AchievementsModal from './AchievementsModal';

/**
 * Achievement Button - Tombol untuk buka modal achievements
 * Tampilkan di header dengan progress indicator
 */
const AchievementButton = ({ currentGame = 'all' }) => {
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState({ unlocked: 0, total: 0, percentage: 0 });

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    const prog = achievementService.getProgress();
    setProgress(prog);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="relative bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all flex items-center gap-2 group"
      >
        {/* Icon with glow effect */}
        <div className="relative">
          <span className="text-xl group-hover:scale-110 transition-transform inline-block">🏆</span>
          {progress.percentage > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Progress Text */}
        <div className="text-left">
          <div className="text-xs text-slate-500 font-bold leading-none">Achievements</div>
          <div className="text-sm text-amber-400 font-black leading-none mt-0.5">
            {progress.unlocked}/{progress.total}
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
              className="text-slate-700"
            />
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={`${2 * Math.PI * 12 * (1 - progress.percentage / 100)}`}
              className="text-amber-500 transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-amber-400">
            {progress.percentage}%
          </div>
        </div>
      </button>

      <AchievementsModal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          loadProgress(); // Refresh progress when modal closes
        }}
        currentGame={currentGame}
      />
    </>
  );
};

export default AchievementButton;
