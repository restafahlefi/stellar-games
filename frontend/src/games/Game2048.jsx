import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import AutoReturnTimer from '../components/AutoReturnTimer';
import GameStats from '../components/GameStats';
import { playGameSound } from '../utils/soundEngine';
import HelpButton from '../components/HelpButton';
import AchievementPopup from '../components/AchievementPopup';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { useGameProgress } from '../hooks/useGameProgress';

let audioCtx2048 = null;
let c2048AudioCtx = null;
const playSound = (type) => {
  try {
    if (!window.sharedAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) window.sharedAudioCtx = new AudioContext();
    }
    const ctx = window.sharedAudioCtx;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const masterVol = typeof window.masterVolume !== 'undefined' ? window.masterVolume : 1.0;
    
    if (type === 'slide') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.05 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'merge') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.15 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'win') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.2 * masterVol, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    } else if (type === 'undo') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch(e) { }
};

const getEmptyCoords = (board) => {
  const empty = [];
  for(let r=0; r<4; r++) {
    for(let c=0; c<4; c++) {
      if(board[r][c] === 0) empty.push({r, c});
    }
  }
  return empty;
};

const addRandomTile = (board) => {
  playGameSound('click', 0.08);
  const empty = getEmptyCoords(board);
  if(empty.length === 0) return board;
  const randomCell = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

const CELL_COLORS = {
  0: 'bg-slate-700/50',
  2: 'bg-slate-300 text-slate-800 shadow-[inset_0_0_10px_rgba(255,255,255,0.5)]',
  4: 'bg-amber-200 text-slate-800 shadow-[inset_0_0_10px_rgba(255,255,255,0.8)]',
  8: 'bg-orange-300 text-slate-900 shadow-[0_0_10px_rgba(253,186,116,0.5)]',
  16: 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.6)]',
  32: 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)]',
  64: 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.8)]',
  128: 'bg-yellow-400 text-slate-900 shadow-[0_0_20px_rgba(250,204,21,0.8)]',
  256: 'bg-yellow-500 text-white shadow-[0_0_25px_rgba(234,179,8,0.9)] text-4xl',
  512: 'bg-yellow-600 text-white shadow-[0_0_30px_rgba(202,138,4,1)] text-4xl',
  1024: 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,1)] text-3xl',
  2048: 'bg-emerald-400 text-slate-900 shadow-[0_0_40px_rgba(52,211,153,1)] text-3xl animate-pulse'
};

