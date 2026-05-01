import React, { useState, useEffect } from 'react';

/**
 * Komponen pembantu untuk kembali otomatis ke menu setelah game over.
 * Memberikan pengalaman arcade yang seamless.
 */
const AutoReturnTimer = ({ onTimerEnd, seconds = 8 }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimerEnd();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onTimerEnd]);

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-slate-600 transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / seconds) * 100}%` }}
        ></div>
      </div>
      <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">
        Returning to menu in {timeLeft}s
      </p>
    </div>
  );
};

export default AutoReturnTimer;
