import React, { useState, useEffect, useCallback, useRef } from 'react';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import AutoReturnTimer from '../components/AutoReturnTimer';
import GameStats from '../components/GameStats';
import HelpButton from '../components/HelpButton';
import AchievementPopup from '../components/AchievementPopup';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { useGameProgress } from '../hooks/useGameProgress';

let audioCtxMine = null;
const getAudioCtx = () => {
  if (!window.sharedAudioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) window.sharedAudioCtx = new AudioContext();
  }
  return window.sharedAudioCtx;
};

const playSound = (type) => {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const masterVol = typeof window.masterVolume !== 'undefined' ? window.masterVolume : 1.0;

    if (type === 'reveal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.05 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'flag') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.05 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'lose') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.2 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'win') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.setValueAtTime(700, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.15 * masterVol, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    }
  } catch(e) { }
};

const DIFFICULTIES = {
  EASY: { rows: 8, cols: 8, mines: 10, label: 'Easy' },
  MEDIUM: { rows: 10, cols: 10, mines: 20, label: 'Medium' },
  HARD: { rows: 12, cols: 12, mines: 35, label: 'Hard' }
};

const generateEmptyGrid = (rows, cols) => {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid.push([]);
    for (let c = 0; c < cols; c++) {
      grid[r].push({
        r, c, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0
      });
    }
  }
  return grid;
};

const NUMBER_COLORS = {
  1: 'text-blue-400', 2: 'text-emerald-400', 3: 'text-rose-500', 4: 'text-indigo-400',
  5: 'text-amber-500', 6: 'text-cyan-400', 7: 'text-slate-900', 8: 'text-slate-500'
};

