import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
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
let c4AudioCtx = null;
const playSound = (type) => {
  try {
    if (!c4AudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) c4AudioCtx = new AudioContext();
    }
    if (!c4AudioCtx) return;
    if (c4AudioCtx.state === 'suspended') c4AudioCtx.resume();
    
    const ctx = c4AudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const masterVol = typeof window.gameVolume !== 'undefined' ? window.gameVolume : 0.7;
    
    if (type === 'drop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15 * masterVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.setValueAtTime(700, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15 * masterVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {}
};

export default function ConnectFourMultiplayer({ onBack, playerName }) {
  // Game mode selection
  const [gameMode, setGameMode] = useState(null); // null, 'ai', 'local', 'online'
  const [aiDifficulty, setAiDifficulty] = useState(null); // 'easy', 'medium', 'hard'
  const [multiplayerRoom, setMultiplayerRoom] = useState(null);
  const [multiplayerPlayers, setMultiplayerPlayers] = useState([]);
  const [myColor, setMyColor] = useState(null); // 1 (red) or 2 (yellow)
  
  // Game state
  const [board, setBoard] = useState(Array(6).fill(null).map(() => Array(7).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 = red, 2 = yellow
  const [winner, setWinner] = useState(null);
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [scores, setScores] = useState({ red: 0, yellow: 0, draws: 0 });
  const [hasScored, setHasScored] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  
  const { checkAchievements, updateChallenge, updateStats, clearNewAchievements } = useGameProgress('connect4');

  const checkWin = (b, p) => {
    // Horizontal
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === p && b[r][c+1] === p && b[r][c+2] === p && b[r][c+3] === p) {
          return { winner: p, line: [[r,c], [r,c+1], [r,c+2], [r,c+3]] };
        }
      }
    }
    // Vertical
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        if (b[r][c] === p && b[r+1][c] === p && b[r+2][c] === p && b[r+3][c] === p) {
          return { winner: p, line: [[r,c], [r+1,c], [r+2,c], [r+3,c]] };
        }
      }
    }
    // Diagonal (\)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === p && b[r+1][c+1] === p && b[r+2][c+2] === p && b[r+3][c+3] === p) {
          return { winner: p, line: [[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]] };
        }
      }
    }
    // Diagonal (/)
    for (let r = 3; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === p && b[r-1][c+1] === p && b[r-2][c+2] === p && b[r-3][c+3] === p) {
          return { winner: p, line: [[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]] };
        }
      }
    }
    return null;
  };

  const isDraw = () => {
    return board[0].every(cell => cell !== null);
  };

  // Handle multiplayer game start
  const handleMultiplayerStart = ({ room, players }) => {
    setMultiplayerRoom(room);
    setMultiplayerPlayers(players);
    
    // First player is red (1), second is yellow (2)
    const myIndex = players.findIndex(p => p.id === socketService.socket.id);
    setMyColor(myIndex === 0 ? 1 : 2);
    
    console.log('🎮 Connect Four multiplayer started!', { room, players, myColor: myIndex === 0 ? 1 : 2 });
  };

  // Listen for opponent moves
  useEffect(() => {
    if (gameMode !== 'online' || !multiplayerRoom) return;

    const handleOpponentMove = ({ move, gameState }) => {
      console.log('📥 Opponent move received:', move);
      playSound('drop');
      
      if (gameState?.board) {
        setBoard(gameState.board);
        setCurrentPlayer(gameState.currentPlayer);
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
    const winInfo = checkWin(board, 1) || checkWin(board, 2);
    
    if (winInfo && !hasScored) {
      const winnerPlayer = winInfo.winner;
      setWinner(winnerPlayer);
      setHasScored(true);
      
      if (winnerPlayer === 1) {
        setScores(s => ({ ...s, red: s.red + 1 }));
      } else {
        setScores(s => ({ ...s, yellow: s.yellow + 1 }));
      }
      
      playSound('win');
      playGameSound('win', 0.5);
      confetti();

      // Update stats & achievements
      const won = (gameMode === 'ai' && winnerPlayer === 1) || (gameMode === 'online' && winnerPlayer === myColor);
      updateStats({ gamesPlayed: 1, wins: won ? 1 : 0, losses: won ? 0 : 1 });
      const unlocked = checkAchievements({ won, gameMode, winStreak: winnerPlayer === 1 ? scores.red + 1 : scores.yellow + 1 });
      if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
      if (won) updateChallenge(1);

      // Record game play
      gameService.recordGamePlay('connect4').catch(console.error);

      // Submit score
      if (gameMode === 'ai' && winnerPlayer === 1) {
        leaderboardService.submitScore(playerName || 'Guest_Player', 'connect4', 500).catch(console.error);
      } else if (gameMode === 'online' && winnerPlayer === myColor) {
        leaderboardService.submitScore(playerName || 'Guest_Player', 'connect4', 1000).catch(console.error);
      }
    } else if (isDraw() && !hasScored && !winner) {
      setScores(s => ({ ...s, draws: s.draws + 1 }));
      setHasScored(true);
      playGameSound('draw', 0.3);
      updateStats({ gamesPlayed: 1 });
    }
  }, [board, hasScored, winner, gameMode, myColor, playerName, scores, checkAchievements, updateChallenge, updateStats]);

  // AI Logic with Difficulty Levels - Fixed to prevent infinite thinking
  useEffect(() => {
    if (gameMode !== 'ai' || currentPlayer !== 2 || winner || isDraw()) {
      setIsAiTurn(false);
      return;
    }

    setIsAiTurn(true);
    
    const makeAiMove = () => {
      const availableCols = [];
      for (let c = 0; c < 7; c++) {
        if (board[0][c] === null) availableCols.push(c);
      }

      if (availableCols.length === 0) {
        setIsAiTurn(false);
        return;
      }

      let col = -1;

      if (aiDifficulty === 'easy') {
        // Easy: 70% random, 30% smart
        if (Math.random() < 0.7) {
          col = availableCols[Math.floor(Math.random() * availableCols.length)];
        } else {
          // Try to win
          for (let c of availableCols) {
            const testBoard = JSON.parse(JSON.stringify(board));
            let r = -1;
            for (let row = 5; row >= 0; row--) {
              if (testBoard[row][c] === null) { r = row; break; }
            }
            if (r !== -1) {
              testBoard[r][c] = 2;
              if (checkWin(testBoard, 2)) { col = c; break; }
            }
          }
          // Random if can't win
          if (col === -1) {
            col = availableCols[Math.floor(Math.random() * availableCols.length)];
          }
        }
      } else if (aiDifficulty === 'medium') {
        // Medium: Try to win, then block, then center, then random
        // 1. Try to win
        for (let c of availableCols) {
          const testBoard = JSON.parse(JSON.stringify(board));
          let r = -1;
          for (let row = 5; row >= 0; row--) {
            if (testBoard[row][c] === null) { r = row; break; }
          }
          if (r !== -1) {
            testBoard[r][c] = 2;
            if (checkWin(testBoard, 2)) { col = c; break; }
          }
        }

        // 2. Try to block
        if (col === -1) {
          for (let c of availableCols) {
            const testBoard = JSON.parse(JSON.stringify(board));
            let r = -1;
            for (let row = 5; row >= 0; row--) {
              if (testBoard[row][c] === null) { r = row; break; }
            }
            if (r !== -1) {
              testBoard[r][c] = 1;
              if (checkWin(testBoard, 1)) { col = c; break; }
            }
          }
        }

        // 3. Prefer center columns
        if (col === -1) {
          const centerCols = [3, 2, 4, 1, 5, 0, 6].filter(c => availableCols.includes(c));
          if (centerCols.length > 0) {
            col = centerCols[0];
          }
        }

        // 4. Random fallback
        if (col === -1) {
          col = availableCols[Math.floor(Math.random() * availableCols.length)];
        }
      } else if (aiDifficulty === 'hard') {
        // Hard: Advanced AI with scoring
        let bestScore = -Infinity;
        for (let c of availableCols) {
          const testBoard = JSON.parse(JSON.stringify(board));
          let r = -1;
          for (let row = 5; row >= 0; row--) {
            if (testBoard[row][c] === null) { r = row; break; }
          }
          if (r !== -1) {
            testBoard[r][c] = 2;
            
            // Check if winning move
            if (checkWin(testBoard, 2)) {
              col = c;
              break;
            }
            
            // Score the position
            let score = 0;
            
            // Center column preference
            score += (3 - Math.abs(c - 3)) * 3;
            
            // Check if blocking opponent's win
            testBoard[r][c] = 1;
            if (checkWin(testBoard, 1)) {
              score += 100;
            }
            testBoard[r][c] = 2;
            
            if (score > bestScore) {
              bestScore = score;
              col = c;
            }
          }
        }
        
        // Fallback to random if no move found
        if (col === -1) {
          col = availableCols[Math.floor(Math.random() * availableCols.length)];
        }
      } else {
        // Fallback: random
        col = availableCols[Math.floor(Math.random() * availableCols.length)];
      }

      if (col !== -1) {
        handleMove(col);
      }
      setIsAiTurn(false);
    };

    // Add delay for AI thinking animation with timeout protection
    const aiTimeout = setTimeout(makeAiMove, Math.random() * 800 + 400); // 0.4-1.2s delay
    
    return () => {
      clearTimeout(aiTimeout);
      setIsAiTurn(false);
    };
  }, [gameMode, currentPlayer, winner, board, aiDifficulty]);

  const handleMove = (col) => {
    if (winner || opponentLeft) return;

    // Check turn for different modes
    if (gameMode === 'ai' && currentPlayer !== 1) return;
    if (gameMode === 'online') {
      const isMyTurn = currentPlayer === myColor;
      if (!isMyTurn) return;
    }

    // Find available row
    let row = -1;
    for (let r = 5; r >= 0; r--) {
      if (!board[r][col]) {
        row = r;
        break;
      }
    }

    if (row === -1) {
      playGameSound('error', 0.3);
      return;
    }

    playSound('drop');
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);

    // Send move to opponent in online mode
    if (gameMode === 'online' && multiplayerRoom) {
      socketService.sendMove(multiplayerRoom.id, { col, row, player: currentPlayer }, {
        board: newBoard,
        currentPlayer: currentPlayer === 1 ? 2 : 1
      });
    }
  };

  const resetGame = () => {
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
    setCurrentPlayer(1);
    setWinner(null);
    setIsAiTurn(false);
    setHasScored(false);
    setOpponentLeft(false);
  };

  const handleBackToModeSelection = () => {
    if (gameMode === 'online' && multiplayerRoom) {
      socketService.leaveRoom();
    }
    setGameMode(null);
    setMultiplayerRoom(null);
    setMultiplayerPlayers([]);
    setMyColor(null);
    resetGame();
    setScores({ red: 0, yellow: 0, draws: 0 });
  };

  let status;
  if (opponentLeft) {
    status = '👋 Lawan keluar dari game';
  } else if (winner) {
    if (gameMode === 'online') {
      status = winner === myColor ? '🎉 Kamu Menang!' : '😢 Kamu Kalah!';
    } else if (gameMode === 'ai') {
      status = winner === 1 ? '🎉 Kamu Menang!' : '💀 AI Menang!';
    } else {
      status = winner === 1 ? '🔴 Merah Menang!' : '🟡 Kuning Menang!';
    }
  } else if (isDraw()) {
    status = "🤝 Seri!";
  } else {
    if (gameMode === 'online') {
      const isMyTurn = currentPlayer === myColor;
      status = isMyTurn ? '🎯 Giliran Kamu!' : '⏳ Menunggu lawan...';
    } else if (gameMode === 'ai') {
      status = currentPlayer === 1 ? '🎯 Giliran Kamu!' : '🤖 AI Berpikir...';
    } else {
      status = currentPlayer === 1 ? '🔴 Giliran Merah' : '🟡 Giliran Kuning';
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
          <div className="text-7xl mb-4">🔴🟡</div>
          <h1 className="text-4xl font-black text-white mb-2">CONNECT FOUR</h1>
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
            onClick={() => setGameMode('local')}
            className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 p-8 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/50"
          >
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-black text-white mb-2">LOCAL</h3>
            <p className="text-blue-200 text-sm">2 pemain, 1 perangkat</p>
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
        gameType="connect4"
        gameName="Connect Four"
        playerName={playerName}
        onGameStart={handleMultiplayerStart}
        onBack={handleBackToModeSelection}
      />
    );
  }

  // Game screen
  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12">
      {(winner || isDraw()) && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center rounded-3xl">
          <h2 className={`text-6xl font-black mb-6 drop-shadow-2xl ${winner ? (winner === 1 ? 'text-rose-500' : 'text-amber-400') : 'text-blue-400'}`}>
            {status}
          </h2>
          <div className="flex flex-col gap-4 w-full max-w-[200px]">
            <button
              onClick={resetGame}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xl rounded-2xl transition-all shadow-xl"
            >
              MAIN LAGI
            </button>
            <button
              onClick={handleBackToModeSelection}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
            >
              GANTI MODE
            </button>
            <AutoReturnTimer onTimerEnd={onBack} seconds={12} />
          </div>
        </div>
      )}

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
          <span className="text-sm font-bold text-slate-300">
            {gameMode === 'ai' ? 'VS AI' : gameMode === 'local' ? 'LOCAL' : 'ONLINE'}
          </span>
        </div>

        {/* Scores */}
        <div className="flex gap-4 text-sm font-bold bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
          <span className="text-rose-400">🔴 {scores.red}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Seri: {scores.draws}</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400">🟡 {scores.yellow}</span>
        </div>
      </div>

      {/* Online players info */}
      {gameMode === 'online' && multiplayerPlayers.length === 2 && (
        <div className="w-full max-w-2xl mb-6 px-4">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔴</span>
              <div>
                <p className="text-sm font-bold text-rose-400">{multiplayerPlayers[0].name}</p>
                <p className="text-xs text-slate-500">Player 1 (Red)</p>
              </div>
            </div>
            <div className="text-2xl">⚔️</div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-bold text-amber-400">{multiplayerPlayers[1].name}</p>
                <p className="text-xs text-slate-500">Player 2 (Yellow)</p>
              </div>
              <span className="text-2xl">🟡</span>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className={`text-3xl font-black transition-all duration-300 ${winner ? 'text-emerald-400 scale-105' : opponentLeft ? 'text-red-400' : 'text-white'}`}>
          {status}
        </h2>
        
        {/* AI Thinking Indicator */}
        {gameMode === 'ai' && isAiTurn && !winner && !isDraw() && (
          <div className="mt-3 flex items-center justify-center gap-2 text-amber-400">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <span className="ml-2 text-sm font-bold">AI sedang berpikir...</span>
          </div>
        )}
      </div>

      <div className="bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-700">
        <div className="grid grid-cols-7 gap-3 bg-indigo-900/40 p-4 rounded-2xl border-4 border-indigo-900 shadow-inner">
          {board[0].map((_, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-3">
              {[0,1,2,3,4,5].map(rowIdx => (
                <button
                  key={rowIdx}
                  onClick={() => handleMove(colIdx)}
                  disabled={winner || isDraw() || opponentLeft}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-inner transition-all transform hover:scale-105 ${
                    board[rowIdx][colIdx] === 1 
                      ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' 
                      : board[rowIdx][colIdx] === 2 
                      ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]' 
                      : 'bg-slate-900 hover:bg-slate-800 cursor-pointer'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Game Stats */}
      <div className="w-full max-w-2xl mt-8 px-4">
        <GameStats gameId="connect4" playerName={playerName} />
      </div>

      <div className="mt-6 w-full max-w-md px-4">
        <DailyChallengeCard gameId="connect4" compact={true} />
      </div>

      <HelpButton game="connect4" />
      
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