export default function Game2048({ onBack, playerName }) {
  const [board, setBoard] = useState(() => addRandomTile(addRandomTile(Array(4).fill(0).map(() => Array(4).fill(0)))));
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState(null); // Simple 1-step undo
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  
  const { checkAchievements, updateChallenge, updateStats, clearNewAchievements } = useGameProgress('game2048');

  // Initialize Audio safely
  useEffect(() => {
    const handleFirstClick = () => {
      if (audioCtx2048 && audioCtx2048.state === 'suspended') audioCtx2048.resume();
    };
    window.addEventListener('click', handleFirstClick, { once: true });
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);



  const slideRow = (row) => {
    let arr = row.filter(val => val !== 0);
    let merged = false;
    let rowScore = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        rowScore += arr[i];
        arr.splice(i + 1, 1);
        merged = true;
      }
    }
    while (arr.length < 4) arr.push(0);
    return { newRow: arr, merged, rowScore };
  };

  const checkGameOver = (b) => {
    if (getEmptyCoords(b).length > 0) return false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (c < 3 && b[r][c] === b[r][c + 1]) return false;
        if (r < 3 && b[r][c] === b[r + 1][c]) return false;
      }
    }
    return true;
  };

  const handleKeyDown = (e) => {
    if (gameOver || won) return;
    
    let newBoard = board.map(r => [...r]);
    let moved = false;
    let anyMerged = false;
    let addedScore = 0;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      for (let r = 0; r < 4; r++) {
        let row = [...newBoard[r]];
        if (e.key === 'ArrowRight') row.reverse();
        const { newRow, merged, rowScore } = slideRow(row);
        if (e.key === 'ArrowRight') newRow.reverse();
        
        if (newBoard[r].join(',') !== newRow.join(',')) moved = true;
        if (merged) anyMerged = true;
        newBoard[r] = newRow;
        addedScore += rowScore;
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      for (let c = 0; c < 4; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        if (e.key === 'ArrowDown') col.reverse();
        const { newRow, merged, rowScore } = slideRow(col);
        if (e.key === 'ArrowDown') newRow.reverse();
        
        for (let r = 0; r < 4; r++) {
          if (newBoard[r][c] !== newRow[r]) moved = true;
          newBoard[r][c] = newRow[r];
        }
        if (merged) anyMerged = true;
        addedScore += rowScore;
      }
    }

    if (moved) {
      setHistory({ board: board.map(r => [...r]), score });
      
      if (anyMerged) playSound('merge');
      else playSound('slide');
      
      newBoard = addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(s => s + addedScore);
      
      let has2048 = false;
      newBoard.forEach(row => row.forEach(cell => { if(cell >= 2048) has2048 = true; }));
      
      if (has2048 && !won) {
        setWon(true);
        confetti();
        playSound('win');
        
        // Update stats & achievements
        const finalScore = score + addedScore;
        const maxTile = Math.max(...newBoard.flat());
        updateStats({ gamesPlayed: 1, wins: 1, bestScore: finalScore });
        const unlocked = checkAchievements({ score: finalScore, won: true, maxTile });
        if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
        updateChallenge(maxTile);
        
        gameService.recordGamePlay('game2048').catch(console.error);
        leaderboardService.submitScore(playerName || 'Guest_Player', 'game2048', finalScore).catch(console.error);
      } else if (checkGameOver(newBoard)) {
        setGameOver(true);
        playGameSound('gameOver', 0.5);
        
        // Update stats & achievements
        const finalScore = score + addedScore;
        const maxTile = Math.max(...newBoard.flat());
        updateStats({ gamesPlayed: 1, losses: 1, bestScore: finalScore });
        const unlocked = checkAchievements({ score: finalScore, won: false, maxTile });
        if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
        updateChallenge(maxTile);
        
        gameService.recordGamePlay('game2048').catch(console.error);
        if (finalScore > 0) {
          leaderboardService.submitScore(playerName || 'Guest_Player', 'game2048', finalScore).catch(console.error);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, gameOver, won, score]);

  const restart = () => {
    setBoard(addRandomTile(addRandomTile(Array(4).fill(0).map(() => Array(4).fill(0)))));
    setScore(0);
    setHistory(null);
    setGameOver(false);
    setWon(false);
  };

  const undo = () => {
    if (history && !gameOver && !won) {
      playSound('undo');
      setBoard(history.board);
      setScore(history.score);
      setHistory(null);
    }
  };

  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12">
      <div className="w-full flex justify-between items-center mb-8 px-4 flex-wrap gap-4">
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">← Back</button>
        
        <div className="flex gap-3 flex-wrap items-center justify-center flex-1">
          <GameStats 
            gameId="game2048" 
            playerName={playerName} 
            currentScore={score}
            isPlaying={!gameOver && !won}
          />
          
          <button 
            onClick={undo} 
            disabled={!history}
            className={`px-4 py-2 rounded-xl font-bold transition-all shadow-md ${history ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}
          >
            ↩ Undo
          </button>
          <button onClick={restart} className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-xl text-slate-900 font-bold transition-all shadow-md hover:shadow-orange-500/50">
            ↻ New
          </button>
        </div>
      </div>

      <div className="bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-md mx-auto relative overflow-hidden">
        
        {(gameOver || won) && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-3xl border-4 border-slate-700/50 p-6">
            <h2 className={`text-6xl font-black mb-4 drop-shadow-xl ${won ? 'text-emerald-400' : 'text-rose-500'}`}>
              {won ? 'YOU WIN!' : 'GAME OVER'}
            </h2>
            <p className="text-slate-300 text-xl font-medium mb-8">Final Score: <span className="text-white font-bold">{score}</span></p>
            <div className="flex flex-col gap-4 w-full max-w-[200px]">
                <button onClick={restart} className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-slate-900 font-black rounded-xl text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                Play Again
                </button>
                <button
                onClick={onBack}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
                >
                MENU
                </button>
                <AutoReturnTimer onTimerEnd={onBack} seconds={12} />
            </div>
          </div>
        )}

        <div className="bg-slate-900 p-3 sm:p-4 rounded-2xl grid grid-cols-4 gap-3 sm:gap-4 shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
          {board.map((row, r) => (
            row.map((cell, c) => (
              <div 
                key={`${r}-${c}`} 
                className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl font-black text-2xl sm:text-3xl transition-all duration-150 transform ${cell !== 0 ? 'scale-100' : 'scale-95'} ${CELL_COLORS[cell] || CELL_COLORS[2048]}`}
              >
                {cell !== 0 ? cell : ''}
              </div>
            ))
          ))}
        </div>
      </div>
      {/* Touch Controls - Swipe Buttons for Mobile */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="grid grid-cols-3 gap-3 w-56 h-56 bg-slate-800/50 rounded-3xl p-4 border border-slate-700">
          {/* Up */}
          <div className="col-start-2"></div>
          <button
            onClick={() => handleKeyDown({ key: 'ArrowUp' })}
            onTouchStart={(e) => {
              e.preventDefault();
              handleKeyDown({ key: 'ArrowUp' });
            }}
            className="col-start-2 bg-orange-600 hover:bg-orange-500 active:bg-orange-400 rounded-2xl flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-lg border-2 border-orange-500 h-full"
          >
            🔼
          </button>
          
          {/* Left, Center, Right */}
          <button
            onClick={() => handleKeyDown({ key: 'ArrowLeft' })}
            onTouchStart={(e) => {
              e.preventDefault();
              handleKeyDown({ key: 'ArrowLeft' });
            }}
            className="bg-orange-600 hover:bg-orange-500 active:bg-orange-400 rounded-2xl flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-lg border-2 border-orange-500 h-full"
          >
            ◀️
          </button>
          <div className="bg-slate-900/50 rounded-2xl flex items-center justify-center text-xl font-black text-orange-400 h-full">
            2048
          </div>
          <button
            onClick={() => handleKeyDown({ key: 'ArrowRight' })}
            onTouchStart={(e) => {
              e.preventDefault();
              handleKeyDown({ key: 'ArrowRight' });
            }}
            className="bg-orange-600 hover:bg-orange-500 active:bg-orange-400 rounded-2xl flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-lg border-2 border-orange-500 h-full"
          >
            ▶️
          </button>
          
          {/* Down */}
          <div className="col-start-2"></div>
          <button
            onClick={() => handleKeyDown({ key: 'ArrowDown' })}
            onTouchStart={(e) => {
              e.preventDefault();
              handleKeyDown({ key: 'ArrowDown' });
            }}
            className="col-start-2 bg-orange-600 hover:bg-orange-500 active:bg-orange-400 rounded-2xl flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-lg border-2 border-orange-500 h-full"
          >
            🔽
          </button>
        </div>
        
        <p className="text-slate-400 text-center text-sm font-medium bg-slate-800/50 px-6 py-3 rounded-full border border-slate-700">
          Keyboard: <kbd className="bg-slate-700 px-2 py-1 rounded mx-1 text-slate-200 shadow">Arrows</kbd> | Mobile: <span className="text-orange-400 font-bold">Tap Buttons</span>
        </p>
      </div>

      <div className="mt-6 w-full max-w-md px-4">
        <DailyChallengeCard gameId="game2048" compact={true} />
      </div>

      <HelpButton game="2048" />
      
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
