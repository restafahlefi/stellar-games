import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../services/leaderboardService';
import { gameService } from '../services/gameService';
import RealTimeCountdown from './RealTimeCountdown';
import { useRealTimeStats } from './RealTimeStats';

/**
 * Komponen untuk menampilkan Global Leaderboard dan Top Server dengan countdown timer
 * Menggunakan useRealTimeStats hook untuk sinkronisasi update dengan homepage stats
 */
export default function LeaderboardSection() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [topServerGames, setTopServerGames] = useState([]);
  const [activeTab, setActiveTab] = useState('global'); // 'global' or 'topserver'
  const [loading, setLoading] = useState(true);
  
  // Use shared hook untuk synchronized updates (30 detik)
  const { lastUpdate } = useRealTimeStats();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch Global Leaderboard
        const globalData = await leaderboardService.getGlobalLeaderboard();
        if (globalData?.success) {
          setGlobalLeaderboard(globalData.data.slice(0, 10));
        }

        // Fetch Top Server (top scores dari setiap game)
        const gameIds = ['snake', 'flappybird', 'game2048', 'pacman', 'memory', 'simonsays', 
                         'typing', 'minesweeper', 'wordle', 'tictactoe', 'rps', 'connect4'];
        
        const topServerPromises = gameIds.map(async (gameId) => {
          const data = await leaderboardService.getGameLeaderboard(gameId);
          if (data?.success && data.data.length > 0) {
            return {
              gameId,
              topScore: data.data[0]
            };
          }
          return null;
        });

        const topServerResults = await Promise.all(topServerPromises);
        const validTopServers = topServerResults.filter(item => item !== null);
        setTopServerGames(validTopServers);
        
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data whenever lastUpdate changes (synchronized dengan RealTimeStats)
    fetchData();
  }, [lastUpdate]); // Re-fetch when lastUpdate changes (every 30 seconds)

  const getGameName = (gameId) => {
    const names = {
      snake: 'Snake',
      flappybird: 'Flappy Bird',
      game2048: '2048',
      pacman: 'Pac-Man',
      memory: 'Memory Match',
      simonsays: 'Simon Says',
      typing: 'Typing Test',
      minesweeper: 'Minesweeper',
      wordle: 'Wordle',
      tictactoe: 'Tic-Tac-Toe',
      rps: 'Rock Paper Scissors',
      connect4: 'Connect Four'
    };
    return names[gameId] || gameId;
  };

  const getGameIcon = (gameId) => {
    const icons = {
      snake: '🐍',
      flappybird: '🐦',
      game2048: '🔢',
      pacman: '👻',
      memory: '🎴',
      simonsays: '🧠',
      typing: '⌨️',
      minesweeper: '💣',
      wordle: '📝',
      tictactoe: '❌',
      rps: '✊',
      connect4: '🔴'
    };
    return icons[gameId] || '🎮';
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
    <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('global')}
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

      {/* Penjelasan */}
      <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        {activeTab === 'global' ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌍</span>
              <h3 className="font-black text-blue-400">Global Leaderboard</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ranking pemain berdasarkan <span className="text-blue-400 font-bold">total score dari SEMUA game</span>. 
              Semakin banyak game dimainkan dengan score tinggi, semakin tinggi posisi di global leaderboard.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏆</span>
              <h3 className="font-black text-amber-400">Top Server</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Menampilkan <span className="text-amber-400 font-bold">pemain dengan score tertinggi di SETIAP game</span>. 
              Ini adalah "juara" atau "record holder" untuk masing-masing game.
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'global' ? (
          // Global Leaderboard
          globalLeaderboard.length > 0 ? (
            globalLeaderboard.map((player, index) => {
              const medals = ['🥇', '🥈', '🥉'];
              const medal = medals[index] || `#${index + 1}`;
              
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    index < 3
                      ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600'
                      : 'bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{medal}</span>
                    <div>
                      <div className="font-bold text-white">{player.playerName}</div>
                      <div className="text-xs text-slate-400">{player.gamesPlayed} games played</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-black font-mono ${
                      index === 0 ? 'text-amber-400' : 
                      index === 1 ? 'text-slate-300' : 
                      index === 2 ? 'text-orange-400' : 
                      'text-blue-400'
                    }`}>
                      {player.totalScore}
                    </div>
                    <div className="text-xs text-slate-500">total pts</div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-slate-600 text-sm italic text-center py-8">
              Belum ada data. Mainkan game untuk masuk leaderboard!
            </p>
          )
        ) : (
          // Top Server
          topServerGames.length > 0 ? (
            topServerGames.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getGameIcon(item.gameId)}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{getGameName(item.gameId)}</div>
                    <div className="text-xs text-amber-400 font-bold">
                      👑 {item.topScore.playerName}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-mono text-amber-400">
                    {item.topScore.score}
                  </div>
                  <div className="text-xs text-slate-500">record</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-600 text-sm italic text-center py-8">
              Belum ada record. Jadilah yang pertama!
            </p>
          )
        )}
      </div>

      {/* Real-time indicator dengan countdown terintegrasi dalam teks */}
      <div className="mt-4 flex items-center justify-center">
        <RealTimeCountdown />
      </div>
    </div>
  );
}
