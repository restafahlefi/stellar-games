import React, { useState, useEffect, useCallback } from 'react';
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

// Audio Engine Lokal
let memAudioCtx = null;
const playSound = (type) => {
  try {
    if (!memAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) memAudioCtx = new AudioContext();
    }
    if (!memAudioCtx) return;
    if (memAudioCtx.state === 'suspended') memAudioCtx.resume();
    const ctx = memAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'flip') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'match') {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
};

const EMOJIS = ['🎮', '🕹️', '👾', '🚀', '💎', '⭐', '🔥', '🌈', '👻', '⚡', '🤖', '🧩'];

const MemoryMatch = ({ onBack, playerName }) => {
  const [difficulty, setDifficulty] = useState(null);
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  
  const { checkAchievements, updateChallenge, updateStats, clearNewAchievements } = useGameProgress('memory');

  const startGame = (diff) => {
    const numPairs = diff === 'hard' ? 12 : diff === 'medium' ? 8 : 6;
    const selectedEmojis = EMOJIS.slice(0, numPairs);
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));

    setCards(deck);
    setDifficulty(diff);
    setMatchedIndices([]);
    setFlippedIndices([]);
    setMoves(0);
    setIsPlaying(true);
    setIsLocked(false);
  };

  const handleCardClick = (index) => {
    if (isLocked || flippedIndices.includes(index) || matchedIndices.includes(index)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    playSound('flip');

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);
      const [first, second] = newFlipped;

      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setMatchedIndices(prev => [...prev, first, second]);
          setFlippedIndices([]);
          setIsLocked(false);
          playSound('match');
          playGameSound('score', 0.3);
        }, 500);
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
          playGameSound('wrong', 0.3);
        }, 1000);
      }
    }
  };

  const isWon = isPlaying && matchedIndices.length === cards.length && cards.length > 0;

  useEffect(() => {
    if (isWon) {
      setIsPlaying(false);
      confetti();
      playGameSound('complete', 0.5);
      setTimeout(() => playGameSound('win', 0.4), 300);
      
      // Update stats & achievements
      updateStats({ gamesPlayed: 1, wins: 1, bestScore: moves });
      const unlocked = checkAchievements({ score: moves, won: true, difficulty });
      if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
      updateChallenge(moves);
      
      gameService.recordGamePlay('memory').catch(console.error);
      leaderboardService.submitScore(playerName || 'Guest_Player', 'memory', moves).catch(console.error);
    }
  }, [isWon, moves, playerName, difficulty, checkAchievements, updateChallenge, updateStats]);

  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12 relative">
      <HelpButton game="memory" />
      
      {isWon && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center rounded-3xl">
          <h2 className="text-6xl font-black text-emerald-400 mb-2 drop-shadow-2xl">VICTORY!</h2>
          <p className="text-slate-400 mb-8 font-bold">Total Moves: <span className="text-white text-3xl">{moves}</span></p>
          <div className="flex flex-col gap-4 w-full max-w-[200px]">
            <button onClick={() => startGame(difficulty)} className="w-full py-4 bg-emerald-500 text-slate-900 font-black text-xl rounded-2xl shadow-xl">PLAY AGAIN</button>
            <button onClick={onBack} className="w-full py-3 bg-slate-700 text-white font-bold rounded-xl">MENU</button>
            <AutoReturnTimer onTimerEnd={onBack} seconds={10} />
          </div>
        </div>
      )}

      {!difficulty ? (
        <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-700 text-center max-w-md w-full">
          <button
            onClick={onBack}
            className="absolute top-4 left-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-medium transition-colors"
          >
            ← Kembali
          </button>
          <h2 className="text-4xl font-black text-white mb-2">MEMORY MATCH</h2>
          <p className="text-slate-400 mb-8 font-bold">Pilih Tingkat Kesulitan</p>
          <div className="space-y-4">
            {['easy', 'medium', 'hard'].map(d => (
              <button
                key={d}
                onClick={() => startGame(d)}
                className={`w-full py-4 rounded-2xl font-black text-xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg ${d === 'easy' ? 'bg-emerald-500 text-slate-900' : d === 'medium' ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="w-full flex justify-between items-center mb-8 px-4 flex-wrap gap-4">
            <button onClick={onBack} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition-colors">← Kembali</button>
            
            <div className="flex gap-3 flex-wrap items-center justify-center flex-1">
              <GameStats 
                gameId="memory" 
                playerName={playerName} 
                currentScore={moves}
                isPlaying={isPlaying}
              />
            </div>
          </div>

          <div className={`grid gap-3 ${difficulty === 'hard' ? 'grid-cols-6' : difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-4'}`}>
            {cards.map((card, i) => (
              <button
                key={i}
                onClick={() => handleCardClick(i)}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-4xl flex items-center justify-center transition-all duration-500 transform ${flippedIndices.includes(i) || matchedIndices.includes(i) ? 'bg-slate-700 rotate-y-180' : 'bg-slate-800 hover:bg-slate-700 shadow-xl'}`}
              >
                {(flippedIndices.includes(i) || matchedIndices.includes(i)) ? card.emoji : '❓'}
              </button>
            ))}
          </div>
          
          <div className="mt-6 w-full max-w-md px-4">
            <DailyChallengeCard gameId="memory" compact={true} />
          </div>
        </>
      )}
      
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
};

export default MemoryMatch;
