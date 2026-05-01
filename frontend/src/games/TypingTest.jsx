import React, { useState, useEffect, useRef } from 'react';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import AutoReturnTimer from '../components/AutoReturnTimer';
import GameStats from '../components/GameStats';
import { playGameSound } from '../utils/soundEngine';
import HelpButton from '../components/HelpButton';
import AchievementPopup from '../components/AchievementPopup';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { useGameProgress } from '../hooks/useGameProgress';

// Audio Engine Lokal
let typeAudioCtx = null;
const playSound = (type) => {
  try {
    if (!typeAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) typeAudioCtx = new AudioContext();
    }
    if (!typeAudioCtx) return;
    if (typeAudioCtx.state === 'suspended') typeAudioCtx.resume();
    const ctx = typeAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'key') {
      osc.frequency.setValueAtTime(400 + Math.random() * 100, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
      osc.start(); osc.stop(ctx.currentTime + 0.03);
    }
  } catch (e) {}
};

const TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Programming is the art of algorithm design and problem solving.",
  "Stellar Arcade is the ultimate destination for premium browser gaming.",
  "Reflexes and speed are key to mastering these classic challenges.",
  "Type as fast as you can to climb the global leaderboard ranks."
];

const TypingTest = ({ onBack, playerName }) => {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  const { checkAchievements, updateChallenge, updateStats, clearNewAchievements } = useGameProgress('typing');

  useEffect(() => {
    setText(TEXTS[Math.floor(Math.random() * TEXTS.length)]);
  }, []);

  const keyCountRef = useRef(0);
  
  const handleInput = (e) => {
    if (isFinished) return;
    const val = e.target.value;
    if (!startTime) setStartTime(Date.now());
    
    setInput(val);
    
    // Play key sound for every keystroke
    playSound('key');
    
    // Error sound for wrong character
    if (val.length > 0 && val[val.length - 1] !== text[val.length - 1]) {
      playGameSound('error', 0.15);
    }
    
    let correct = 0;
    for(let i=0; i<val.length; i++) {
        if(val[i] === text[i]) correct++;
    }
    setAccuracy(val.length > 0 ? Math.round((correct / val.length) * 100) : 100);

    if (val.length >= text.length) {
      setIsFinished(true);
      playGameSound('complete', 0.5);
      const elapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60;
      const finalWpm = Math.round((text.length / 5) / elapsed);
      setWpm(finalWpm);
      
      // Update stats & achievements
      updateStats({ gamesPlayed: 1, bestScore: finalWpm });
      const unlocked = checkAchievements({ wpm: finalWpm, accuracy, perfect: accuracy === 100 });
      if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
      updateChallenge(finalWpm);
      
      gameService.recordGamePlay('typing').catch(console.error);
      leaderboardService.submitScore(playerName || 'Guest_Player', 'typing', finalWpm).catch(console.error);
    }
  };

  const reset = () => {
    setText(TEXTS[Math.floor(Math.random() * TEXTS.length)]);
    setInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
  };

  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12 relative">
      {isFinished && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center rounded-3xl">
          <h2 className="text-6xl font-black text-cyan-400 mb-2 drop-shadow-2xl">RESULT</h2>
          <div className="flex gap-8 mb-8">
            <div className="text-center">
                <span className="text-slate-500 text-[10px] font-black uppercase">Speed</span>
                <p className="text-4xl font-black text-white">{wpm} <span className="text-xs">WPM</span></p>
            </div>
            <div className="text-center">
                <span className="text-slate-500 text-[10px] font-black uppercase">Accuracy</span>
                <p className="text-4xl font-black text-white">{accuracy}%</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full max-w-[200px]">
            <button onClick={reset} className="w-full py-4 bg-cyan-500 text-slate-900 font-black text-xl rounded-2xl shadow-xl">RETRY</button>
            <button onClick={onBack} className="w-full py-3 bg-slate-700 text-white font-bold rounded-xl">MENU</button>
            <AutoReturnTimer onTimerEnd={onBack} seconds={12} />
          </div>
        </div>
      )}

      <div className="w-full flex justify-between items-center mb-8 px-4 flex-wrap gap-4">
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold">← Back</button>
        
        <div className="flex gap-3 flex-wrap items-center justify-center flex-1">
          <GameStats 
            gameId="typing" 
            playerName={playerName} 
            currentScore={wpm}
            isPlaying={!isFinished && input.length > 0}
          />
        </div>
      </div>

      <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-700 w-full relative">
        <div className="mb-8 p-6 bg-slate-900 rounded-2xl text-2xl font-mono leading-relaxed select-none">
            {text.split('').map((char, i) => (
                <span key={i} className={i < input.length ? (input[i] === char ? 'text-white' : 'text-rose-500 underline') : 'text-slate-600'}>
                    {char}
                </span>
            ))}
        </div>

        <textarea
          autoFocus
          value={input}
          onChange={handleInput}
          className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 text-xl font-mono text-cyan-400 focus:border-cyan-500 focus:outline-none transition-all resize-none h-32"
          placeholder="Mulai mengetik di sini..."
        />
      </div>

      <div className="mt-6 w-full max-w-md px-4">
        <DailyChallengeCard gameId="typing" compact={true} />
      </div>

      <HelpButton game="typing" />
      
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

export default TypingTest;
