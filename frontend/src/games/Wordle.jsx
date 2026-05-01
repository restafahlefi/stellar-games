import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import AutoReturnTimer from '../components/AutoReturnTimer';
import GameStats from '../components/GameStats';
import HelpButton from '../components/HelpButton';
import AchievementPopup from '../components/AchievementPopup';
import DailyChallengeCard from '../components/DailyChallengeCard';
import WordleGuide from '../components/WordleGuide';
import { useGameProgress } from '../hooks/useGameProgress';

// Sound Engine
let wordleAudioCtx = null;
const playSound = (type) => {
  try {
    if (!wordleAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) wordleAudioCtx = new AudioContext();
    }
    if (!wordleAudioCtx) return;
    if (wordleAudioCtx.state === 'suspended') wordleAudioCtx.resume();

    const ctx = wordleAudioCtx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const masterVol = typeof window.masterVolume !== 'undefined' ? window.masterVolume : 1.0;

    if (type === 'type') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.02 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'reveal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.2 * masterVol, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.15 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch(e) { }
};

const VALID_ANSWERS = [
  "APPLE", "BEACH", "BRAIN", "BREAD", "BRICK", "CHAIR", "CHART", "CHASE", "CHEST", "CHIEF",
  "CHILD", "CLOCK", "CLOUD", "DANCE", "DREAM", "EAGLE", "EARTH", "FAITH", "FIELD", "FLAME",
  "GLASS", "GHOST", "GRAPE", "GRASS", "HEART", "HOUSE", "IMAGE", "JUICE", "LIGHT", "LEMON",
  "MAGIC", "MONEY", "MUSIC", "NIGHT", "OCEAN", "PAPER", "PEACE", "PIZZA", "PLANT", "POWER",
  "PRIDE", "QUEEN", "RIVER", "SMART", "SNAKE", "SPACE", "STEEL", "STONE", "STORM", "SUGAR",
  "TABLE", "TRAIN", "TRUST", "TRUTH", "VOICE", "WATER", "WHEEL", "WORLD", "YOUTH", "ZEBRA"
];

const ALLOWED_GUESSES = new Set([
  ...VALID_ANSWERS,
  "ABOVE", "ACUTE", "ADULT", "AFTER", "AGAIN", "ALIVE", "ALONE", "ALONG", "AMONG", "ANGRY",
  "ANIMAL", "APPLY", "ARGUE", "ARISE", "ARRAY", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID",
  "AWARD", "AWARE", "AWFUL", "BASIC", "BASIS", "BEACH", "BEGIN", "BELOW", "BIRTH", "BLACK",
  "BLAME", "BLIND", "BLOCK", "BLOOD", "BOARD", "BOOST", "BOUND", "BRAIN", "BRAND", "BREAD",
  "BREAK", "BRIEF", "BRING", "BROAD", "BUILD", "BUILT", "BUYER", "CABLE", "CALIF", "CARRY",
  "CAUSE", "CHAIN", "CHAIR", "CHART", "CHECK", "CHEST", "CHIEF", "CHILD", "CHINA", "CHOSE",
  "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLOCK", "CLOSE", "COACH", "COAST",
  "COUNT", "COURT", "COVER", "CRAFT", "CRASH", "CREAM", "CRIME", "CROSS", "CROWD", "CROWN",
  "CURVE", "CYCLE", "DAILY", "DANCE", "DEATH", "DELAY", "DEPTH", "DIRTY", "DOING", "DOUBT",
  "DRAFT", "DRAMA", "DREAM", "DRESS", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY",
  "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR",
  "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FIBER", "FIELD",
  "FIFTH", "FIFTY", "FINAL", "FIRST", "FIXED", "FLASH", "FLEET", "FLOOR", "FLUID", "FOCUS",
  "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK", "FRAUD", "FRESH", "FRONT",
  "FRUIT", "FULLY", "FUNNY", "GIANT", "GIVEN", "GLASS", "GLOBE", "GOING", "GRACE", "GRADE",
  "GRAND", "GRANT", "GRASS", "GREAT", "GREEN", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS",
  "GUEST", "GUIDE", "HAPPY", "HEART", "HEAVY", "HENCE", "HENRY", "HORSE", "HOTEL", "HOUSE",
  "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", "ISSUE", "ITALY", "JAPAN", "JOINT",
  "JONES", "JUDGE", "KNOWN", "LABEL", "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN",
  "LEASE", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LIGHT", "LIMIT", "LINUX", "LIVES", "LOCAL",
  "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYING", "MAGIC", "MAJOR", "MAKER", "MARCH",
  "MARIA", "MATCH", "MAYBE", "MAYOR", "MEANT", "MEDIA", "METAL", "MIGHT", "MINOR", "MINUS",
  "MIXED", "MODEL", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE",
  "MUSIC", "NEEDS", "NEVER", "NEWLY", "NIGHT", "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE",
  "OCCUR", "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER", "OUGHT", "PAINT", "PANEL", "PAPER",
  "PARTY", "PEACE", "PETER", "PHASE", "PHONE", "PHOTO", "PIECE", "PILOT", "PITCH", "PLACE",
  "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE",
  "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", "PROVE", "QUEEN", "QUICK", "QUIET",
  "QUITE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "READY", "REFER", "RIGHT",
  "RIVAL", "RIVER", "ROBIN", "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SCALE", "SCENE",
  "SCOPE", "SCORE", "SENSE", "SERVE", "SEVEN", "SHALL", "SHAPE", "SHARE", "SHARP", "SHEET",
  "SHELF", "SHELL", "SHIFT", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOWN", "SIGHT", "SINCE",
  "SIXTH", "SIXTY", "SIZED", "SKILL", "SLEEP", "SLIDE", "SMALL", "SMART", "SMILE", "SMITH",
  "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED",
  "SPEND", "SPENT", "SPLIT", "SPOKE", "SPORT", "STAFF", "STAGE", "STAKE", "STAND", "START",
  "STATE", "STEAM", "STEEL", "STICK", "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM",
  "STORY", "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET",
  "TABLE", "TAKEN", "TASTE", "TAXES", "TEACH", "TEETH", "TEXAS", "THANK", "THEFT", "THEIR",
  "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW",
  "THROW", "TIGHT", "TIMES", "TITLE", "TODAY", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER",
  "TRACK", "TRADE", "TRAIN", "TREAT", "TREND", "TRIAL", "TRIED", "TRIES", "TRUCK", "TRULY",
  "TRUST", "TRUTH", "TWICE", "UNDER", "UNDUE", "UNION", "UNITY", "UNTIL", "UPPER", "UPSET",
  "URBAN", "USAGE", "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOICE",
  "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE",
  "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST", "WORTH", "WRITE", "WRONG", "WROTE",
  "YIELD", "YOUNG", "YOUTH"
]);

