import React, { useState, useEffect } from 'react';
import { dailyChallengeService } from '../services/dailyChallengeService';

/**
 * Daily Challenge Card - Tampilkan challenge untuk game tertentu
 * Bisa digunakan di dalam game atau di homepage
 */
const DailyChallengeCard = ({ gameId, compact = false }) => {
  const [challenge, setChallenge] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    loadChallenge();
    
    // Update time every minute
    const interval = setInterval(() => {
      setTimeLeft(dailyChallengeService.getTimeUntilResetFormatted());
    }, 60000);

    return () => clearInterval(interval);
  }, [gameId]);

  const loadChallenge = () => {
    const ch = dailyChallengeService.getDailyChallenge(gameId);
    setChallenge(ch);
    setTimeLeft(dailyChallengeService.getTimeUntilResetFormatted());
  };

  if (!challenge) return null;

  const progressPercentage = Math.min((challenge.progress / challenge.target) * 100, 100);

  if (compact) {
    // Compact version for in-game display
    return (
      <div className={`bg-gradient-to-r p-[2px] rounded-lg sm:rounded-xl ${
        challenge.completed 
          ? 'from-emerald-500 to-green-500' 
          : 'from-amber-500 to-orange-500'
      }`}>
        <div className="bg-slate-900 rounded-lg sm:rounded-xl p-2 sm:p-3">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="text-xl sm:text-2xl flex-shrink-0">{challenge.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] sm:text-xs text-amber-400 font-bold">Daily Challenge</div>
              <div className="text-xs sm:text-sm text-white font-black truncate">{challenge.name}</div>
            </div>
            {challenge.completed && (
              <div className="text-emerald-400 text-xl sm:text-2xl flex-shrink-0">✓</div>
            )}
          </div>
          
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1.5 sm:mb-2 line-clamp-2">{challenge.desc}</p>
          
          {/* Progress Bar */}
          <div className="mb-1.5 sm:mb-2">
            <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
              <span className="text-slate-500 font-bold">Progress</span>
              <span className="text-amber-400 font-black">
                {challenge.progress}/{challenge.target}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 sm:h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  challenge.completed 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-400' 
                    : 'bg-gradient-to-r from-amber-400 to-orange-400'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Reward */}
          <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-800">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold">Reward</span>
            <span className="text-amber-400 font-black text-xs sm:text-sm">+{challenge.reward} pts</span>
          </div>
        </div>
      </div>
    );
  }

  // Full version for homepage
  return (
    <div className={`bg-gradient-to-br p-1 rounded-xl sm:rounded-2xl shadow-xl ${
      challenge.completed 
        ? 'from-emerald-500 via-green-500 to-teal-500' 
        : 'from-amber-500 via-yellow-500 to-orange-500'
    }`}>
      <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="text-2xl sm:text-3xl flex-shrink-0">{challenge.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1 gap-2">
              <div className="text-[10px] sm:text-xs text-amber-400 font-black uppercase tracking-wider">
                Daily Challenge
              </div>
              {challenge.completed && (
                <div className="flex items-center gap-1 bg-emerald-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg flex-shrink-0">
                  <span className="text-emerald-400 text-xs sm:text-sm">✓</span>
                  <span className="text-emerald-400 text-[10px] sm:text-xs font-bold">Done</span>
                </div>
              )}
            </div>
            <h3 className="text-white font-black text-base sm:text-lg mb-1 truncate">{challenge.name}</h3>
            <p className="text-slate-400 text-xs sm:text-sm line-clamp-2">{challenge.desc}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2 sm:mb-3">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-1 sm:mb-2">
            <span className="text-slate-500 font-bold">Progress</span>
            <span className="text-amber-400 font-black">
              {challenge.progress}/{challenge.target} ({Math.round(progressPercentage)}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 sm:h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                challenge.completed 
                  ? 'bg-gradient-to-r from-emerald-400 to-green-400' 
                  : 'bg-gradient-to-r from-amber-400 to-orange-400'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-slate-800">
          <div>
            <div className="text-[10px] sm:text-xs text-slate-500 font-bold mb-0.5 sm:mb-1">Reward</div>
            <div className="text-amber-400 font-black text-sm sm:text-base">+{challenge.reward} Points</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] sm:text-xs text-slate-500 font-bold mb-0.5 sm:mb-1">Reset in</div>
            <div className="text-slate-300 font-black text-xs sm:text-sm">{timeLeft}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallengeCard;
