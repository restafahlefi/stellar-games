import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import { socketService } from '../services/socketService';
import MultiplayerLobby from '../components/MultiplayerLobby';
import GameStats from '../components/GameStats';
import HelpButton from '../components/HelpButton';
import AchievementPopup from '../components/AchievementPopup';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { useGameProgress } from '../hooks/useGameProgress';

// Sound Effects Engine
let tttAudioCtx = null;
const playSound = (type) => {
  try {
    if (!tttAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) tttAudioCtx = new AudioContext();
    }
    if (!tttAudioCtx) return;
    if (tttAudioCtx.state === 'suspended') tttAudioCtx.resume();

    const ctx = tttAudioCtx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const masterVol = typeof window.gameVolume !== 'undefined' ? window.gameVolume : 0.7;

    if (type === 'move') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.setValueAtTime(700, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.15 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'draw') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.1 * masterVol, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) { }
};

export default function TicTacToeMultiplayer({ onBack, playerName }) {
  // Game mode selection
  const [gameMode, setGameMode] = useState(null); // null, 'ai', 'local', 'online'
  const [aiDifficulty, setAiDifficulty] = useState(null); // 'easy', 'medium', 'hard'
  const [multiplayerRoom, setMultiplayerRoom] = useState(null);
  const [multiplayerPlayers, setMultiplayerPlayers] = useState([]);
  const [mySymbol, setMySymbol] = useState(null); // 'X' or 'O'
  
  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });
  const [hasScored, setHasScored] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  
  const { checkAchievements, updateChallenge, updateStats, clearNewAchievements } = useGameProgress('tictactoe');

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const winInfo = calculateWinner(board);
  const winner = winInfo?.winner;
  const isDraw = !winner && board.every(Boolean);

  // Handle multiplayer game start
  const handleMultiplayerStart = ({ room, players }) => {
    setMultiplayerRoom(room);
    setMultiplayerPlayers(players);
    
    // First player is X, second is O
    const myIndex = players.findIndex(p => p.id === socketService.socket.id);
    setMySymbol(myIndex === 0 ? 'X' : 'O');
    
    console.log('🎮 Multiplayer game started!', { room, players, mySymbol: myIndex === 0 ? 'X' : 'O' });
  };

  // Listen for opponent moves
  useEffect(() => {
    if (gameMode !== 'online' || !multiplayerRoom) return;

    const handleOpponentMove = ({ move, gameState }) => {
      console.log('📥 Opponent move received:', move);
      playSound('move');
      
      if (gameState?.board) {
        setBoard(gameState.board);
        setXIsNext(gameState.xIsNext);
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
  }, [gameMode, multiplayerRoom]);

  // Handle game over
  useEffect(() => {
    if (winner && !hasScored) {
      setScores(s => ({ ...s, [winner]: s[winner] + 1 }));
      setHasScored(true);
      playSound('win');
      confetti();

      // Update stats & achievements
      const won = (gameMode === 'ai' && winner === 'X') || (gameMode === 'online' && winner === mySymbol);
      updateStats({ gamesPlayed: 1, wins: won ? 1 : 0, losses: won ? 0 : 1 });
      const unlocked = checkAchievements({ won, gameMode, winStreak: scores[winner] + 1 });
      if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
      if (won) updateChallenge(1);

      // Record game play
      gameService.recordGamePlay('tictactoe').catch(console.error);

      // Submit score for winner
      if (gameMode === 'ai' && winner === 'X') {
        leaderboardService.submitScore(playerName || 'Guest_Player', 'tictactoe', 100).catch(console.error);
      } else if (gameMode === 'online' && winner === mySymbol) {
        leaderboardService.submitScore(playerName || 'Guest_Player', 'tictactoe', 200).catch(console.error);
        
        // Notify opponent
        if (multiplayerRoom) {
          socketService.sendGameOver(multiplayerRoom.id, winner, 200);
        }
      }
    } else if (isDraw && !hasScored) {
      setScores(s => ({ ...s, Draws: s.Draws + 1 }));
      setHasScored(true);
      playSound('draw');
      updateStats({ gamesPlayed: 1 });
    }
  }, [winner, isDraw, hasScored, gameMode, mySymbol, multiplayerRoom, playerName, scores, checkAchievements, updateChallenge, updateStats]);

  // Minimax Algorithm for Hard AI
  const minimax = (board, depth, isMaximizing) => {
    const result = calculateWinner(board);
    if (result?.winner === 'O') return 10 - depth;
    if (result?.winner === 'X') return depth - 10;
    if (board.every(cell => cell !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  // AI Logic with Difficulty Levels
  useEffect(() => {
    if (gameMode !== 'ai' || xIsNext || winner || isDraw) return;

    const timer = setTimeout(() => {
      const newBoard = [...board];
      const emptyIndices = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);

      let moveIndex = -1;

      if (aiDifficulty === 'easy') {
        // Easy: 50% random, 50% smart
        if (Math.random() < 0.5) {
          moveIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        } else {
          // Try to win
          for (let i of emptyIndices) {
            const testBoard = [...newBoard];
            testBoard[i] = 'O';
            if (calculateWinner(testBoard)?.winner === 'O') { moveIndex = i; break; }
          }
          // Random if can't win
          if (moveIndex === -1) {
            moveIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          }
        }
      } else if (aiDifficulty === 'medium') {
        // Medium: Current AI (block & win, take center)
        // 1. Try to Win
        for (let i of emptyIndices) {
          const testBoard = [...newBoard];
          testBoard[i] = 'O';
          if (calculateWinner(testBoard)?.winner === 'O') { moveIndex = i; break; }
        }

        // 2. Try to Block
        if (moveIndex === -1) {
          for (let i of emptyIndices) {
            const testBoard = [...newBoard];
            testBoard[i] = 'X';
            if (calculateWinner(testBoard)?.winner === 'X') { moveIndex = i; break; }
          }
        }

        // 3. Take center
        if (moveIndex === -1 && newBoard[4] === null) {
          moveIndex = 4;
        }

        // 4. Random available spot
        if (moveIndex === -1) {
          moveIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }
      } else if (aiDifficulty === 'hard') {
        // Hard: Minimax (unbeatable)
        let bestScore = -Infinity;
        for (let i of emptyIndices) {
          newBoard[i] = 'O';
          const score = minimax(newBoard, 0, false);
          newBoard[i] = null;
          if (score > bestScore) {
            bestScore = score;
            moveIndex = i;
          }
        }
      }

      if (moveIndex !== -1) {
        newBoard[moveIndex] = 'O';
        playSound('move');
        setBoard(newBoard);
        setXIsNext(true);
      }
    }, 600);
    
    return () => clearTimeout(timer);
  }, [board, xIsNext, gameMode, winner, isDraw, aiDifficulty]);

  const handleClick = (i) => {
    if (board[i] || winner || opponentLeft) return;

    // Check turn for different modes
    if (gameMode === 'ai' && !xIsNext) return;
    if (gameMode === 'online') {
      const isMyTurn = (xIsNext && mySymbol === 'X') || (!xIsNext && mySymbol === 'O');
      if (!isMyTurn) return;
    }

    playSound('move');
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);

    // Send move to opponent in online mode
    if (gameMode === 'online' && multiplayerRoom) {
      socketService.sendMove(multiplayerRoom.id, { index: i, player: xIsNext ? 'X' : 'O' }, {
        board: newBoard,
        xIsNext: !xIsNext
      });
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setHasScored(false);
    setOpponentLeft(false);
  };

  const handleBackToModeSelection = () => {
    if (gameMode === 'online' && multiplayerRoom) {
      socketService.leaveRoom();
    }
    setGameMode(null);
    setAiDifficulty(null);
    setMultiplayerRoom(null);
    setMultiplayerPlayers([]);
    setMySymbol(null);
    resetGame();
    setScores({ X: 0, O: 0, Draws: 0 });
  };

  let status;
  if (opponentLeft) {
    status = '👋 Lawan keluar dari game';
  } else if (winner) {
    if (gameMode === 'online') {
      status = winner === mySymbol ? '🎉 Kamu Menang!' : '😢 Kamu Kalah!';
    } else {
      status = `🎉 Pemenang: ${winner}!`;
    }
  } else if (isDraw) {
    status = "🤝 Seri!";
  } else {
    if (gameMode === 'online') {
      const isMyTurn = (xIsNext && mySymbol === 'X') || (!xIsNext && mySymbol === 'O');
      status = isMyTurn ? '🎯 Giliran Kamu!' : '⏳ Menunggu lawan...';
    } else {
      status = `Giliran: ${xIsNext ? 'X' : 'O'}`;
    }
  }

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
          <div className="text-7xl mb-4">❌⭕</div>
          <h1 className="text-4xl font-black text-white mb-2">TIC TAC TOE</h1>
          <p className="text-slate-400">Pilih mode permainan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl px-4">
          {/* AI Mode */}
          <button
            onClick={() => setGameMode('ai')}
            className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 p-8 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-purple-900/50"
          >
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-black text-white mb-2">VS AI</h3>
            <p className="text-purple-200 text-sm">Lawan komputer pintar</p>
          </button>

          {/* Local 2 Player Mode */}
          <button
            onClick={() => { setGameMode('local'); setAiDifficulty(null); }}
            className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 p-8 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/50"
          >
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-black text-white mb-2">LOCAL</h3>
            <p className="text-blue-200 text-sm">2 pemain, 1 perangkat</p>
          </button>

          {/* Online Multiplayer Mode */}
          <button
            onClick={() => { setGameMode('online'); setAiDifficulty(null); }}
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

  // AI Difficulty selection screen
  if (gameMode === 'ai' && !aiDifficulty) {
    return (
      <div className="game-container flex flex-col items-center justify-center max-w-4xl mx-auto w-full animate-fade-in min-h-screen">
        <button
          onClick={() => setGameMode(null)}
          className="absolute top-4 left-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium transition-colors"
        >
          ← Kembali
        </button>

        <div className="text-center mb-12">
          <div className="text-7xl mb-4">🤖</div>
          <h1 className="text-4xl font-black text-white mb-2">PILIH KESULITAN AI</h1>
          <p className="text-slate-400">Seberapa pintar lawanmu?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl px-4">
          {/* Easy */}
          <button
            onClick={() => setAiDifficulty('easy')}
            className="bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 p-8 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-900/50"
          >
            <div className="text-6xl mb-4">😊</div>
            <h3 className="text-2xl font-black text-white mb-2">EASY</h3>
            <p className="text-emerald-200 text-sm mb-3">AI sering salah</p>
            <div className="flex justify-center gap-1">
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
              <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
              <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
            </div>
          </button>

          {/* Medium */}
          <button
            onClick={() => setAiDifficulty('medium')}
            className="bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 p-8 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-900/50"
          >
            <div className="text-6xl mb-4">😐</div>
            <h3 className="text-2xl font-black text-white mb-2">MEDIUM</h3>
            <p className="text-amber-200 text-sm mb-3">AI cukup pintar</p>
            <div className="flex justify-center gap-1">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
            </div>
          </button>

          {/* Hard */}
          <button
            onClick={() => setAiDifficulty('hard')}
            className="bg-gradient-to-br from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 p-8 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-rose-900/50"
          >
            <div className="text-6xl mb-4">😈</div>
            <h3 className="text-2xl font-black text-white mb-2">HARD</h3>
            <p className="text-rose-200 text-sm mb-3">AI tidak terkalahkan!</p>
            <div className="flex justify-center gap-1">
              <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
              <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
              <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Show multiplayer lobby for online mode
  if (gameMode === 'online' && !multiplayerRoom) {
    return (
      <MultiplayerLobby
        gameType="tictactoe"
        gameName="Tic Tac Toe"
        playerName={playerName}
        onGameStart={handleMultiplayerStart}
        onBack={handleBackToModeSelection}
      />
    );
  }

  // Game screen
  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12">
      <div className="w-full flex justify-between items-center mb-8 px-4 flex-wrap gap-4">
        <button
          onClick={handleBackToModeSelection}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium transition-colors"
        >
          ← Kembali
        </button>
        
        {/* Game mode indicator */}
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
          <span className="text-2xl">
            {gameMode === 'ai' ? '🤖' : gameMode === 'local' ? '👥' : '🌐'}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-300">
              {gameMode === 'ai' ? 'VS AI' : gameMode === 'local' ? 'LOCAL' : 'ONLINE'}
            </span>
            {gameMode === 'ai' && aiDifficulty && (
              <span className={`text-xs font-bold ${
                aiDifficulty === 'easy' ? 'text-emerald-400' : 
                aiDifficulty === 'medium' ? 'text-amber-400' : 
                'text-rose-400'
              }`}>
                {aiDifficulty.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Scores */}
        <div className="flex gap-4 text-sm font-bold bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
          <span className="text-blue-400">X: {scores.X}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Seri: {scores.Draws}</span>
          <span className="text-slate-500">|</span>
          <span className="text-rose-400">O: {scores.O}</span>
        </div>
      </div>

      {/* Online players info */}
      {gameMode === 'online' && multiplayerPlayers.length === 2 && (
        <div className="w-full max-w-md mb-6 px-4">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">❌</span>
              <div>
                <p className="text-sm font-bold text-blue-400">{multiplayerPlayers[0].name}</p>
                <p className="text-xs text-slate-500">Player X</p>
              </div>
            </div>
            <div className="text-2xl">⚔️</div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-bold text-rose-400">{multiplayerPlayers[1].name}</p>
                <p className="text-xs text-slate-500">Player O</p>
              </div>
              <span className="text-2xl">⭕</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-700 backdrop-blur-sm w-full max-w-md">
        <h2 className={`text-2xl sm:text-3xl font-extrabold mb-8 text-center drop-shadow-md transition-all duration-300 ${winner ? 'text-emerald-400 scale-105' : isDraw ? 'text-amber-400' : opponentLeft ? 'text-red-400' : 'text-white'}`}>
          {status}
        </h2>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8 bg-slate-900 p-2 sm:p-3 rounded-2xl shadow-inner mx-auto" style={{ maxWidth: '320px' }}>
          {board.map((cell, idx) => {
            const isWinningCell = winInfo?.line.includes(idx);
            const isMyTurn = gameMode === 'online' ? ((xIsNext && mySymbol === 'X') || (!xIsNext && mySymbol === 'O')) : true;
            const canClick = !cell && !winner && !opponentLeft && (gameMode !== 'ai' || xIsNext) && (gameMode !== 'online' || isMyTurn);
            
            return (
              <button
                key={idx}
                onClick={() => handleClick(idx)}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl text-5xl sm:text-6xl font-black flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500/50
                  ${canClick ? 'hover:bg-slate-700 bg-slate-800 cursor-pointer active:scale-95' : 'bg-slate-800 cursor-default'}
                  ${isWinningCell ? 'bg-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.4)]' : ''}
                `}
                disabled={!canClick}
              >
                <span className={`transform transition-all duration-300 ${cell ? 'scale-100 rotate-0' : 'scale-0 -rotate-45'} ${cell === 'X' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]'}`}>
                  {cell}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={resetGame}
            className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg
              ${winner || isDraw || opponentLeft ? 'bg-indigo-500 hover:bg-indigo-400 text-white animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
          >
            {winner || isDraw || opponentLeft ? 'Main Lagi' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Game Stats */}
      <div className="w-full max-w-md mt-8 px-4">
        <GameStats gameId="tictactoe" playerName={playerName} />
      </div>

      <div className="mt-6 w-full max-w-md px-4">
        <DailyChallengeCard gameId="tictactoe" compact={true} />
      </div>

      <HelpButton game="tictactoe" />
      
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
