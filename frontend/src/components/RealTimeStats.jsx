import { useState, useEffect } from 'react';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';

/**
 * Real-time Stats Hook - Provides synchronized data and countdown for all components
 * Update setiap 30 detik dengan countdown timer yang disinkronkan
 * PAUSED saat bermain game untuk menghindari lag
 */
export function useRealTimeStats(isPaused = false) {
  const [stats, setStats] = useState({ totalPlayers: 0, gamesPlayed: 0, activePlayers: 0 });
  const [topPlayers, setTopPlayers] = useState([]);
  const [countdown, setCountdown] = useState(30);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    // Skip if paused (during gameplay)
    if (isPaused) {
      return;
    }

    const fetchData = async () => {
      try {
        setIsUpdating(true);
        
        const [apiStats, apiLeaderboard] = await Promise.all([
          gameService.getGlobalStats(),
          leaderboardService.getGlobalLeaderboard()
        ]);
        
        if (apiStats) setStats(apiStats);
        if (apiLeaderboard?.success) setTopPlayers(apiLeaderboard.data.slice(0, 5));
        
        setLastUpdate(Date.now());
      } catch (e) { 
        console.error('Error fetching real-time stats:', e); 
      } finally {
        setIsUpdating(false);
        setCountdown(30); // Reset countdown after update
      }
    };

    // Initial fetch
    fetchData();

    // Setup intervals - synchronized untuk semua komponen
    const fetchInterval = setInterval(fetchData, 30000); // 30 seconds (optimized)
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 30; // Reset to 30 when it reaches 0
        }
        return prev - 1;
      });
    }, 1000); // Update countdown every second

    return () => {
      clearInterval(fetchInterval);
      clearInterval(countdownInterval);
    };
  }, [isPaused]);

  return {
    stats,
    topPlayers,
    countdown,
    isUpdating,
    lastUpdate
  };
}

// Export default untuk backward compatibility
export default useRealTimeStats;