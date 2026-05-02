import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import AutoReturnTimer from '../components/AutoReturnTimer';
import GameStats from '../components/GameStats';
import HelpButton from '../components/HelpButton';
import AchievementPopup from '../components/AchievementPopup';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { useGameProgress } from '../hooks/useGameProgress';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [[10, 10], [9, 10], [8, 10]];
const INITIAL_FOOD = [15, 10];
const BASE_SPEED = 120; // Optimized for smoother gameplay

const DIRECTIONS = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

let snakeAudioCtx = null;
const playSound = (type) => {
  try {
    if (!snakeAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) snakeAudioCtx = new AudioContext();
    }
    if (!snakeAudioCtx) return;
    if (snakeAudioCtx.state === 'suspended') snakeAudioCtx.resume();

    const ctx = snakeAudioCtx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const masterVol = typeof window.gameVolume !== 'undefined' ? window.gameVolume : 0.7;

    if (type === 'eat') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.15 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'die') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.2 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'gameOver') {
      // Game over sound - descending tones
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.25 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'levelUp') {
      // Level up sound - ascending tones
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'newRecord') {
      // New record sound - celebratory
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.25 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch(e) { }
};

export default function Snake({ onBack, playerName }) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [justEaten, setJustEaten] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  
  const dirRef = useRef(DIRECTIONS.ArrowRight);
  const lastProcessedDirRef = useRef(DIRECTIONS.ArrowRight);
  
  const speed = Math.max(50, BASE_SPEED - (score * 1.5));
  
  // Achievement & Daily Challenge Integration
  const { 
    newAchievements, 
    checkAchievements, 
    updateChallenge, 
    updateStats,
    clearNewAchievements 
  } = useGameProgress('snake');

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    
    // Update stats
    updateStats({
      gamesPlayed: 1,
      bestScore: score,
      totalScore: score
    });
    
    // Check achievements
    const unlocked = checkAchievements({ score, won: false });
    if (unlocked.length > 0) {
      setCurrentAchievement(unlocked[0]);
    }
    
    // Update daily challenge
    updateChallenge(score);
    
    // Record game play
    gameService.recordGamePlay('snake').catch(console.error);
  }, [score, checkAchievements, updateChallenge, updateStats]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || !hasStarted) return;

    setSnake((prev) => {
      const currentDir = dirRef.current;
      lastProcessedDirRef.current = currentDir; 
      
      const head = prev[0];
      let newHeadX = head[0] + currentDir[0];
      let newHeadY = head[1] + currentDir[1];

      if (newHeadX < 0) newHeadX = GRID_SIZE - 1;
      else if (newHeadX >= GRID_SIZE) newHeadX = 0;
      
      if (newHeadY < 0) newHeadY = GRID_SIZE - 1;
      else if (newHeadY >= GRID_SIZE) newHeadY = 0;

      const newHead = [newHeadX, newHeadY];

      if (prev.some(segment => segment[0] === newHead[0] && segment[1] === newHead[1])) {
        playSound('die');
        setTimeout(() => playSound('gameOver'), 100);
        const currentScore = score;
        handleGameOver(); // Berhenti total!
        if (currentScore > 0) {
          leaderboardService.submitScore(playerName || 'Guest_Player', 'snake', currentScore).catch(console.error);
        }
        return prev;
      }

      const newSnake = [newHead, ...prev];

      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        playSound('eat');
        setJustEaten(true);
        setTimeout(() => setJustEaten(false), 150);

        const newScore = score + 10;
        setScore(newScore);
        
        // Level up sound every 50 points
        if (newScore % 50 === 0 && newScore > 0) {
          playSound('levelUp');
        }
        
        let newFood;
        while (true) {
          newFood = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
          if (!newSnake.some(seg => seg[0] === newFood[0] && seg[1] === newFood[1])) break;
        }
        setFood(newFood);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, gameOver, isPaused, hasStarted, score]);

  const changeDirection = (newDirName) => {
    const newDir = DIRECTIONS[newDirName];
    const lastDir = lastProcessedDirRef.current;
    if (lastDir[0] === -newDir[0] && lastDir[1] === -newDir[1]) return;
    dirRef.current = newDir;
    if (!hasStarted && !gameOver) setHasStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (DIRECTIONS[e.key]) {
        e.preventDefault();
        changeDirection(e.key);
      }
      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        if (hasStarted && !gameOver) setIsPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, gameOver]);

  useEffect(() => {
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [moveSnake, speed]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    dirRef.current = DIRECTIONS.ArrowRight;
    lastProcessedDirRef.current = DIRECTIONS.ArrowRight;
    setGameOver(false);
    setScore(0);
    setHasStarted(false);
    setIsPaused(false);
  };

  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12">
      <div className="w-full flex justify-between items-center mb-6 px-4 flex-wrap gap-4">
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold transition-colors">← Back</button>
        
        <div className="flex gap-3 flex-wrap items-center justify-center flex-1">
          <GameStats 
            gameId="snake" 
            playerName={playerName} 
            currentScore={score}
            isPlaying={hasStarted && !gameOver}
          />
        </div>
      </div>

      <div 
        className="bg-slate-900 border-[12px] border-slate-800 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative rounded-[2rem] overflow-hidden"
        style={{
          width: '360px',
          height: '360px',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
        onClick={() => { if (!hasStarted && !gameOver) setHasStarted(true); }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
          backgroundSize: '18px 18px'
        }}></div>

        <div
          className={`bg-rose-500 rounded-full z-10 transition-transform duration-75 ${justEaten ? 'scale-0' : 'scale-100 animate-pulse shadow-[0_0_15px_rgba(244,63,94,1)]'}`}
          style={{ gridColumnStart: food[0] + 1, gridRowStart: food[1] + 1, margin: '2px' }}
        />

        {snake.map((segment, idx) => {
          const isHead = idx === 0;
          return (
            <div
              key={idx}
              className={`${isHead ? 'bg-emerald-400 z-20 shadow-[0_0_10px_rgba(52,211,153,1)]' : 'bg-emerald-600 z-10'} transition-all duration-75`}
              style={{
                gridColumnStart: segment[0] + 1,
                gridRowStart: segment[1] + 1,
                margin: '1px',
                borderRadius: isHead ? '6px' : '2px',
                transform: isHead && justEaten ? 'scale(1.3)' : 'scale(1)'
              }}
            />
          );
        })}

        {!hasStarted && !gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center backdrop-blur-md z-30 cursor-pointer">
            <div className="bg-emerald-500 text-slate-900 px-8 py-3 rounded-full font-black text-xl animate-bounce mb-4 shadow-xl">PLAY NOW</div>
            <p className="text-sm font-black text-emerald-400/80 mb-2 tracking-widest uppercase">✨ Wall-Wrap Enabled</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest">Use Arrow Keys</p>
          </div>
        )}

        {isPaused && hasStarted && !gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center backdrop-blur-md z-30">
            <h2 className="text-5xl font-black text-blue-400 tracking-tighter drop-shadow-2xl italic">PAUSED</h2>
            <button onClick={(e) => { e.stopPropagation(); setIsPaused(false); }} className="mt-6 px-10 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 shadow-xl transition-all active:scale-95">RESUME</button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-20 animate-fade-in">
            <h2 className="text-6xl font-black text-rose-500 mb-2 drop-shadow-2xl">GAME OVER</h2>
            <div className="bg-slate-800 rounded-3xl p-8 mb-6 border-4 border-slate-700 shadow-2xl transform scale-110">
              <div className="text-center">
                <span className="text-slate-400 text-sm font-bold block mb-1">FINAL SCORE</span>
                <span className="text-5xl font-black text-emerald-400">{score}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full max-w-[200px]">
              <button
                onClick={(e) => { e.stopPropagation(); resetGame(); }}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={onBack}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
              >
                MENU
              </button>
            </div>
            
            {/* AUTO RETURN TIMER */}
            <AutoReturnTimer onTimerEnd={onBack} seconds={8} />
          </div>
        )}
      </div>

      {/* Touch Controls - Virtual D-Pad for Mobile */}
      <div className="mt-8 flex flex-col items-center gap-4 sm:hidden">
        <p className="text-slate-400 text-xs font-bold">TOUCH CONTROLS</p>
        <div className="grid grid-cols-3 gap-3 w-52 h-52 bg-slate-800/50 rounded-3xl p-4 border border-slate-700">
          {/* Row 1 - Up */}
          <div className="opacity-0"></div>
          <button 
            onClick={(e) => { e.currentTarget.blur(); changeDirection('ArrowUp'); }}
            onTouchStart={(e) => { e.preventDefault(); changeDirection('ArrowUp'); }}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 rounded-2xl flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-lg border-2 border-emerald-500"
          >
            🔼
          </button>
          <div className="opacity-0"></div>
          
          {/* Row 2 - Left, Center, Right */}
          <button 
            onClick={(e) => { e.currentTarget.blur(); changeDirection('ArrowLeft'); }}
            onTouchStart={(e) => { e.preventDefault(); changeDirection('ArrowLeft'); }}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 rounded-2xl flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-lg border-2 border-emerald-500"
          >
            ◀️
          </button>
          <div className="bg-slate-900/50 rounded-2xl flex items-center justify-center text-4xl border-2 border-slate-700">
            🐍
          </div>
          <button 
            onClick={(e) => { e.currentTarget.blur(); changeDirection('ArrowRight'); }}
            onTouchStart={(e) => { e.preventDefault(); changeDirection('ArrowRight'); }}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 rounded-2xl flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-lg border-2 border-emerald-500"
          >
            ▶️
          </button>
          
          {/* Row 3 - Down */}
          <div className="opacity-0"></div>
          <button 
            onClick={(e) => { e.currentTarget.blur(); changeDirection('ArrowDown'); }}
            onTouchStart={(e) => { e.preventDefault(); changeDirection('ArrowDown'); }}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 rounded-2xl flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-lg border-2 border-emerald-500"
          >
            🔽
          </button>
          <div className="opacity-0"></div>
        </div>
      </div>

      {/* Daily Challenge Card */}
      <div className="mt-6 w-full max-w-md px-4">
        <DailyChallengeCard gameId="snake" compact={true} />
      </div>

      <HelpButton game="snake" />
      
      {/* Achievement Popup */}
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
