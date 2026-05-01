import { useState, useEffect } from 'react';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import AutoReturnTimer from '../components/AutoReturnTimer';
import GameStats from '../components/GameStats';

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

    const masterVol = typeof window.masterVolume !== 'undefined' ? window.masterVolume : 1.0;

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

export default function TicTacToe({ onBack, playerName }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });
  const [playAgainstAI, setPlayAgainstAI] = useState(false);
  const [hasScored, setHasScored] = useState(false);

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

  useEffect(() => {
    if (winner && !hasScored) {
      setScores(s => ({ ...s, [winner]: s[winner] + 1 }));
      setHasScored(true);
      playSound('win');

      // OTOMATISASI: Lapor ke server
      gameService.recordGamePlay('tictactoe').catch(console.error);

      // Jika menang melawan AI, masukkan ke leaderboard (simulasi skor 500 per win)
      if (playAgainstAI && winner === 'X') {
        leaderboardService.submitScore(playerName || 'Guest_Player', 'tictactoe', 100).catch(console.error);
      }
    } else if (isDraw && !hasScored) {
      setScores(s => ({ ...s, Draws: s.Draws + 1 }));
      setHasScored(true);
      playSound('draw');
    }
  }, [winner, isDraw, hasScored]);

  // "Smart" AI Logic
  useEffect(() => {
    if (playAgainstAI && !xIsNext && !winner && !isDraw) {
      const timer = setTimeout(() => {
        const newBoard = [...board];
        const emptyIndices = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);

        let moveIndex = -1;

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

        if (moveIndex !== -1) {
          newBoard[moveIndex] = 'O';
          playSound('place-o');
          setBoard(newBoard);
          setXIsNext(true);
        }
      }, 600); // slight delay to feel human
      return () => clearTimeout(timer);
    }
  }, [board, xIsNext, playAgainstAI, winner, isDraw]);

  const handleClick = (i) => {
    if (board[i] || winner || (playAgainstAI && !xIsNext)) return;

    playSound(xIsNext ? 'place-x' : 'place-o');
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setHasScored(false);
  };

  const resetScores = () => {
    if (window.confirm('Reset all match scores to 0?')) {
      setScores({ X: 0, O: 0, Draws: 0 });
      resetGame();
    }
  };

  let status;
  if (winner) {
    status = `🎉 Winner: ${winner}!`;
  } else if (isDraw) {
    status = "🤝 It's a Draw!";
  } else {
    status = `Current Turn: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12">
      <div className="w-full flex justify-between items-center mb-8 px-4 flex-wrap gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium transition-colors"
        >
          ← Back
        </button>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-4 text-sm font-bold bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <span className="text-blue-400">P1 (X): {scores.X}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Draws: {scores.Draws}</span>
            <span className="text-slate-500">|</span>
            <span className="text-rose-400">{playAgainstAI ? 'AI' : 'P2'} (O): {scores.O}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-700 backdrop-blur-sm w-full max-w-md">

        <div className="flex justify-center mb-6">
          <button
            onClick={() => { setPlayAgainstAI(!playAgainstAI); setScores({ X: 0, O: 0, Draws: 0 }); resetGame(); }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${playAgainstAI ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            {playAgainstAI ? '🤖 Playing vs AI (Click to play 2 Players)' : '👥 2 Players (Click to play vs AI)'}
          </button>
        </div>

        <h2 className={`text-2xl sm:text-3xl font-extrabold mb-8 text-center drop-shadow-md transition-all duration-300 ${winner ? 'text-emerald-400 scale-105' : isDraw ? 'text-amber-400' : 'text-white'}`}>
          {status}
        </h2>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8 bg-slate-900 p-2 sm:p-3 rounded-2xl shadow-inner mx-auto" style={{ maxWidth: '320px' }}>
          {board.map((cell, idx) => {
            const isWinningCell = winInfo?.line.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleClick(idx)}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl text-5xl sm:text-6xl font-black flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500/50
                  ${!cell && !winner && (!playAgainstAI || xIsNext) ? 'hover:bg-slate-700 bg-slate-800 cursor-pointer active:scale-95' : 'bg-slate-800 cursor-default'}
                  ${isWinningCell ? 'bg-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.4)]' : ''}
                `}
                disabled={!!cell || !!winner || (playAgainstAI && !xIsNext)}
              >
                <span className={`transform transition-all duration-300 ${cell ? 'scale-100 rotate-0' : 'scale-0 -rotate-45'} ${cell === 'X' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]'}`}>
                  {cell}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={resetGame}
            className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg
              ${winner || isDraw ? 'bg-indigo-500 hover:bg-indigo-400 text-white animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
          >
            {winner || isDraw ? 'Play Again' : 'Restart Board'}
          </button>
        </div>
      </div>
    </div>
  );
}