const ROWS = 6;
const COLS = 5;
const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','DEL']
];

export default function Wordle({ onBack, playerName }) {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState(Array(ROWS).fill(""));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  
  const { checkAchievements, updateChallenge, updateStats, clearNewAchievements } = useGameProgress('wordle');

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setTargetWord(VALID_ANSWERS[Math.floor(Math.random() * VALID_ANSWERS.length)]);
    setGuesses(Array(ROWS).fill(""));
    setCurrentRow(0);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
    setErrorMessage("");
  };

  const handleKeyPress = (key) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== COLS) {
        showError("NOT ENOUGH LETTERS");
        return;
      }
      
      if (!ALLOWED_GUESSES.has(currentGuess)) {
        showError("NOT IN WORD LIST");
        return;
      }
      
      const newGuesses = [...guesses];
      newGuesses[currentRow] = currentGuess;
      setGuesses(newGuesses);
      
      currentGuess.split('').forEach((_, i) => {
        setTimeout(() => playSound('reveal'), i * 300);
      });

      if (currentGuess === targetWord) {
        setTimeout(() => {
          setWon(true);
          setGameOver(true);
          playSound('win');
          confetti();
          
          // Update stats & achievements
          const attempts = currentRow + 1;
          updateStats({ gamesPlayed: 1, wins: 1, bestScore: attempts });
          const unlocked = checkAchievements({ won: true, attempts, firstTry: attempts === 1 });
          if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
          updateChallenge(attempts);
          
          gameService.recordGamePlay('wordle').catch(console.error);
          leaderboardService.submitScore(playerName || 'Guest_Player', 'wordle', 100).catch(console.error);
        }, 1500);
      } else if (currentRow === ROWS - 1) {
        setTimeout(() => {
          setGameOver(true);
          updateStats({ gamesPlayed: 1, losses: 1 });
        }, 1500);
      } else {
        setCurrentRow(prev => prev + 1);
        setCurrentGuess("");
      }
    } else if (key === 'DEL') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < COLS && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
      playSound('type');
    }
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setErrorShake(true);
    playSound('error');
    setTimeout(() => {
      setErrorMessage("");
      setErrorShake(false);
    }, 2000);
  };

  const getLetterColor = (letter, index, guess) => {
    if (targetWord[index] === letter) return 'bg-emerald-500 border-emerald-600';
    if (targetWord.includes(letter)) return 'bg-amber-500 border-amber-600';
    return 'bg-slate-700 border-slate-800';
  };

  const getKeyColor = (key) => {
    let color = 'bg-slate-800';
    guesses.forEach(guess => {
      if (!guess) return;
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          if (targetWord[i] === key) color = 'bg-emerald-500';
          else if (targetWord.includes(key) && color !== 'bg-emerald-500') color = 'bg-amber-500';
          else if (color !== 'bg-emerald-500' && color !== 'bg-amber-500') color = 'bg-slate-600';
        }
      }
    });
    return color;
  };

  return (
    <div className="game-container flex flex-col items-center h-full animate-fade-in py-4 select-none">
      <div className="w-full flex justify-between items-center mb-8 px-4 max-w-4xl flex-wrap gap-4">
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold">← Back</button>
        
        <div className="flex gap-3 flex-wrap items-center justify-center flex-1">
          <GameStats 
            gameId="wordle" 
            playerName={playerName} 
            currentScore={guesses.length}
            isPlaying={!gameOver && !won}
          />
          
          {/* Panduan Button */}
          <button 
            onClick={() => setShowGuide(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
          >
            📖 Panduan
          </button>
        </div>
        
        <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-black uppercase">Wordle</span>
            <span className="text-xl font-black text-white">CHALLENGE</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md relative">
        {errorMessage && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 bg-rose-500 text-white px-6 py-2 rounded-xl font-black text-xs shadow-2xl z-50 animate-bounce">
                {errorMessage}
            </div>
        )}

        <div className={`grid grid-rows-6 gap-2 mb-10 ${errorShake ? 'animate-shake' : ''}`}>
          {guesses.map((guess, i) => (
            <div key={i} className="flex gap-2">
              {Array(COLS).fill(0).map((_, j) => {
                const letter = i === currentRow ? currentGuess[j] : guess[j];
                const isRevealed = i < currentRow || gameOver;
                const colorClass = isRevealed && guess ? getLetterColor(letter, j, guess) : (letter ? 'border-slate-500 bg-slate-900' : 'border-slate-800 bg-slate-900');
                
                return (
                  <div 
                    key={j} 
                    className={`w-12 h-12 sm:w-14 sm:h-14 border-2 rounded-xl flex items-center justify-center text-2xl font-black transition-all duration-500 ${colorClass} ${letter ? 'scale-105' : ''}`}
                    style={{ transitionDelay: isRevealed ? `${j * 100}ms` : '0ms' }}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {(gameOver || won) && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center rounded-3xl border-4 border-slate-700/50">
            <h2 className={`text-5xl font-black mb-6 drop-shadow-2xl ${won ? 'text-emerald-400' : 'text-rose-500'}`}>
              {won ? '🏆 EXCELLENT!' : '📝 WORD REVEALED'}
            </h2>
            <div className="bg-slate-800 rounded-2xl p-8 mb-8 border-2 border-slate-700">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">The word was</p>
              <p className="text-4xl font-black text-white tracking-[0.2em]">{targetWord}</p>
            </div>
            
            <div className="flex flex-col gap-4 w-full max-w-[220px]">
              <button onClick={startNewGame} className="w-full py-4 bg-indigo-500 text-white font-black text-xl rounded-2xl shadow-xl">PLAY AGAIN</button>
              <button onClick={onBack} className="w-full py-3 bg-slate-700 text-white font-bold rounded-xl">MENU</button>
              <AutoReturnTimer onTimerEnd={onBack} seconds={12} />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          {KEYBOARD_ROWS.map((row, i) => (
            <div key={i} className="flex justify-center gap-1.5">
              {row.map(key => {
                const isAction = key === 'ENTER' || key === 'DEL';
                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className={`${isAction ? 'px-4' : 'flex-1 max-w-[40px]'} h-14 rounded-xl font-black text-xs sm:text-sm transition-all active:scale-90 ${isAction ? 'bg-slate-700' : getKeyColor(key)} border-b-4 border-black/20`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 w-full max-w-md px-4">
        <DailyChallengeCard gameId="wordle" compact={true} />
      </div>

      <HelpButton game="wordle" />
      
      {currentAchievement && (
        <AchievementPopup 
          achievement={currentAchievement} 
          onClose={() => {
            setCurrentAchievement(null);
            clearNewAchievements();
          }} 
        />
      )}
      
      {/* Wordle Guide */}
      {showGuide && (
        <WordleGuide 
          onClose={() => setShowGuide(false)}
          onStart={() => {
            setShowGuide(false);
            startNewGame();
          }}
        />
      )}
    </div>
  );
}
