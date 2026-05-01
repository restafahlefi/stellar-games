import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import AutoReturnTimer from '../components/AutoReturnTimer';
import GameStats from '../components/GameStats';
import HelpButton from '../components/HelpButton';
import AchievementPopup from '../components/AchievementPopup';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { useGameProgress } from '../hooks/useGameProgress';
import { playGameSound } from '../utils/soundEngine';
/* global confetti */

const COLORS = ['green', 'red', 'yellow', 'blue'];

const SOUNDS = {
  green: { freq: 329.6, type: 'sine' },  // E4
  red: { freq: 261.6, type: 'sine' },    // C4
  yellow: { freq: 392.0, type: 'sine' }, // G4
  blue: { freq: 196.0, type: 'sine' },   // G3
  error: { freq: 100, type: 'sawtooth' }
};

let simonAudioCtx = null;
const playTone = (color) => {
  try {
    if (!simonAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) simonAudioCtx = new AudioContext();
    }
    if (!simonAudioCtx) return;
    if (simonAudioCtx.state === 'suspended') simonAudioCtx.resume();

    const ctx = simonAudioCtx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const masterVol = typeof window.masterVolume !== 'undefined' ? window.masterVolume : 1.0;

    const freqs = { green: 300, red: 400, yellow: 500, blue: 600, error: 100 };
    osc.frequency.setValueAtTime(freqs[color] || 440, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1 * masterVol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
};

const resumeAudio = () => {
  if (simonAudioCtx && simonAudioCtx.state === 'suspended') {
    simonAudioCtx.resume();
  }
};

export default function SimonSays({ onBack, playerName }) {
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  
  const { checkAchievements, updateChallenge, updateStats, clearNewAchievements } = useGameProgress('simonsays');

  const addStep = () => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSequence(prev => [...prev, nextColor]);
  };

  const startGame = () => {
    resumeAudio();
    setSequence([]);
    setPlayerSeq([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setGameStarted(true);
    setTimeout(() => addStep(), 500);
  };

  useEffect(() => {
    if (isPlaying && sequence.length > 0 && !isPlayerTurn) {
      let i = 0;
      const interval = setInterval(() => {
        const color = sequence[i];
        setActiveColor(color);
        playTone(color);
        setTimeout(() => setActiveColor(null), 400);
        i++;
        if (i >= sequence.length) {
          clearInterval(interval);
          setTimeout(() => setIsPlayerTurn(true), 500);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [sequence, isPlaying, isPlayerTurn]);

  const handleColorClick = (color) => {
    resumeAudio();
    if (!isPlayerTurn || gameOver) return;

    setActiveColor(color);
    playTone(color);
    setTimeout(() => setActiveColor(null), 200);

    const newPlayerSeq = [...playerSeq, color];
    setPlayerSeq(newPlayerSeq);

    const currentIndex = newPlayerSeq.length - 1;
    if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      playTone('error');
      playGameSound('wrong', 0.4);
      setTimeout(() => playGameSound('gameOver', 0.5), 200);
      setGameOver(true);
      setIsPlaying(false);
      setIsPlayerTurn(false);
      
      // Update stats & achievements
      const currentScore = score;
      updateStats({ gamesPlayed: 1, bestScore: currentScore });
      const unlocked = checkAchievements({ score: currentScore, won: false });
      if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
      updateChallenge(currentScore);
      
      gameService.recordGamePlay('simonsays').catch(console.error);
      if (currentScore > 0) {
        leaderboardService.submitScore(playerName || 'Guest_Player', 'simonsays', currentScore).catch(console.error);
      }
      
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      playGameSound('levelUp', 0.3);
      setScore(sequence.length);
      setIsPlayerTurn(false);
      setPlayerSeq([]);
      setTimeout(addStep, 1000);
    }
  };

  const resetGame = () => {
    setSequence([]);
    setPlayerSeq([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(false);
    setGameStarted(false);
    setIsPlayerTurn(false);
  };

  // Prevent accidental back navigation during gameplay
  const handleBack = () => {
    if (isPlaying && !gameOver) {
      const confirmExit = window.confirm('Game is in progress. Are you sure you want to exit?');
      if (confirmExit) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12 relative">
      
      {gameOver && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-3xl border-4 border-slate-700/50 p-6 text-center">
            <h2 className="text-5xl font-black text-rose-500 mb-2 drop-shadow-xl">GAME OVER</h2>
            <p className="text-slate-400 mb-6 font-bold">Sequence Reached: <span className="text-white text-2xl">{score}</span></p>
            
            <div className="flex flex-col gap-4 w-full max-w-[200px]">
              <button 
                onClick={startGame}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black text-xl rounded-2xl transition-all shadow-lg"
              >
                TRY AGAIN
              </button>
              <button
                onClick={handleBack}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
              >
                MENU
              </button>
              <AutoReturnTimer onTimerEnd={handleBack} seconds={15} />
            </div>
          </div>
        )}

      <div className="w-full flex justify-between items-center mb-8 px-4 flex-wrap gap-4">
        <button onClick={handleBack} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors font-bold">← Back</button>
        
        <div className="flex gap-3 flex-wrap items-center justify-center flex-1">
          <GameStats 
            gameId="simonsays" 
            playerName={playerName} 
            currentScore={score}
            isPlaying={isPlaying && !gameOver}
          />
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-4xl font-black text-white tracking-widest drop-shadow-md">SIMON SAYS</h2>
      </div>

      <div className="bg-slate-900 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_5px_15px_rgba(255,255,255,0.1)] border-[16px] border-slate-800 flex items-center justify-center relative p-2"
           style={{ width: '360px', height: '360px' }}>
        
        <div className="absolute inset-3 grid grid-cols-2 grid-rows-2 gap-4 rounded-full overflow-hidden p-2">
          <button 
            onClick={() => handleColorClick('green')}
            className={`rounded-tl-full transition-all duration-100 cursor-pointer shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] 
              ${activeColor === 'green' ? 'bg-emerald-400 opacity-100 shadow-[0_0_40px_rgba(52,211,153,1),inset_0_0_20px_rgba(255,255,255,0.5)] scale-100 z-10' : 'bg-emerald-600 opacity-60 scale-[0.98]'}`}
          />
          <button 
            onClick={() => handleColorClick('red')}
            className={`rounded-tr-full transition-all duration-100 cursor-pointer shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] 
              ${activeColor === 'red' ? 'bg-rose-400 opacity-100 shadow-[0_0_40px_rgba(244,63,94,1),inset_0_0_20px_rgba(255,255,255,0.5)] scale-100 z-10' : 'bg-rose-600 opacity-60 scale-[0.98]'}`}
          />
          <button 
            onClick={() => handleColorClick('yellow')}
            className={`rounded-bl-full transition-all duration-100 cursor-pointer shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] 
              ${activeColor === 'yellow' ? 'bg-amber-300 opacity-100 shadow-[0_0_40px_rgba(251,191,36,1),inset_0_0_20px_rgba(255,255,255,0.5)] scale-100 z-10' : 'bg-amber-500 opacity-60 scale-[0.98]'}`}
          />
          <button 
            onClick={() => handleColorClick('blue')}
            className={`rounded-br-full transition-all duration-100 cursor-pointer shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] 
              ${activeColor === 'blue' ? 'bg-blue-400 opacity-100 shadow-[0_0_40px_rgba(96,165,250,1),inset_0_0_20px_rgba(255,255,255,0.5)] scale-100 z-10' : 'bg-blue-600 opacity-60 scale-[0.98]'}`}
          />
        </div>

        <div className="w-36 h-36 bg-slate-800 rounded-full border-8 border-slate-900 shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-20 flex flex-col items-center justify-center overflow-hidden">
          {!isPlaying && !gameOver ? (
            <button onClick={startGame} className="w-full h-full text-slate-300 font-black tracking-wider hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors">START</button>
          ) : gameOver ? (
            <button onClick={startGame} className="w-full h-full text-rose-500 font-black tracking-wider bg-rose-950/20 hover:bg-rose-900/40 transition-colors">
              <span className="block mb-1">FAIL</span>
              <span className="text-xs text-slate-400 block font-normal">Score: {score}</span>
              <span className="text-xs mt-1 block">RESTART</span>
            </button>
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col bg-slate-900">
              <div className="text-3xl font-mono text-rose-500 tracking-widest drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]">
                {score.toString().padStart(2, '0')}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 h-10 flex items-center justify-center bg-slate-800/80 px-8 py-2 rounded-full border border-slate-700 shadow-lg">
        {!isPlaying && !gameOver && <span className="text-slate-400 font-medium">Click START to memorize the pattern</span>}
        {isPlaying && !isPlayerTurn && (
          <span className="text-blue-400 font-bold flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div> Watch the sequence...
          </span>
        )}
        {isPlaying && isPlayerTurn && (
          <span className="text-emerald-400 font-bold flex items-center gap-2 tracking-widest uppercase">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div> Your Turn
          </span>
        )}
        {gameOver && <span className="text-rose-500 font-bold animate-pulse">Game Over! You reached sequence {score}.</span>}
      </div>

      <div className="mt-6 w-full max-w-md px-4">
        <DailyChallengeCard gameId="simonsays" compact={true} />
      </div>

      <HelpButton game="simon" />
      
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
