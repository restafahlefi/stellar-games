import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Komponen untuk menampilkan info reset leaderboard otomatis
 */
export default function LeaderboardResetInfo() {
  const [resetInfo, setResetInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResetInfo = async () => {
      try {
        const response = await api.get('/leaderboard/reset-info');
        if (response.data?.success) {
          setResetInfo(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching reset info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResetInfo();
    // Refresh setiap 1 jam
    const interval = setInterval(fetchResetInfo, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !resetInfo) return null;

  const daysLeft = resetInfo.daysUntilNextReset;
  const isNearReset = daysLeft <= 7;

  return (
    <div className={`bg-slate-800/50 rounded-xl p-4 border ${isNearReset ? 'border-amber-500/50' : 'border-slate-700'}`}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">{isNearReset ? '⚠️' : '📅'}</div>
        <div className="flex-1">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
            Leaderboard Reset
          </div>
          <div className="text-sm font-bold">
            {daysLeft > 0 ? (
              <span className={isNearReset ? 'text-amber-400' : 'text-slate-300'}>
                {daysLeft} hari lagi
              </span>
            ) : (
              <span className="text-rose-400">Segera direset!</span>
            )}
          </div>
        </div>
        <div className="text-xs text-slate-500">
          Reset setiap {resetInfo.resetInterval} hari
        </div>
      </div>
      
      {isNearReset && (
        <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg p-2">
          💡 Leaderboard akan direset dalam {daysLeft} hari. Raih posisi teratas sekarang!
        </div>
      )}
    </div>
  );
}
