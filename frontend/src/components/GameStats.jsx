import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../services/leaderboardService';

/**
 * Komponen untuk menampilkan statistik game:
 * - Best Score pemain
 * - Top 5 Leaderboard game
 * - Personal rank
 * OPTIMIZED: Refresh PAUSED saat bermain untuk menghindari lag
 */
export default function GameStats({ gameId, playerName, currentScore = 0, isPlaying = false }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const [playerRank, setPlayerRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch leaderboard untuk game ini
        const leaderboardData = await leaderboardService.getGameLeaderboard(gameId);
        
        if (leaderboardData?.success && leaderboardData?.data) {
          setLeaderboard(leaderboardData.data.slice(0, 5));
          
          // Cari best score pemain dari leaderboard
          const playerEntry = leaderboardData.data.find(
            entry => entry.playerName === playerName
          );
          
          if (playerEntry) {
            setBestScore(playerEntry.score);
            // Cari rank pemain
            const rank = leaderboardData.data.findIndex(
              entry => entry.playerName === playerName
            ) + 1;
            setPlayerRank(rank);
          }
        }
      } catch (error) {
        console.error('Error fetching game stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (gameId && playerName) {
      fetchStats();
      
      // DISABLED: Tidak refresh saat bermain untuk menghindari lag
      // Hanya fetch sekali saat component mount
      // const interval = isPlaying ? setInterval(fetchStats, 10000) : null;
      // return () => {
      //   if (interval) clearInterval(interval);
      // };
    }
  }, [gameId, playerName]); // Removed isPlaying dependency

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-24 mb-2"></div>
        <div className="h-6 bg-slate-700 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {/* Best Score */}
      <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 min-w-[100px]">
        <span className="text-slate-500 text-[10px] block leading-none uppercase tracking-widest mb-1">
          YOUR BEST
        </span>
        <span className="text-xl font-mono text-emerald-400 font-bold">
          {bestScore > 0 ? bestScore : '-'}
        </span>
      </div>

      {/* Current Score (jika sedang bermain) */}
      {isPlaying && currentScore > 0 && (
        <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 min-w-[100px]">
          <span className="text-slate-500 text-[10px] block leading-none uppercase tracking-widest mb-1">
            CURRENT
          </span>
          <span className={`text-xl font-mono font-bold ${currentScore > bestScore ? 'text-amber-400 animate-pulse' : 'text-blue-400'}`}>
            {currentScore}
          </span>
          {currentScore > bestScore && (
            <span className="text-[8px] text-amber-400 block">NEW RECORD!</span>
          )}
        </div>
      )}

      {/* Player Rank */}
      {playerRank && (
        <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 min-w-[100px]">
          <span className="text-slate-500 text-[10px] block leading-none uppercase tracking-widest mb-1">
            YOUR RANK
          </span>
          <span className="text-xl font-mono text-purple-400 font-bold">
            #{playerRank}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Komponen untuk menampilkan Top 5 Leaderboard
 * OPTIMIZED: Refresh interval diperlambat untuk menghindari lag
 */
export function GameLeaderboard({ gameId, compact = false }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardService.getGameLeaderboard(gameId);
        if (data?.success && data?.data) {
          setLeaderboard(data.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchLeaderboard();
      // OPTIMIZED: Diperlambat dari 15s ke 30s untuk mengurangi lag
      const interval = setInterval(fetchLeaderboard, 30000);
      return () => clearInterval(interval);
    }
  }, [gameId]);

  if (loading) {
    return (
      <div className={`bg-slate-800/50 rounded-xl p-4 border border-slate-700 ${compact ? 'min-w-[200px]' : 'min-w-[280px]'}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-slate-700 rounded w-20 mb-3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className={`bg-slate-800/50 rounded-xl p-4 border border-slate-700 ${compact ? 'min-w-[200px]' : 'min-w-[280px]'}`}>
        <span className="text-slate-500 text-[10px] block leading-none uppercase tracking-widest mb-3">
          🏆 TOP PLAYERS
        </span>
        <p className="text-slate-600 text-xs italic">No scores yet...</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 rounded-xl p-4 border border-slate-700 ${compact ? 'min-w-[200px]' : 'min-w-[280px]'}`}>
      <span className="text-slate-500 text-[10px] block leading-none uppercase tracking-widest mb-3">
        🏆 TOP PLAYERS
      </span>
      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const medals = ['🥇', '🥈', '🥉'];
          const medal = medals[index] || `#${index + 1}`;
          
          return (
            <div 
              key={index} 
              className={`flex justify-between items-center ${compact ? 'text-xs' : 'text-sm'} font-bold`}
            >
              <span className="text-slate-400 flex items-center gap-2">
                <span className={compact ? 'text-base' : 'text-lg'}>{medal}</span>
                <span className="truncate max-w-[120px]">{entry.playerName}</span>
              </span>
              <span className={`${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-blue-400'} font-mono`}>
                {entry.score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
