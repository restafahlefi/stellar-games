import React, { useState, useEffect } from 'react';
import { dailyChallengeService } from '../services/dailyChallengeService';
import { GAMES } from '../data/gamesData';

/**
 * Daily Challenges Modal - Tampilkan semua daily challenges
 */
const DailyChallengesModal = ({ isOpen, onClose }) => {
  const [challenges, setChallenges] = useState({});
  const [timeLeft, setTimeLeft] = useState('');
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadChallenges();
      
      // Update time every minute
      const interval = setInterval(() => {
        setTimeLeft(dailyChallengeService.getTimeUntilResetFormatted());
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadChallenges = () => {
    const allChallenges = dailyChallengeService.getAllTodayChallenges();
    const completed = dailyChallengeService.getCompletedCount();
    const total = dailyChallengeService.getTotalCount();
    const time = dailyChallengeService.getTimeUntilResetFormatted();

    setChallenges(allChallenges);
    setCompletedCount(completed);
    setTotalCount(total);
    setTimeLeft(time);
  };

  if (!isOpen) return null;

  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
      <div className="relative bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎯</div>
              <div>
                <h2 className="text-2xl font-black text-white">Daily Challenges</h2>
                <p className="text-amber-100 text-sm font-bold">Tantangan Harian untuk Semua Game</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white text-2xl transition-all"
            >
              ×
            </button>
          </div>

          {/* Progress Summary */}
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-bold">Progress Hari Ini</span>
              <span className="text-amber-200 text-sm font-black">
                {completedCount}/{totalCount} ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mb-3">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-green-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-bold">⏰ Reset dalam:</span>
                <span className="text-amber-200 font-black">{timeLeft}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-bold">🏆 Total Reward:</span>
                <span className="text-amber-200 font-black">
                  {Object.values(challenges).reduce((sum, c) => sum + (c?.completed ? c.reward : 0), 0)} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(challenges).map(([gameId, challenge]) => {
              if (!challenge) return null;

              const game = GAMES.find(g => g.id === gameId);
              const progressPercentage = Math.min((challenge.progress / challenge.target) * 100, 100);

              return (
                <div
                  key={gameId}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    challenge.completed
                      ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30'
                      : 'bg-slate-800/30 border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {/* Icon */}
                    <div className="text-3xl">{challenge.icon}</div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="text-xs text-amber-400 font-bold mb-1">
                            {game?.name || gameId}
                          </div>
                          <h3 className="text-white font-black text-lg">
                            {challenge.name}
                          </h3>
                        </div>
                        {challenge.completed && (
                          <div className="text-emerald-400 text-2xl">✓</div>
                        )}
                      </div>

                      <p className="text-slate-400 text-sm mb-3">
                        {challenge.desc}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500 font-bold">Progress</span>
                          <span className={`font-black ${
                            challenge.completed ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {challenge.progress}/{challenge.target}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
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
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                        <span className="text-xs text-slate-500 font-bold">Reward</span>
                        <span className={`font-black text-sm ${
                          challenge.completed ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          +{challenge.reward} Points
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 p-4 border-t border-slate-700">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
            <span>💡</span>
            <span className="font-bold">Challenge baru setiap hari pukul 00:00 WIB!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallengesModal;
