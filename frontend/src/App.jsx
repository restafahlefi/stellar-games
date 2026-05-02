import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/ui/LoadingScreen';
import LeaderboardResetInfo from './components/LeaderboardResetInfo';
import LeaderboardSection from './components/LeaderboardSection';
import GameGuide from './components/GameGuide';
import VolumeControl from './components/VolumeControl';
import AchievementButton from './components/AchievementButton';
import DailyChallengeButton from './components/DailyChallengeButton';
import PlayerProfile from './components/PlayerProfile';
import { useRealTimeStats } from './components/RealTimeStats';
import RealTimeCountdown from './components/RealTimeCountdown';
import { GAMES } from './data/gamesData';
import { gameService } from './services/gameService';
import { leaderboardService } from './services/leaderboardService';
import { playerService } from './services/playerService';
import { achievementService } from './services/achievementService';
import { rewardSystem } from './services/rewardSystem';
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
  const [isLoading, setIsLoading] = useState(false); // Start false - no loading initially
  const [gameStarted, setGameStarted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeGameId, setActiveGameId] = useState(null);
  
  // Force loading screen to show on every page load (not just HMR)
  const [loadingKey] = useState(() => Date.now());
  
  // Generate unique tab ID for this session
  const [tabId] = useState(() => `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  // Use sessionStorage for per-tab player name
  const [playerName, setPlayerName] = useState(() => {
    // Check sessionStorage first (per-tab)
    const sessionName = sessionStorage.getItem('stellar_playerName');
    if (sessionName) return sessionName;
    
    // Fallback to localStorage (shared across tabs) - but we'll override this
    return '';
  });
  
  const [showNameModal, setShowNameModal] = useState(!sessionStorage.getItem('stellar_playerName'));
  const [tempName, setTempName] = useState(playerName);

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
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30 relative">
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
            <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-fade-in relative z-10">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-900/20">S</div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">Stellar Games <span className="text-blue-500">Portal</span></h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Volume Control */}
              <VolumeControl />
              
              {/* Achievement Button */}
              <AchievementButton />
              
              {/* Daily Challenge Button */}
              <DailyChallengeButton />
              
              {/* Username Button */}
              <button onClick={() => {
                // Clear session and show modal again
                sessionStorage.removeItem('stellar_playerName');
                
                // Clear current user context
                setPlayerName(''); // This will trigger useEffect cleanup to stop heartbeat
                setShowNameModal(true);
              }} className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-sm font-bold hover:border-blue-500/50 transition-all flex items-center gap-2">
                {/* Status Indicator - Green when online, Red when offline */}
                <span className={`w-2 h-2 rounded-full transition-all duration-500 ${playerName ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-slate-400">{playerName || 'Guest'}</span>
                {playerName && <span className="text-slate-600 text-xs">✕</span>}
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

      {showNameModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
          {/* Animated Background Particles - Smaller */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          {/* Modal Card - Smaller & More Compact */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-2 border-slate-700/50 rounded-3xl p-4 sm:p-6 max-w-[90vw] sm:max-w-sm w-full shadow-2xl shadow-blue-900/20 animate-scale-in">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl opacity-20 blur-xl animate-pulse"></div>
            
            {/* Content */}
            <div className="relative">
              {/* Icon Header - Smaller */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50 animate-bounce-slow">
                    <span className="text-2xl sm:text-3xl">👤</span>
                  </div>
                  {/* Status Indicator - Will change color */}
                  <div id="status-indicator" className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-slate-500 rounded-full border-2 sm:border-4 border-slate-900 transition-all duration-500"></div>
                </div>
              </div>

              {/* Title - Smaller */}
              <h2 className="text-xl sm:text-2xl font-black mb-2 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Identify Yourself
              </h2>
              <p className="text-slate-400 text-xs mb-4 font-bold text-center">
                Bergabunglah dengan komunitas global gamers
              </p>

              {/* Input with Icon - Compact */}
              <div className="relative mb-3">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                  ✨
                </div>
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value.substring(0, 15))} 
                  placeholder="Enter username..." 
                  className="w-full bg-slate-950/80 backdrop-blur-sm border-2 border-slate-700 rounded-xl pl-12 pr-12 py-3 text-white text-sm placeholder-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none font-bold transition-all" 
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-bold">
                  {tempName.length}/15
                </div>
              </div>

              {/* Buttons - Compact */}
              <button 
                onClick={() => {
                  const final = tempName.trim() || `Guest_${Date.now().toString().slice(-6)}`;
                  setPlayerName(final);
                  sessionStorage.setItem('stellar_playerName', final);
                  setShowNameModal(false);
                  setIsLoading(true); // Start loading screen after modal closes
                  
                  // Initialize persistent storage for new player
                  // This will load their specific achievements and challenges
                  achievementService.setCurrentPlayer(final);
                  rewardSystem.setCurrentPlayer(final);
                  
                  // Change indicator to green
                  setTimeout(() => {
                    const indicator = document.getElementById('status-indicator');
                    if (indicator) {
                      indicator.classList.remove('bg-slate-500');
                      indicator.classList.add('bg-emerald-500', 'animate-ping');
                    }
                  }, 100);
                }} 
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 text-white text-sm font-black rounded-xl transition-all shadow-xl shadow-blue-900/30 mb-2 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>🚀</span>
                  <span>Start Playing</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              <button 
                onClick={() => {
                  const guestName = `Guest_${Date.now().toString().slice(-6)}`;
                  setPlayerName(guestName);
                  sessionStorage.setItem('stellar_playerName', guestName);
                  setShowNameModal(false);
                  setIsLoading(true); // Start loading screen after modal closes
                  
                  // Initialize persistent storage for guest
                  // Each guest gets their own fresh achievements and challenges
                  achievementService.setCurrentPlayer(guestName);
                  rewardSystem.setCurrentPlayer(guestName);
                  
                  // Change indicator to green
                  setTimeout(() => {
                    const indicator = document.getElementById('status-indicator');
                    if (indicator) {
                      indicator.classList.remove('bg-slate-500');
                      indicator.classList.add('bg-emerald-500', 'animate-ping');
                    }
                  }, 100);
                }} 
                className="w-full py-2.5 bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-bold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>👻</span>
                <span>Continue as Guest</span>
              </button>

              {/* Info Footer - Compact */}
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <div className="text-lg">✅</div>
                  <div>
                    <p className="text-emerald-400 text-xs font-bold mb-0.5">
                      Guest & Registered Players
                    </p>
                    <p className="text-slate-500 text-[10px] leading-relaxed">
                      Semua pemain otomatis masuk ke <span className="text-emerald-400 font-bold">Global Leaderboard</span> dan <span className="text-amber-400 font-bold">Top Server</span> secara real-time!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
