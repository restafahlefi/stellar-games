import { useState, useEffect } from 'react';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import { socketService } from '../services/socketService';
import MultiplayerLobby from '../components/MultiplayerLobby';
import AutoReturnTimer from '../components/AutoReturnTimer';
import GameStats from '../components/GameStats';
import HelpButton from '../components/HelpButton';
import AchievementPopup from '../components/AchievementPopup';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { useGameProgress } from '../hooks/useGameProgress';
import { playGameSound } from '../utils/soundEngine';

// Audio Engine
let rpsAudioCtx = null;
const playSound = (type) => {
  try {
    if (!rpsAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) rpsAudioCtx = new AudioContext();
    }
    if (!rpsAudioCtx) return;
    if (rpsAudioCtx.state === 'suspended') rpsAudioCtx.resume();
    
    const ctx = rpsAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const masterVol = typeof window.gameVolume !== 'undefined' ? window.gameVolume : 0.7;
    
    if (type === 'select') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1 * masterVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'win') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1 * masterVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
};

const CHOICES = [
  { id: 'rock', emoji: '✊', beats: 'scissors', color: 'rose' },
  { id: 'paper', emoji: '✋', beats: 'rock', color: 'blue' },
  { id: 'scissors', emoji: '✌️', beats: 'paper', color: 'amber' }
];

