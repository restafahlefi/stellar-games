import React, { useState, useEffect } from 'react';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import AutoReturnTimer from '../components/AutoReturnTimer';
import GameStats from '../components/GameStats';
import { playGameSound } from '../utils/soundEngine';
import HelpButton from '../components/HelpButton';

// Audio Engine Lokal
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
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'select') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'win') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
};

const CHOICES = [
  { id: 'rock', emoji: '✊', beats: 'scissors', color: 'rose' },
  { id: 'paper', emoji: '✋', beats: 'rock', color: 'blue' },
  { id: 'scissors', emoji: '✌️', beats: 'paper', color: 'amber' }
];

const RockPaperScissors = ({ onBack, playerName }) => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [aiChoice, setAiChoice] = useState(null);
  const [result, setResult] = useState('');
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePlay = (id) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setPlayerChoice(id);
    setAiChoice(null);
    setResult('');
    playSound('select');
    playGameSound('click', 0.3);

    // Countdown sounds
    playGameSound('countdown', 0.2);
    setTimeout(() => playGameSound('countdown', 0.2), 500);
    setTimeout(() => playGameSound('countdown', 0.3), 1000);

    setTimeout(() => {
      const ai = CHOICES[Math.floor(Math.random() * 3)];
      setAiChoice(ai.id);

      let res = '';
      if (id === ai.id) {
        res = 'draw';
        playGameSound('draw', 0.3);
      } else if (CHOICES.find(c => c.id === id).beats === ai.id) {
        res = 'win';
        setScores(s => ({ ...s, player: s.player + 1 }));
        playSound('win');
        playGameSound('win', 0.4);
        gameService.recordGamePlay('rps').catch(console.error);
        leaderboardService.submitScore(playerName || 'Guest_Player', 'rps', 500).catch(console.error);
      } else {
        res = 'lose';
        setScores(s => ({ ...s, ai: s.ai + 1 }));
        playGameSound('lose', 0.4);
      }

      setResult(res);
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12 relative">
      <div className="w-full flex justify-between items-center mb-8 px-4 flex-wrap gap-4">
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold">← Back</button>
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-black uppercase">You</span>
            <span className="text-2xl font-black text-blue-400">{scores.player}</span>
          </div>
          <span className="text-slate-700 text-2xl font-black">VS</span>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-black uppercase">AI</span>
            <span className="text-2xl font-black text-rose-500">{scores.ai}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-700 w-full text-center relative overflow-hidden">
        {result && !isAnimating && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6">
            <h2 className={`text-6xl font-black mb-6 uppercase italic tracking-tighter ${result === 'win' ? 'text-emerald-400' : result === 'lose' ? 'text-rose-500' : 'text-blue-400'}`}>
              {result === 'win' ? '🔥 YOU WIN!' : result === 'lose' ? '💀 YOU LOSE' : '🤝 DRAW'}
            </h2>
            <div className="flex flex-col gap-4 w-full max-w-[200px]">
              <button onClick={() => { setPlayerChoice(null); setAiChoice(null); setResult(''); }} className="w-full py-4 bg-indigo-500 text-white font-black text-xl rounded-2xl shadow-xl">NEXT ROUND</button>
              <button onClick={onBack} className="w-full py-3 bg-slate-700 text-white font-bold rounded-xl">MENU</button>
              <AutoReturnTimer onTimerEnd={onBack} seconds={10} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-12">
          {CHOICES.map(c => (
            <button
              key={c.id}
              onClick={() => handlePlay(c.id)}
              disabled={isAnimating}
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
            {aiChoice ? CHOICES.find(c => c.id === aiChoice).emoji : '❓'}
          </div>
        </div>
      </div>

      <HelpButton game="rps" />
    </div>
  );
};

export default RockPaperScissors;
