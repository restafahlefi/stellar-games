import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/ui/LoadingScreen';
import LeaderboardResetInfo from './components/LeaderboardResetInfo';
import LeaderboardSection from './components/LeaderboardSection';
import GameGuide from './components/GameGuide';
import VolumeControl from './components/VolumeControl';
import AchievementButton from './components/AchievementButton';
import DailyChallengeButton from './components/DailyChallengeButton';
import PlayerProfile from './components/PlayerProfile';
import AuthModal from './components/AuthModal';
import TokenExpiryIndicator from './components/TokenExpiryIndicator';
import { useRealTimeStats } from './components/RealTimeStats';
import RealTimeCountdown from './components/RealTimeCountdown';
import { GAMES } from './data/gamesData';
import { gameService } from './services/gameService';
import { leaderboardService } from './services/leaderboardService';
import { playerService } from './services/playerService';
import { achievementService } from './services/achievementService';
import { rewardSystem } from './services/rewardSystem';
import { authService } from './services/authService';
import './index.css';

// Direct imports (no lazy loading to avoid loading screen)
import Snake from './games/Snake';
import PacMan from './games/PacMan';
import FlappyBird from './games/FlappyBird';
import Game2048 from './games/Game2048';
import MemoryMatch from './games/MemoryMatch';
import TicTacToeMultiplayer from './games/TicTacToeMultiplayer';
import RockPaperScissorsMultiplayer from './games/RockPaperScissorsMultiplayer';
import SimonSays from './games/SimonSays';
import TypingTest from './games/TypingTest';
import ConnectFourMultiplayer from './games/ConnectFourMultiplayer';
import Minesweeper from './games/Minesweeper';
import Wordle from './games/Wordle';

