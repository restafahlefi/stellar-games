import React, { useState, useEffect, useCallback } from 'react';
import { leaderboardService } from '../services/leaderboardService';
import { 
  ManualRefreshButton, 
  ConnectionStatus, 
  LeaderboardStats, 
  PlayerSearch, 
  LeaderboardPagination,
  UpdateAnimation 
} from './LeaderboardEnhancements';

/**
 * Enhanced Leaderboard Section dengan semua improvements
 * OPTIMIZED: Refresh interval diperlambat untuk mengurangi lag
 */
export default function EnhancedLeaderboardSection() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [topServerGames, setTopServerGames] = useState([]);
  const [filteredGlobalData, setFilteredGlobalData] = useState([]);
  const [activeTab, setActiveTab] = useState('global');
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(15);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [error, setError] = useState(null);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!isOnline) {
      setError('No internet connection');
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      
      // Fetch Global Leaderboard
      const globalData = await leaderboardService.getGlobalLeaderboard();
      if (globalData?.success) {
        setGlobalLeaderboard(globalData.data);
        setFilteredGlobalData(globalData.data.slice(0, 50)); // Show more data
      }

      // Fetch Top Server
      const gameIds = ['snake', 'flappybird', 'game2048', 'pacman', 'memory', 'simonsays', 
                       'typing', 'minesweeper', 'wordle', 'tictactoe', 'rps', 'connect4'];
      
      const topServerPromises = gameIds.map(async (gameId) => {
        const data = await leaderboardService.getGameLeaderboard(gameId);
        if (data?.success && data.data.length > 0) {
          return {
            gameId,
            topScore: data.data[0],
            totalPlayers: data.data.length
          };
        }
        return null;
      });

      const topServerResults = await Promise.all(topServerPromises);
      const validTopServers = topServerResults.filter(item => item !== null);
      setTopServerGames(validTopServers);
      
      setLastUpdate(Date.now());
      
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setError('Failed to update leaderboard');
    } finally {
      setLoading(false);
      setIsUpdating(false);
      setCountdown(15);
    }
  }, [isOnline]);

  // Auto-refresh with countdown - OPTIMIZED: Diperlambat dari 10s ke 15s
  useEffect(() => {
    fetchData();

    const fetchInterval = setInterval(fetchData, 15000); // OPTIMIZED: 15 seconds (dari 10s)
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(countdownInterval);
    };
  }, [fetchData]);

  const getGameName = (gameId) => {
    const names = {
      snake: 'Snake', flappybird: 'Flappy Bird', game2048: '2048', pacman: 'Pac-Man',
      memory: 'Memory Match', simonsays: 'Simon Says', typing: 'Typing Test',
      minesweeper: 'Minesweeper', wordle: 'Wordle', tictactoe: 'Tic-Tac-Toe',
      rps: 'Rock Paper Scissors', connect4: 'Connect Four'
    };
    return names[gameId] || gameId;
  };

  const getGameIcon = (gameId) => {
    const icons = {
      snake: '🐍', flappybird: '🐦', game2048: '🔢', pacman: '👻',
      memory: '🎴', simonsays: '🧠', typing: '⌨️', minesweeper: '💣',
      wordle: '📝', tictactoe: '❌', rps: '✊', connect4: '🔴'
    };
    return icons[gameId] || '🎮';
  };

  // Pagination logic
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredGlobalData.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="h-4 bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 shadow-xl relative">
      <UpdateAnimation isVisible={isUpdating} />
      
      {/* Header dengan controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white">🏆 Leaderboards</h2>
        <div className="flex items-center gap-3">
          <ConnectionStatus isOnline={isOnline} lastUpdate={lastUpdate} />
          <ManualRefreshButton onRefresh={fetchData} isLoading={isUpdating} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <span>⚠️</span>
            <span>{error}</span>
            <button 
              onClick={fetchData}
              className="ml-auto text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <LeaderboardStats 
        globalData={globalLeaderboard} 
        topServerData={topServerGames} 
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setActiveTab('global');
            setCurrentPage(1);
          }}
          className={`flex-1 px-4 py-3 rounded-xl font-black text-sm transition-all ${
            activeTab === 'global'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          🌍 GLOBAL LEADERBOARD
        </button>
        <button
          onClick={() => setActiveTab('topserver')}
          className={`flex-1 px-4 py-3 rounded-xl font-black text-sm transition-all ${
            activeTab === 'topserver'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          🏆 TOP SERVER
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'global' ? (
        <div>
          {/* Search & Filter */}
          <PlayerSearch 
            players={globalLeaderboard}
            onFilteredResults={(filtered) => {
              setFilteredGlobalData(filtered);
              setCurrentPage(1);
            }}
          />

          {/* Global Leaderboard */}
          <div className="space-y-3 mb-4">
            {getCurrentPageData().length > 0 ? (
              getCurrentPageData().map((player, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                const medals = ['🥇', '🥈', '🥉'];
                const medal = medals[globalIndex] || `#${globalIndex + 1}`;
                
                return (
                  <div
                    key={globalIndex}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02] ${
                      globalIndex < 3
                        ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 shadow-lg'
                        : 'bg-slate-800/50 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl min-w-[3rem] text-center">{medal}</span>
                      <div>
                        <div className="font-bold text-white text-lg">{player.playerName}</div>
                        <div className="text-xs text-slate-400">
                          {player.gamesPlayed} games • Avg: {Math.round(player.totalScore / player.gamesPlayed)} pts
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-black font-mono ${
                        globalIndex === 0 ? 'text-amber-400' : 
                        globalIndex === 1 ? 'text-slate-300' : 
                        globalIndex === 2 ? 'text-orange-400' : 
                        'text-blue-400'
                      }`}>
                        {player.totalScore.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">total pts</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-600 text-sm italic text-center py-8">
                {filteredGlobalData.length === 0 ? 'No players found' : 'Belum ada data. Mainkan game untuk masuk leaderboard!'}
              </p>
            )}
          </div>

          {/* Pagination */}
          <LeaderboardPagination
            totalItems={filteredGlobalData.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        /* Top Server */
        <div className="space-y-3">
          {topServerGames.length > 0 ? (
            topServerGames.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{getGameIcon(item.gameId)}</span>
                  <div>
                    <div className="font-bold text-white text-lg">{getGameName(item.gameId)}</div>
                    <div className="text-xs text-amber-400 font-bold">
                      👑 {item.topScore.playerName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.totalPlayers} players competing
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-amber-400">
                    {item.topScore.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">record</div>
                  <div className="text-xs text-slate-600">
                    {new Date(item.topScore.timestamp).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-600 text-sm italic text-center py-8">
              Belum ada record. Jadilah yang pertama!
            </p>
          )}
        </div>
      )}

      {/* Enhanced Real-time indicator dengan countdown dalam teks */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isUpdating ? 'bg-blue-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
          <span className="text-xs text-slate-500">
            {isUpdating ? 'Updating...' : (
              <span className="flex items-center gap-1">
                Real-time updates setiap
                <span className={`px-1.5 py-0.5 rounded text-xs font-black transition-all ${
                  countdown <= 3 ? 'bg-red-500/20 text-red-400 animate-pulse' : 
                  countdown <= 7 ? 'bg-amber-500/20 text-amber-400' : 
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {countdown}
                </span>
                detik
              </span>
            )}
          </span>
        </div>

        {/* Data freshness indicator */}
        <div className="text-xs text-slate-600">
          Last updated: {new Date(lastUpdate).toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}