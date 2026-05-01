import React, { useState, useEffect } from 'react';

/**
 * Enhanced Leaderboard Features - Additional improvements
 */

// 1. Manual Refresh Button Component
export const ManualRefreshButton = ({ onRefresh, isLoading }) => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    onRefresh();
    setLastRefresh(new Date());
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          isLoading 
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            Updating...
          </span>
        ) : (
          <span className="flex items-center gap-1">
            🔄 Refresh
          </span>
        )}
      </button>
      <span className="text-xs text-slate-600">
        Last: {lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

// 2. Connection Status Indicator
export const ConnectionStatus = ({ isOnline, lastUpdate }) => {
  const [connectionQuality, setConnectionQuality] = useState('good');

  useEffect(() => {
    if (!isOnline) {
      setConnectionQuality('offline');
    } else {
      const timeSinceUpdate = Date.now() - lastUpdate;
      if (timeSinceUpdate > 30000) { // 30 seconds
        setConnectionQuality('poor');
      } else if (timeSinceUpdate > 15000) { // 15 seconds
        setConnectionQuality('fair');
      } else {
        setConnectionQuality('good');
      }
    }
  }, [isOnline, lastUpdate]);

  const getStatusConfig = () => {
    switch (connectionQuality) {
      case 'offline':
        return { color: 'text-red-400', bg: 'bg-red-500/20', icon: '🔴', text: 'Offline' };
      case 'poor':
        return { color: 'text-red-400', bg: 'bg-red-500/20', icon: '🟠', text: 'Poor Connection' };
      case 'fair':
        return { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: '🟡', text: 'Fair Connection' };
      default:
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: '🟢', text: 'Online' };
    }
  };

  const status = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${status.bg}`}>
      <span className="text-xs">{status.icon}</span>
      <span className={`text-xs font-bold ${status.color}`}>{status.text}</span>
    </div>
  );
};

// 3. Leaderboard Statistics
export const LeaderboardStats = ({ globalData, topServerData }) => {
  const stats = {
    totalPlayers: globalData.length,
    totalGames: topServerData.length,
    highestScore: globalData.length > 0 ? Math.max(...globalData.map(p => p.totalScore)) : 0,
    averageScore: globalData.length > 0 ? Math.round(globalData.reduce((sum, p) => sum + p.totalScore, 0) / globalData.length) : 0
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
        <div className="text-lg font-black text-blue-400">{stats.totalPlayers}</div>
        <div className="text-xs text-slate-500">Players</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
        <div className="text-lg font-black text-emerald-400">{stats.totalGames}</div>
        <div className="text-xs text-slate-500">Games</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
        <div className="text-lg font-black text-amber-400">{stats.highestScore.toLocaleString()}</div>
        <div className="text-xs text-slate-500">Highest</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
        <div className="text-lg font-black text-purple-400">{stats.averageScore.toLocaleString()}</div>
        <div className="text-xs text-slate-500">Average</div>
      </div>
    </div>
  );
};

// 4. Player Search/Filter
export const PlayerSearch = ({ players, onFilteredResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score'); // 'score', 'name', 'games'

  useEffect(() => {
    let filtered = players.filter(player => 
      player.playerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.playerName.localeCompare(b.playerName);
        case 'games':
          return b.gamesPlayed - a.gamesPlayed;
        default: // score
          return b.totalScore - a.totalScore;
      }
    });

    onFilteredResults(filtered);
  }, [searchTerm, sortBy, players, onFilteredResults]);

  return (
    <div className="flex gap-2 mb-4">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            ×
          </button>
        )}
      </div>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
      >
        <option value="score">Sort by Score</option>
        <option value="name">Sort by Name</option>
        <option value="games">Sort by Games</option>
      </select>
    </div>
  );
};

// 5. Leaderboard Pagination
export const LeaderboardPagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-white rounded-lg text-sm transition-all"
      >
        ←
      </button>
      
      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-1 rounded-lg text-sm transition-all ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : page === '...'
              ? 'text-slate-600 cursor-default'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-white rounded-lg text-sm transition-all"
      >
        →
      </button>
    </div>
  );
};

// 6. Update Animation Component
export const UpdateAnimation = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-blue-500/10 rounded-xl flex items-center justify-center pointer-events-none">
      <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold animate-pulse">
        📡 Updating...
      </div>
    </div>
  );
};

export default {
  ManualRefreshButton,
  ConnectionStatus,
  LeaderboardStats,
  PlayerSearch,
  LeaderboardPagination,
  UpdateAnimation
};