export default function Minesweeper({ onBack, playerName }) {
  const [difficulty, setDifficulty] = useState('EASY');
  const { rows, cols, mines } = DIFFICULTIES[difficulty];
  
  const [grid, setGrid] = useState(() => generateEmptyGrid(rows, cols));
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [flagsLeft, setFlagsLeft] = useState(mines);
  const [firstClick, setFirstClick] = useState(true);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const [isExploding, setIsExploding] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [touchMode, setTouchMode] = useState('reveal'); // 'reveal' or 'flag' for mobile
  
  const { checkAchievements, updateChallenge, updateStats, clearNewAchievements } = useGameProgress('minesweeper');

  useEffect(() => {
    if (gameOver || won || firstClick) {
      clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameOver, won, firstClick]);

  useEffect(() => {
    restart();
  }, [difficulty]);

  const placeMines = (gridRef, excludeR, excludeC) => {
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      
      const isExclusionZone = Math.abs(r - excludeR) <= 1 && Math.abs(c - excludeC) <= 1;

      if (!gridRef[r][c].isMine && !isExclusionZone) {
        gridRef[r][c].isMine = true;
        minesPlaced++;
      }
    }
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!gridRef[r][c].isMine) {
          let count = 0;
          for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++) {
              if (r+i >= 0 && r+i < rows && c+j >= 0 && c+j < cols) {
                if (gridRef[r+i][c+j].isMine) count++;
              }
            }
          }
          gridRef[r][c].neighborMines = count;
        }
      }
    }
  };

  const revealCell = (r, c) => {
    if (gameOver || won || grid[r][c].isRevealed || grid[r][c].isFlagged) return;

    let newGrid = [...grid.map(row => [...row])];

    if (firstClick) {
      placeMines(newGrid, r, c);
      setFirstClick(false);
    }

    if (newGrid[r][c].isMine) {
      playSound('lose');
      setIsExploding(true);
      setTimeout(() => setIsExploding(false), 500);
      
      newGrid.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      setGrid(newGrid);
      setGameOver(true);
      
      // Update stats & achievements
      updateStats({ gamesPlayed: 1, losses: 1 });
      const unlocked = checkAchievements({ won: false, difficulty, time: timer });
      if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
      
      return;
    }

    playSound('click');

    const queue = [[r, c]];
    while (queue.length > 0) {
      const [currR, currC] = queue.shift();
      const cell = newGrid[currR][currC];
      
      if (!cell.isRevealed && !cell.isFlagged) {
        cell.isRevealed = true;
        
        if (cell.neighborMines === 0) {
          for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++) {
              if (currR+i >= 0 && currR+i < rows && currC+j >= 0 && currC+j < cols) {
                if(!newGrid[currR+i][currC+j].isRevealed) {
                  queue.push([currR+i, currC+j]);
                }
              }
            }
          }
        }
      }
    }

    setGrid(newGrid);

    let revealedSafe = 0;
    newGrid.forEach(row => row.forEach(cell => {
      if (!cell.isMine && cell.isRevealed) revealedSafe++;
    }));
    
    if (revealedSafe === (rows * cols) - mines) {
      playSound('win');
      setWon(true);
      setGameOver(true);
      
      // Update stats & achievements
      updateStats({ gamesPlayed: 1, wins: 1, bestScore: timer });
      const unlocked = checkAchievements({ won: true, difficulty, time: timer });
      if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
      updateChallenge(1);
      
      gameService.recordGamePlay('minesweeper').catch(console.error);
      leaderboardService.submitScore(playerName || 'Guest_Player', 'minesweeper', (rows * cols * 10) - timer).catch(console.error);
    }
  };

  const toggleFlag = (e, r, c) => {
    e.preventDefault();
    if (gameOver || won || grid[r][c].isRevealed) return;
    
    playSound('flag');
    let newGrid = [...grid.map(row => [...row])];
    const cell = newGrid[r][c];
    
    if (!cell.isFlagged && flagsLeft > 0) {
      cell.isFlagged = true;
      setFlagsLeft(prev => prev - 1);
    } else if (cell.isFlagged) {
      cell.isFlagged = false;
      setFlagsLeft(prev => prev + 1);
    }
    setGrid(newGrid);
  };

  const restart = () => {
    setGrid(generateEmptyGrid(rows, cols));
    setGameOver(false);
    setWon(false);
    setFlagsLeft(mines);
    setFirstClick(true);
    setTimer(0);
    setIsExploding(false);
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12 transition-all duration-300 ${isExploding ? 'scale-95 blur-sm' : ''}`}>
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake { animation: shake 0.5s; }
      `}</style>

      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 px-4 flex-wrap">
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors shrink-0">← Back</button>
        
        <div className="flex gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          {Object.keys(DIFFICULTIES).map(diff => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${difficulty === diff ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              {DIFFICULTIES[diff].label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <GameStats 
            gameId="minesweeper" 
            playerName={playerName} 
            currentScore={timer}
            isPlaying={!gameOver && !won && !firstClick}
          />
          <button onClick={restart} className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded-xl text-white font-bold transition-all shadow-md">
            ↻ New
          </button>
        </div>
      </div>

      <div className={`bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-2xl border border-slate-700 w-fit mx-auto relative overflow-hidden ${isExploding ? 'animate-shake' : ''}`}>
        
        {(gameOver || won) && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
            <h2 className={`text-5xl font-black mb-4 drop-shadow-xl ${won ? 'text-emerald-400' : 'text-rose-500'}`}>
              {won ? '🏆 MISSION COMPLETE' : '💥 BOOM!'}
            </h2>
            <div className="bg-slate-800 rounded-2xl p-6 mb-6 border-2 border-slate-700">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Total Time</p>
              <p className="text-3xl font-black text-white font-mono">{timer}s</p>
            </div>
            
            <div className="flex flex-col gap-4 w-full max-w-[200px]">
              <button 
                onClick={restart}
                className={`w-full py-4 font-black text-xl rounded-2xl transition-all shadow-lg ${won ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900' : 'bg-rose-500 hover:bg-rose-400 text-white'}`}
              >
                {won ? 'PLAY AGAIN' : 'TRY AGAIN'}
              </button>
              <button
                onClick={onBack}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
              >
                MENU
              </button>
              <AutoReturnTimer onTimerEnd={onBack} seconds={10} />
            </div>
          </div>
        )}

        <div 
          className="bg-slate-900 p-2 sm:p-3 rounded-2xl grid gap-1 sm:gap-1.5 shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) => (
            row.map((cell, c) => (
              <div 
                key={`${r}-${c}`} 
                onClick={() => {
                  if (touchMode === 'reveal') {
                    revealCell(r, c);
                  } else {
                    toggleFlag({ preventDefault: () => {} }, r, c);
                  }
                }}
                onContextMenu={(e) => toggleFlag(e, r, c)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (touchMode === 'reveal') {
                    revealCell(r, c);
                  } else {
                    toggleFlag({ preventDefault: () => {} }, r, c);
                  }
                }}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-sm font-black text-lg transition-colors cursor-pointer select-none
                  ${cell.isRevealed 
                    ? cell.isMine 
                      ? 'bg-rose-500 shadow-[inset_0_0_15px_rgba(159,18,57,0.8)]' 
                      : 'bg-slate-700 shadow-inner'
                    : 'bg-slate-600 hover:bg-slate-500 active:bg-slate-400 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.2),inset_-2px_-2px_5px_rgba(0,0,0,0.4)] border border-slate-500'}
                `}
              >
                {cell.isRevealed ? (
                  cell.isMine ? '💣' : (cell.neighborMines > 0 ? <span className={NUMBER_COLORS[cell.neighborMines]}>{cell.neighborMines}</span> : '')
                ) : (
                  cell.isFlagged ? '🚩' : ''
                )}
              </div>
            ))
          ))}
        </div>
      </div>
      {/* Touch Controls - Toggle Mode for Mobile */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-700">
          <button
            onClick={() => setTouchMode('reveal')}
            onTouchStart={(e) => {
              e.preventDefault();
              setTouchMode('reveal');
            }}
            className={`px-8 py-4 rounded-xl font-bold text-base transition-all ${touchMode === 'reveal' ? 'bg-emerald-500 text-white shadow-lg scale-105' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
          >
            👆 REVEAL
          </button>
          <button
            onClick={() => setTouchMode('flag')}
            onTouchStart={(e) => {
              e.preventDefault();
              setTouchMode('flag');
            }}
            className={`px-8 py-4 rounded-xl font-bold text-base transition-all ${touchMode === 'flag' ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
          >
            🚩 FLAG
          </button>
        </div>
        
        <p className="text-slate-400 text-center text-sm font-medium bg-slate-800/50 px-6 py-3 rounded-full border border-slate-700">
          Desktop: <kbd className="bg-slate-700 px-2 py-1 rounded mx-1 text-slate-200">Left Click</kbd> reveal, <kbd className="bg-slate-700 px-2 py-1 rounded mx-1 text-slate-200">Right Click</kbd> flag<br/>
          Mobile: <span className="text-emerald-400 font-bold">Select mode</span> then <span className="text-rose-400 font-bold">tap cells</span>
        </p>
      </div>

      <div className="mt-6 w-full max-w-md px-4">
        <DailyChallengeCard gameId="minesweeper" compact={true} />
      </div>

      <HelpButton game="minesweeper" />
      
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