export default function RockPaperScissorsMultiplayer({ onBack, playerName }) {
  // Game mode selection
  const [gameMode, setGameMode] = useState(null); // null, 'ai', 'online'
  const [multiplayerRoom, setMultiplayerRoom] = useState(null);
  const [multiplayerPlayers, setMultiplayerPlayers] = useState([]);
  
  // Game state
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [result, setResult] = useState('');
  const [scores, setScores] = useState({ player: 0, opponent: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [roundsToWin] = useState(3); // Best of 5 (first to 3)
  const [currentAchievement, setCurrentAchievement] = useState(null);
  
  const { checkAchievements, updateChallenge, updateStats, clearNewAchievements } = useGameProgress('rps');

  // Handle multiplayer game start
  const handleMultiplayerStart = ({ room, players }) => {
    setMultiplayerRoom(room);
    setMultiplayerPlayers(players);
    console.log('🎮 RPS multiplayer started!', { room, players });
  };

  // Listen for opponent moves
  useEffect(() => {
    if (gameMode !== 'online' || !multiplayerRoom) return;

    const handleOpponentMove = ({ move, gameState }) => {
      console.log('📥 Opponent choice received:', move);
      
      if (move.choice) {
        setOpponentChoice(move.choice);
        
        // Determine result
        if (playerChoice) {
          determineWinner(playerChoice, move.choice);
        }
      }
    };

    const handlePlayerLeft = ({ playerName: leftPlayerName }) => {
      console.log('👋 Player left:', leftPlayerName);
      setOpponentLeft(true);
    };

    socketService.onOpponentMove(handleOpponentMove);
    socketService.onPlayerLeft(handlePlayerLeft);

    return () => {
      socketService.removeAllListeners();
    };
  }, [gameMode, multiplayerRoom, playerChoice]);

  const determineWinner = (myChoice, theirChoice) => {
    if (myChoice === theirChoice) {
      setResult('draw');
      playGameSound('draw', 0.3);
    } else if (CHOICES.find(c => c.id === myChoice).beats === theirChoice) {
      setResult('win');
      setScores(s => ({ ...s, player: s.player + 1 }));
      playSound('win');
      playGameSound('win', 0.4);
      
      // Update stats & achievements
      updateStats({ gamesPlayed: 1, wins: 1 });
      const unlocked = checkAchievements({ won: true, winStreak: scores.player + 1, perfectGame: scores.opponent === 0 && scores.player === 2 });
      if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
      updateChallenge(1);
      
      gameService.recordGamePlay('rps').catch(console.error);
      leaderboardService.submitScore(playerName || 'Guest_Player', 'rps', 500).catch(console.error);
    } else {
      setResult('lose');
      setScores(s => ({ ...s, opponent: s.opponent + 1 }));
      playGameSound('lose', 0.4);
      updateStats({ gamesPlayed: 1, losses: 1 });
    }
  };

  const handlePlay = (id) => {
    if (isAnimating || opponentLeft) return;
    
    setIsAnimating(true);
    setPlayerChoice(id);
    setOpponentChoice(null);
    setResult('');
    playSound('select');
    playGameSound('click', 0.3);

    if (gameMode === 'ai') {
      // Countdown sounds
      playGameSound('countdown', 0.2);
      setTimeout(() => playGameSound('countdown', 0.2), 500);
      setTimeout(() => playGameSound('countdown', 0.3), 1000);

      setTimeout(() => {
        const ai = CHOICES[Math.floor(Math.random() * 3)];
        setOpponentChoice(ai.id);
        determineWinner(id, ai.id);
        setIsAnimating(false);
      }, 1500);
    } else if (gameMode === 'online' && multiplayerRoom) {
      // Send choice to opponent
      socketService.sendMove(multiplayerRoom.id, { choice: id }, {});
      
      // Wait for opponent
      setTimeout(() => {
        setIsAnimating(false);
      }, 1500);
    }
  };

  const nextRound = () => {
    setPlayerChoice(null);
    setOpponentChoice(null);
    setResult('');
  };

  const handleBackToModeSelection = () => {
    if (gameMode === 'online' && multiplayerRoom) {
      socketService.leaveRoom();
    }
    setGameMode(null);
    setMultiplayerRoom(null);
    setMultiplayerPlayers([]);
    setPlayerChoice(null);
    setOpponentChoice(null);
    setResult('');
    setScores({ player: 0, opponent: 0 });
    setOpponentLeft(false);
  };

  const gameWinner = scores.player >= roundsToWin ? 'player' : scores.opponent >= roundsToWin ? 'opponent' : null;

  // Mode selection screen
  if (!gameMode) {
    return (
      <div className="game-container flex flex-col items-center justify-center max-w-4xl mx-auto w-full animate-fade-in min-h-screen">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium transition-colors"
        >
          ← Kembali
        </button>

        <div className="text-center mb-12">
          <div className="text-7xl mb-4">✊✋✌️</div>
          <h1 className="text-4xl font-black text-white mb-2">ROCK PAPER SCISSORS</h1>
          <p className="text-slate-400">Pilih mode permainan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
          {/* AI Mode */}
          <button
            onClick={() => setGameMode('ai')}
            className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 p-8 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-purple-900/50"
          >
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-black text-white mb-2">VS AI</h3>
            <p className="text-purple-200 text-sm">Lawan komputer</p>
          </button>

          {/* Online Multiplayer Mode */}
          <button
            onClick={() => setGameMode('online')}
            className="bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 p-8 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-900/50 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full">
              NEW!
            </div>
            <div className="text-6xl mb-4">🌐</div>
            <h3 className="text-2xl font-black text-white mb-2">ONLINE</h3>
            <p className="text-emerald-200 text-sm">Main dengan teman online</p>
          </button>
        </div>
      </div>
    );
  }

  // Show multiplayer lobby for online mode
  if (gameMode === 'online' && !multiplayerRoom) {
    return (
      <MultiplayerLobby
        gameType="rps"
        gameName="Rock Paper Scissors"
        playerName={playerName}
        onGameStart={handleMultiplayerStart}
        onBack={handleBackToModeSelection}
      />
    );
  }

  // Game screen
  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12 relative">
      {gameWinner && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6">
          <h2 className={`text-6xl font-black mb-6 uppercase italic tracking-tighter ${gameWinner === 'player' ? 'text-emerald-400' : 'text-rose-500'}`}>
            {gameWinner === 'player' ? '🏆 KAMU MENANG!' : '😢 KAMU KALAH!'}
          </h2>
          <div className="bg-slate-800 rounded-2xl p-6 mb-6 border-2 border-slate-700">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Final Score</p>
            <p className="text-3xl font-black text-white">{scores.player} - {scores.opponent}</p>
          </div>
          <div className="flex flex-col gap-4 w-full max-w-[200px]">
            <button onClick={() => { setScores({ player: 0, opponent: 0 }); nextRound(); }} className="w-full py-4 bg-indigo-500 text-white font-black text-xl rounded-2xl shadow-xl">MAIN LAGI</button>
            <button onClick={handleBackToModeSelection} className="w-full py-3 bg-slate-700 text-white font-bold rounded-xl">GANTI MODE</button>
            <AutoReturnTimer onTimerEnd={onBack} seconds={10} />
          </div>
        </div>
      )}

      {result && !gameWinner && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6">
          <h2 className={`text-6xl font-black mb-6 uppercase italic tracking-tighter ${result === 'win' ? 'text-emerald-400' : result === 'lose' ? 'text-rose-500' : 'text-blue-400'}`}>
            {result === 'win' ? '🔥 KAMU MENANG!' : result === 'lose' ? '💀 KAMU KALAH' : '🤝 SERI'}
          </h2>
          <div className="flex flex-col gap-4 w-full max-w-[200px]">
            <button onClick={nextRound} className="w-full py-4 bg-indigo-500 text-white font-black text-xl rounded-2xl shadow-xl">RONDE BERIKUTNYA</button>
          </div>
        </div>
      )}

      <div className="w-full flex justify-between items-center mb-8 px-4 flex-wrap gap-4">
        <button onClick={handleBackToModeSelection} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold">← Kembali</button>
        
        {/* Game mode indicator */}
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
          <span className="text-2xl">{gameMode === 'ai' ? '🤖' : '🌐'}</span>
          <span className="text-sm font-bold text-slate-300">{gameMode === 'ai' ? 'VS AI' : 'ONLINE'}</span>
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-black uppercase">Kamu</span>
            <span className="text-2xl font-black text-blue-400">{scores.player}</span>
          </div>
          <span className="text-slate-700 text-2xl font-black">VS</span>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-black uppercase">{gameMode === 'ai' ? 'AI' : 'Lawan'}</span>
            <span className="text-2xl font-black text-rose-500">{scores.opponent}</span>
          </div>
        </div>
      </div>

      {/* Online players info */}
      {gameMode === 'online' && multiplayerPlayers.length === 2 && (
        <div className="w-full max-w-md mb-6 px-4">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👤</span>
              <div>
                <p className="text-sm font-bold text-blue-400">{multiplayerPlayers[0].name}</p>
                <p className="text-xs text-slate-500">Player 1</p>
              </div>
            </div>
            <div className="text-2xl">⚔️</div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-bold text-rose-400">{multiplayerPlayers[1].name}</p>
                <p className="text-xs text-slate-500">Player 2</p>
              </div>
              <span className="text-2xl">👤</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-700 w-full text-center relative overflow-hidden">
        <div className="grid grid-cols-3 gap-4 mb-12">
          {CHOICES.map(c => (
            <button
              key={c.id}
              onClick={() => handlePlay(c.id)}
              disabled={isAnimating || gameWinner || opponentLeft}
              className={`h-32 rounded-3xl flex flex-col items-center justify-center transition-all ${playerChoice === c.id ? 'bg-indigo-500 scale-110 shadow-2xl z-10' : 'bg-slate-900 hover:bg-slate-700 opacity-80'}`}
            >
              <span className="text-5xl mb-2">{c.emoji}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{c.id}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center items-center gap-12 mt-4">
          <div className={`w-24 h-24 rounded-2xl bg-slate-900 flex items-center justify-center text-4xl border-2 ${isAnimating ? 'animate-bounce border-blue-500' : 'border-slate-700'}`}>
            {playerChoice ? CHOICES.find(c => c.id === playerChoice).emoji : '❓'}
          </div>
          <div className="text-slate-600 font-black italic">VS</div>
          <div className={`w-24 h-24 rounded-2xl bg-slate-900 flex items-center justify-center text-4xl border-2 ${isAnimating ? 'animate-bounce border-rose-500' : 'border-slate-700'}`}>
            {opponentChoice ? CHOICES.find(c => c.id === opponentChoice).emoji : '❓'}
          </div>
        </div>

        {opponentLeft && (
          <div className="mt-6 text-rose-500 font-bold">
            👋 Lawan keluar dari game
          </div>
        )}
      </div>

      {/* Game Stats */}
      <div className="w-full max-w-md mt-8 px-4">
        <GameStats gameId="rps" playerName={playerName} />
      </div>

      <div className="mt-6 w-full max-w-md px-4">
        <DailyChallengeCard gameId="rps" compact={true} />
      </div>

      <HelpButton game="rps" />
      
      {currentAchievement && (
        <AchievementPopup 
          achievement={currentAchievement} 
          onClose={() => {
            setCurrentAchievement(null);
            clearNewAchievements();
          }} 
        />
      )}
    </div>
  );
}