const GameComponents = {
  tictactoe: TicTacToeMultiplayer,
  snake: Snake,
  pacman: PacMan,
  flappybird: FlappyBird,
  game2048: Game2048,
  memory: MemoryMatch,
  rps: RockPaperScissorsMultiplayer,
  simon: SimonSays, // Fixed: was 'simonsays', now 'simon' to match gamesData
  typing: TypingTest,
  connect4: ConnectFourMultiplayer,
  minesweeper: Minesweeper,
  wordle: Wordle
};

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeGameId, setActiveGameId] = useState(null);
  const [loadingKey] = useState(() => Date.now());
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.verifyToken();
      if (user) {
        setIsAuthenticated(true);
        setPlayerName(user.username);
        sessionStorage.setItem('stellar_playerName', user.username);
        
        // Initialize services
        achievementService.setCurrentPlayer(user.username);
        rewardSystem.setCurrentPlayer(user.username);
      } else {
        setShowAuthModal(true);
      }
    };

    checkAuth();
  }, []);

  // Use RealTimeStats hook untuk synchronized updates
  // PAUSED saat bermain game untuk menghindari lag
  const { stats, topPlayers, countdown, isUpdating } = useRealTimeStats(gameStarted);

  // Determine indicator color based on countdown and update status
  const getIndicatorColor = () => {
    if (isUpdating) return 'bg-blue-500 animate-ping'; // 🔵 BIRU: Sedang updating
    if (countdown <= 5) return 'bg-red-500 animate-pulse'; // 🔴 MERAH: Segera update (≤5s)
    if (countdown <= 10) return 'bg-amber-500 animate-pulse'; // 🟡 KUNING: Peringatan (6-10s)
    return 'bg-emerald-500 animate-pulse'; // 🟢 HIJAU: Normal (>10s)
  };

  // Send heartbeat to track active players
  useEffect(() => {
    if (!playerName) return;

    // Initialize persistent storage for this player
    achievementService.setCurrentPlayer(playerName);
    rewardSystem.setCurrentPlayer(playerName);

    // Use localStorage to ensure only one tab sends heartbeat per player
    const heartbeatKey = `heartbeat_${playerName}`;
    const tabId = `tab_${Date.now()}_${Math.random()}`;
    
    // Mark this tab as the active heartbeat sender
    const becomeActiveTab = () => {
      localStorage.setItem(heartbeatKey, tabId);
    };
    
    // Check if this tab should send heartbeat
    const isActiveTab = () => {
      return localStorage.getItem(heartbeatKey) === tabId;
    };
    
    // Become active tab initially
    becomeActiveTab();

    // Send initial heartbeat
    playerService.sendHeartbeat(playerName);

    // Send heartbeat every 30 seconds (only if this is the active tab)
    const heartbeatInterval = setInterval(() => {
      if (isActiveTab()) {
        playerService.sendHeartbeat(playerName);
      } else {
        // Try to become active tab if current active tab is gone
        const currentActive = localStorage.getItem(heartbeatKey);
        if (!currentActive) {
          becomeActiveTab();
          playerService.sendHeartbeat(playerName);
        }
      }
    }, 30000);

    // Listen for tab close/refresh to cleanup
    const handleBeforeUnload = () => {
      if (isActiveTab()) {
        // Remove active tab marker
        localStorage.removeItem(heartbeatKey);
        
        // Send disconnect signal to backend
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const baseUrl = apiUrl.replace('/api/v1', '');
        
        fetch(`${baseUrl}/api/v1/players/disconnect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerName }),
          keepalive: true
        }).catch(() => {});
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (isActiveTab()) {
        localStorage.removeItem(heartbeatKey);
        
        // Send disconnect signal
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const baseUrl = apiUrl.replace('/api/v1', '');
        
        fetch(`${baseUrl}/api/v1/players/disconnect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerName }),
          keepalive: true
        }).catch(() => {});
      }
    };
  }, [playerName]);

  const handleGameLaunch = (id) => {
    // Jika tidak ada nama, set sebagai Guest dengan timestamp unik
    if (!playerName) {
      const guestName = `Guest_${Date.now().toString().slice(-6)}`;
      setPlayerName(guestName);
      sessionStorage.setItem('stellar_playerName', guestName);
    }
    setActiveGameId(id);
    setShowGuide(true); // Show guide first
  };

  const handleStartGame = () => {
    setShowGuide(false);
    setGameStarted(true);
  };

  const handleBackFromGuide = () => {
    setShowGuide(false);
    setActiveGameId(null);
  };

  const handleBackFromGame = () => {
    setGameStarted(false);
    setShowGuide(false);
    setActiveGameId(null);
  };

  const activeGame = GAMES.find(g => g.id === activeGameId);

  const ActiveGameComponent = activeGameId ? GameComponents[activeGameId] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
      {/* LOADING SCREEN - Full screen overlay */}
      {isLoading && <LoadingScreen key={loadingKey} onFinished={() => setIsLoading(false)} />}
      
      {/* MAIN CONTENT - Only render after loading */}
      {!isLoading && (
        <>
          {/* BACKGROUND LAYERS */}
          {/* Layer 1: Anime GIF Background */}
          <div className="anime-bg"></div>
          
          {/* Layer 2: Aurora Spotlight Effect */}
          <div className="spotlight-bg"></div>
          
          {/* Layer 3: Neon Grid Scanner */}
          <div className="scanner-line"></div>
          
          {/* Layer 4: Vignette Overlay */}
          <div className="vignette-overlay"></div>
          
          {/* CONTENT */}
          {/* Show Guide */}
          {showGuide && activeGame && !gameStarted ? (
            <GameGuide 
              game={activeGame} 
              onStart={handleStartGame}
              onBack={handleBackFromGuide}
            />
          ) : gameStarted && ActiveGameComponent ? (
            /* Show Game */
            <div className="min-h-screen overflow-y-auto pt-4 pb-8 relative z-10">
              <ActiveGameComponent onBack={handleBackFromGame} playerName={playerName} />
            </div>
          ) : (
            /* Show Homepage */
            <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-fade-in relative z-10 overflow-x-hidden">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-900/20">S</div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase">Stellar Games <span className="text-blue-500">Portal</span></h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Volume Control */}
              <VolumeControl />
              
              {/* Achievement Button - Always visible */}
              <AchievementButton />
              
              {/* Daily Challenge Button - Always visible */}
              <DailyChallengeButton />
              
              {/* Token Expiry Indicator */}
              {isAuthenticated && <TokenExpiryIndicator />}
              
              {/* Username Button with Logout */}
              <button onClick={() => {
                // Logout
                authService.logout();
                achievementService.setCurrentPlayer(null);
                rewardSystem.setCurrentPlayer(null);
                setPlayerName('');
                setIsAuthenticated(false);
                setShowAuthModal(true);
              }} className="bg-slate-900 px-3 sm:px-4 py-2 rounded-xl border border-slate-800 text-xs sm:text-sm font-bold hover:border-red-500/50 transition-all flex items-center gap-2">
                {/* Status Indicator */}
                <span className={`w-2 h-2 rounded-full transition-all duration-500 ${playerName ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-slate-400 truncate max-w-[80px] sm:max-w-none">{playerName || 'Guest'}</span>
                <span className="text-red-400 text-xs hover:scale-110 transition-transform">🚪</span>
              </button>
            </div>
          </div>

          {/* STATS CARDS dengan Real-time Indicators - COMPACT */}
          <div className="mb-8">
            <h2 className="text-xl font-black mb-4 text-slate-300 flex items-center gap-2">
              <span>📊</span>
              <span>Statistics</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stats-card bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl relative">
                <span className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">Total Players</span>
                <p className="text-2xl sm:text-3xl font-black mt-2 tracking-tighter">{stats.totalPlayers || 0}</p>
                <span className="text-slate-600 text-[10px] sm:text-xs font-bold mt-1 block">Semua pemain terdaftar</span>
                {/* Real-time indicator */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${getIndicatorColor()}`}></span>
                </div>
              </div>
              <div className="stats-card bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
                <span className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">Players Online</span>
                <p className="text-2xl sm:text-3xl font-black mt-2 text-emerald-400 tracking-tighter flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  {stats.activePlayers || 0}
                </p>
                <span className="text-slate-600 text-[10px] sm:text-xs font-bold mt-1 block">Sedang aktif sekarang</span>
                {/* Real-time indicator */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${getIndicatorColor()}`}></span>
                </div>
              </div>
              <div className="stats-card bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl relative">
                <span className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">System Status</span>
                <p className="text-2xl sm:text-3xl font-black mt-2 text-emerald-500 tracking-tighter">ONLINE</p>
                <span className="text-slate-600 text-[10px] sm:text-xs font-bold mt-1 block">Server berjalan normal</span>
                {/* Real-time indicator */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${getIndicatorColor()}`}></span>
                </div>
              </div>
            </div>
          </div>

          {/* REAL-TIME UPDATE STATUS */}
          <div className="mb-6 flex flex-col items-center justify-center gap-2">
            <div className="bg-slate-900/40 px-4 py-2 rounded-xl border border-slate-800">
              <RealTimeCountdown />
            </div>
            
            {/* Indicator Legend - Compact */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-500">Normal</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-slate-500">Warning</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-slate-500">Soon</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-slate-500">Updating</span>
              </div>
            </div>
          </div>

          {/* PLAYER PROFILE */}
          {playerName && (
            <div className="mb-6">
              <PlayerProfile playerName={playerName} compact={true} />
            </div>
          )}

          {/* LEADERBOARD SECTION (Global + Top Server) */}
          <div className="mb-8">
            <h2 className="text-xl font-black mb-4 text-slate-300 flex items-center gap-2">
              <span>🏆</span>
              <span>Leaderboard</span>
            </h2>
            <LeaderboardSection />
          </div>

          {/* LEADERBOARD RESET INFO */}
          <div className="mb-8">
            <LeaderboardResetInfo />
          </div>

          {/* GAMES GRID */}
          <div className="mb-8">
            <h2 className="text-xl font-black mb-4 text-slate-300 flex items-center gap-2">
              <span>🎮</span>
              <span>All Games</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {GAMES.map(game => (
                <button 
                  key={game.id} 
                  onClick={() => handleGameLaunch(game.id)} 
                  className="game-card group bg-slate-900/30 p-6 rounded-2xl border border-slate-800/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-slate-900/60 hover:scale-105 hover:shadow-2xl text-left active:scale-95 active:bg-slate-900/80 min-h-[160px]"
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{game.icon?.[0] || '🎮'}</div>
                  <h3 className="text-lg font-black mb-2">{game.name}</h3>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed">{game.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
          )}
        </>
      )}

      {/* Auth Modal - Registration & Login */}
      {showAuthModal && (
        <AuthModal 
          onSuccess={(username) => {
            setPlayerName(username);
            setIsAuthenticated(true);
            setShowAuthModal(false);
            setIsLoading(true);
            
            // Initialize services
            achievementService.setCurrentPlayer(username);
            rewardSystem.setCurrentPlayer(username);
            
            // Loading screen will auto-finish when progress reaches 100%
            // No need for setTimeout - let LoadingScreen control its own lifecycle
          }}
        />
      )}
    </div>
  );
}

export default App;
