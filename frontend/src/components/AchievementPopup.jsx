import React, { useEffect, useState } from 'react';

/**
 * Achievement Popup - Notifikasi saat unlock achievement
 * Muncul dari bawah dengan animasi smooth
 */
const AchievementPopup = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for slide out animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null;

  return (
    <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[200] transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
    }`}>
      <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 p-1 rounded-xl sm:rounded-2xl shadow-2xl shadow-amber-900/50 animate-pulse-slow">
        <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 max-w-sm mx-auto sm:min-w-[280px]">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="text-2xl sm:text-3xl animate-bounce-slow">{achievement.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-amber-400 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-0.5 sm:mb-1">
                🏆 Achievement!
              </div>
              <h3 className="text-white font-black text-sm sm:text-base leading-tight truncate">
                {achievement.name}
              </h3>
            </div>
            <button 
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-slate-500 hover:text-white transition-colors text-lg sm:text-xl flex-shrink-0"
            >
              ×
            </button>
          </div>

          {/* Description */}
          <p className="text-slate-400 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2">
            {achievement.description}
          </p>

          {/* Points */}
          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-slate-800">
            <span className="text-slate-500 text-[10px] sm:text-xs font-bold">Reward</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-amber-400 font-black text-sm sm:text-base">+{achievement.points}</span>
              <span className="text-slate-500 text-[10px] sm:text-xs font-bold">Points</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementPopup;
