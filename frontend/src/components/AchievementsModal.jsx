import React, { useState, useEffect } from 'react';
import { achievementService } from '../services/achievementService';

/**
 * Achievements Modal - Tampilkan semua achievements
 * Filter by game, show progress, locked/unlocked status
 */
const AchievementsModal = ({ isOpen, onClose, currentGame = 'all' }) => {
  const [filter, setFilter] = useState(currentGame);
  const [achievements, setAchievements] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState({});
  const [progress, setProgress] = useState({ unlocked: 0, total: 0, percentage: 0 });
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadAchievements();
    }
  }, [isOpen, filter]);

  const loadAchievements = () => {
    const allAchievements = achievementService.getAllAchievements();
    const unlocked = achievementService.getUnlockedAchievements();
    const prog = achievementService.getProgress();
    const points = achievementService.getTotalPoints();

    // Filter achievements
    let filtered = Object.values(allAchievements);
    if (filter !== 'all') {
      filtered = filtered.filter(a => a.game === filter || a.game === 'all');
    }

    setAchievements(filtered);
    setUnlockedAchievements(unlocked);
    setProgress(prog);
    setTotalPoints(points);
  };

  if (!isOpen) return null;

  const gameFilters = [
    { id: 'all', name: 'Semua', icon: '🎮' },
    { id: 'snake', name: 'Snake', icon: '🐍' },
    { id: 'memory', name: 'Memory', icon: '🧠' },
    { id: 'simon', name: 'Simon', icon: '🎵' },
    { id: 'tictactoe', name: 'Tic Tac Toe', icon: '❌' },
    { id: 'connect4', name: 'Connect 4', icon: '🔴' },
    { id: 'rps', name: 'RPS', icon: '✊' },
    { id: 'wordle', name: 'Wordle', icon: '📝' },
    { id: 'flappybird', name: 'Flappy', icon: '🐦' },
    { id: 'pacman', name: 'Pac-Man', icon: '👻' },
    { id: 'game2048', name: '2048', icon: '🔢' },
    { id: 'minesweeper', name: 'Mines', icon: '💣' },
    { id: 'typing', name: 'Typing', icon: '⌨️' }
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
      <div className="relative bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🏆</div>
              <div>
                <h2 className="text-2xl font-black text-white">Achievements</h2>
                <p className="text-amber-100 text-sm font-bold">Koleksi Pencapaian Anda</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white text-2xl transition-all"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-bold">Progress</span>
              <span className="text-amber-200 text-sm font-black">
                {progress.unlocked}/{progress.total} ({progress.percentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
              <span className="text-slate-300 text-xs font-bold">Total Points</span>
              <span className="text-amber-400 text-xl font-black">{totalPoints}</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-slate-800/50 p-4 border-b border-slate-700 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {gameFilters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  filter === f.id
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {f.icon} {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-320px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map(achievement => {
              const isUnlocked = !!unlockedAchievements[achievement.id];
              const unlockedData = unlockedAchievements[achievement.id];

              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30'
                      : 'bg-slate-800/30 border-slate-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`text-4xl ${isUnlocked ? 'animate-bounce-slow' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`font-black text-lg ${
                          isUnlocked ? 'text-white' : 'text-slate-500'
                        }`}>
                          {achievement.name}
                        </h3>
                        {isUnlocked && (
                          <div className="text-amber-400 text-xl">✓</div>
                        )}
                      </div>

                      <p className={`text-sm mb-2 leading-relaxed ${
                        isUnlocked ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {achievement.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          isUnlocked ? 'text-amber-400' : 'text-slate-600'
                        }`}>
                          +{achievement.points} Points
                        </span>
                        {isUnlocked && unlockedData && (
                          <span className="text-xs text-slate-500">
                            {new Date(unlockedData.unlockedAt).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {achievements.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-slate-500 font-bold">Tidak ada achievement untuk filter ini</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 p-4 border-t border-slate-700">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
            <span>💡</span>
            <span className="font-bold">Mainkan game untuk unlock lebih banyak achievements!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsModal;
