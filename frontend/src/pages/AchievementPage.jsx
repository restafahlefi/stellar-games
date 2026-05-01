import React, { useState, useEffect } from 'react';
import { achievementService } from '../services/achievementService';
import { GAMES } from '../data/gamesData';

/**
 * Achievement Page - Halaman khusus untuk melihat semua achievements
 * Menampilkan progress, filter by game, locked/unlocked status
 */
const AchievementPage = ({ onBack }) => {
  const [filter, setFilter] = useState('all');
  const [achievements, setAchievements] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState({});
  const [progress, setProgress] = useState({ unlocked: 0, total: 0, percentage: 0 });
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, [filter]);

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

    // Sort: unlocked first, then by points
    filtered.sort((a, b) => {
      const aUnlocked = !!unlocked[a.id];
      const bUnlocked = !!unlocked[b.id];
      if (aUnlocked !== bUnlocked) return bUnlocked ? 1 : -1;
      return b.points - a.points;
    });

    setAchievements(filtered);
    setUnlockedAchievements(unlocked);
    setProgress(prog);
    setTotalPoints(points);
  };

  const gameOptions = [
    { id: 'all', name: 'Semua Game', icon: '🎮' },
    ...GAMES.map(g => ({ id: g.id, name: g.name, icon: g.icon?.[0] || '🎮' }))
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={onBack}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold transition-colors text-sm sm:text-base"
          >
            ← Kembali
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter">
            🏆 ACHIEVEMENTS
          </h1>
          <div className="w-16 sm:w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center">
            <div className="text-amber-400 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1 sm:mb-2">
              Total Unlocked
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mb-1">
              {progress.unlocked}
            </div>
            <div className="text-slate-400 text-xs sm:text-sm font-bold">
              dari {progress.total} achievements
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center">
            <div className="text-blue-400 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1 sm:mb-2">
              Progress
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mb-1">
              {progress.percentage}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 sm:h-3 mt-2 sm:mt-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center">
            <div className="text-purple-400 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1 sm:mb-2">
              Total Points
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mb-1">
              {totalPoints}
            </div>
            <div className="text-slate-400 text-xs sm:text-sm font-bold">
              achievement points
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {gameOptions.map(game => (
            <button
              key={game.id}
              onClick={() => setFilter(game.id)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 ${
                filter === game.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span className="text-sm sm:text-base">{game.icon}</span>
              <span>{game.name}</span>
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {achievements.map(achievement => {
            const isUnlocked = !!unlockedAchievements[achievement.id];
            const unlockedData = unlockedAchievements[achievement.id];

            return (
              <div
                key={achievement.id}
                className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 shadow-lg shadow-amber-900/20'
                    : 'bg-slate-900/50 border-slate-800 opacity-60'
                }`}
              >
                {/* Icon & Status */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`text-3xl sm:text-4xl ${isUnlocked ? 'animate-bounce-slow' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  {isUnlocked ? (
                    <div className="bg-emerald-500 text-white text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 rounded-full">
                      ✓ UNLOCKED
                    </div>
                  ) : (
                    <div className="bg-slate-700 text-slate-400 text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 rounded-full">
                      🔒 LOCKED
                    </div>
                  )}
                </div>

                {/* Name & Description */}
                <h3 className={`text-base sm:text-lg font-black mb-1.5 sm:mb-2 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                  {achievement.name}
                </h3>
                <p className={`text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-2 ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                  {achievement.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] sm:text-xs font-bold ${isUnlocked ? 'text-amber-400' : 'text-slate-600'}`}>
                      +{achievement.points} Points
                    </span>
                  </div>
                  {isUnlocked && unlockedData && (
                    <div className="text-[10px] sm:text-xs text-slate-500 font-medium">
                      {new Date(unlockedData.unlockedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {achievements.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-black text-slate-400 mb-2">
              Tidak ada achievement
            </h3>
            <p className="text-slate-600">
              Pilih game lain untuk melihat achievements
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementPage;
