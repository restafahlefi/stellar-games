import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

/**
 * Level Up Notification - Notifikasi saat player naik level
 */
const LevelUpNotification = ({ isVisible, levelData, onClose }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible && levelData) {
      setShowAnimation(true);
      
      // Confetti celebration
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF']
      });
      
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, levelData]);

  const handleClose = () => {
    setShowAnimation(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible || !levelData) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className={`relative transform transition-all duration-500 ${showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
        
        {/* Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl opacity-30 blur-2xl animate-pulse"></div>
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-4 border-yellow-500 rounded-3xl p-8 text-center shadow-2xl max-w-md w-full">
          
          {/* Sparkle Effects */}
          <div className="absolute top-4 left-4 text-2xl animate-bounce" style={{animationDelay: '0s'}}>✨</div>
          <div className="absolute top-6 right-6 text-xl animate-bounce" style={{animationDelay: '0.5s'}}>⭐</div>
          <div className="absolute bottom-6 left-6 text-xl animate-bounce" style={{animationDelay: '1s'}}>🌟</div>
          <div className="absolute bottom-4 right-4 text-2xl animate-bounce" style={{animationDelay: '1.5s'}}>💫</div>
          
          {/* Level Up Icon */}
          <div className="text-8xl mb-4 animate-bounce">🎉</div>
          
          {/* Title */}
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-gradient">
            LEVEL UP!
          </h2>
          
          {/* Level Display */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border-2 border-slate-600">
              <div className="text-2xl font-black text-slate-400">{levelData.oldLevel}</div>
              <div className="text-xs text-slate-500 font-bold">Previous</div>
            </div>
            
            <div className="text-4xl animate-pulse">➡️</div>
            
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 border-2 border-yellow-400 shadow-lg shadow-yellow-500/30">
              <div className="text-2xl font-black text-white">{levelData.newLevel}</div>
              <div className="text-xs text-yellow-100 font-bold">New Level</div>
            </div>
          </div>
          
          {/* XP Gained */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
            <div className="text-blue-400 text-2xl font-black mb-1">+{levelData.xpGained} XP</div>
            <div className="text-slate-400 text-sm font-bold">{levelData.reason}</div>
            <div className="text-slate-500 text-xs mt-1">Total XP: {levelData.totalXP.toLocaleString()}</div>
          </div>
          
          {/* Level Reward */}
          {levelData.levelReward > 0 && (
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="text-amber-400 text-xl font-black mb-1">🎁 Level Reward</div>
              <div className="text-amber-300 text-lg font-bold">+{levelData.levelReward} Coins</div>
              <div className="text-amber-500/70 text-xs">Bonus for reaching level {levelData.newLevel}!</div>
            </div>
          )}
          
          {/* Motivational Message */}
          <div className="mb-6">
            <p className="text-slate-300 text-sm font-bold leading-relaxed">
              {levelData.newLevel >= 50 ? "🏆 You're a legend! Keep dominating!" :
               levelData.newLevel >= 30 ? "⭐ Master level achieved! Incredible!" :
               levelData.newLevel >= 20 ? "🎯 Expert status unlocked! Amazing!" :
               levelData.newLevel >= 10 ? "🚀 Pro gamer mode activated!" :
               levelData.newLevel >= 5 ? "🎮 You're getting good at this!" :
               "🌱 Great progress! Keep it up!"}
            </p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-black rounded-xl transition-all shadow-lg hover:scale-105"
          >
            🎉 Awesome! Continue Playing
          </button>
          
          {/* Auto Close Timer */}
          <div className="mt-3 text-slate-500 text-xs font-bold">
            Auto closes in 5 seconds...
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelUpNotification;