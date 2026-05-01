import React, { useState, useEffect, useRef } from 'react';
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
/* global confetti */

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const BIRD_SIZE = 34;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -9;
const PIPE_WIDTH = 60;
const BASE_PIPE_GAP = 180;
const BASE_PIPE_SPEED = 2.5; // Smoother pipe movement

const MEDALS = {
  BRONZE: { min: 10, max: 19, icon: '🥉', color: '#CD7F32' },
  SILVER: { min: 20, max: 39, icon: '🥈', color: '#C0C0C0' },
  GOLD: { min: 40, max: 69, icon: '🥇', color: '#FFD700' },
  PLATINUM: { min: 70, max: 99, icon: '💎', color: '#E5E4E2' },
  DIAMOND: { min: 100, max: 999, icon: '👑', color: '#B9F2FF' }
};

const THEMES = {
  DAY: { sky: ['#87CEEB', '#87CEEB'], ground: '#D2691E', pipe: '#059669' },
  SUNSET: { sky: ['#FF6B6B', '#FFA500'], ground: '#8B4513', pipe: '#C2410C' },
  NIGHT: { sky: ['#1a1a2e', '#16213e'], ground: '#2C1810', pipe: '#1e3a8a' }
};

let flappyAudioCtx = null;
const playSound = (type) => {
  try {
    if (!flappyAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) flappyAudioCtx = new AudioContext();
    }
    if (!flappyAudioCtx) return;
    if (flappyAudioCtx.state === 'suspended') flappyAudioCtx.resume();

    const ctx = flappyAudioCtx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const masterVol = typeof window.masterVolume !== 'undefined' ? window.masterVolume : 1.0;

    if (type === 'flap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'score') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'die') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.2 * masterVol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch(e) { }
};

export default function FlappyBird({ onBack, playerName }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [, forceUpdate] = useState({});
  const [currentAchievement, setCurrentAchievement] = useState(null);

  const birdRef = useRef({ y: GAME_HEIGHT / 2, velocity: 0, wingFrame: 0 });
  const pipesRef = useRef([]);
  const frameRef = useRef(0);
  const animationRef = useRef(null);
  const scoreRef = useRef(0);
  const particlesRef = useRef([]);
  const powerUpRef = useRef(null);
  const hasShieldRef = useRef(false);
  const gameStartedRef = useRef(false);
  const gameOverRef = useRef(false);
  const cloudRef = useRef([
    { x: 50, y: 80, size: 60 },
    { x: 200, y: 120, size: 80 },
    { x: 350, y: 60, size: 50 }
  ]);
  
  const { checkAchievements, updateChallenge, updateStats, clearNewAchievements } = useGameProgress('flappybird');

  const getTheme = () => {
    if (score < 30) return THEMES.DAY;
    if (score < 60) return THEMES.SUNSET;
    return THEMES.NIGHT;
  };

  const getDifficulty = () => {
    const level = Math.floor(score / 20);
    return {
      pipeGap: Math.max(140, BASE_PIPE_GAP - level * 10),
      pipeSpeed: Math.min(6, BASE_PIPE_SPEED + level * 0.5)
    };
  };

  const getMedal = (finalScore) => {
    for (const [key, medal] of Object.entries(MEDALS)) {
      if (finalScore >= medal.min && finalScore <= medal.max) {
        return medal;
      }
    }
    return null;
  };

  const createParticles = (x, y, count = 10) => {
    // Limit total particles to prevent performance issues
    if (particlesRef.current.length > 20) {
      particlesRef.current = particlesRef.current.slice(-15);
    }
    
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 15, // Reduced from 20 for faster cleanup
        color: ['#FBBF24', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 3)]
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  const spawnPowerUp = () => {
    if (Math.random() < 0.05 && !powerUpRef.current) {
      const types = ['shield', 'slow', 'double'];
      const type = types[Math.floor(Math.random() * types.length)];
      powerUpRef.current = {
        x: GAME_WIDTH,
        y: Math.random() * (GAME_HEIGHT - 200) + 100,
        type,
        icon: type === 'shield' ? '🛡️' : type === 'slow' ? '⚡' : '💎'
      };
    }
  };

  const jump = () => {
    if (!gameStartedRef.current) {
      setGameStarted(true);
      gameStartedRef.current = true;
      birdRef.current.velocity = JUMP_STRENGTH;
      playSound('flap');
    } else if (!gameOverRef.current) {
      birdRef.current.velocity = JUMP_STRENGTH;
      birdRef.current.wingFrame = 0;
      playSound('flap');
    }
  };

  const resetGame = () => {
    birdRef.current = { y: GAME_HEIGHT / 2, velocity: 0, wingFrame: 0 };
    pipesRef.current = [];
    particlesRef.current = [];
    powerUpRef.current = null;
    frameRef.current = 0;
    scoreRef.current = 0;
    hasShieldRef.current = false;
    gameStartedRef.current = false;
    gameOverRef.current = false;
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  const checkCollision = (bird, pipes) => {
    const COLLISION_MARGIN = 2; // Add small margin to avoid false positives
    const birdLeft = GAME_WIDTH / 2 - BIRD_SIZE / 2 + COLLISION_MARGIN;
    const birdRight = birdLeft + BIRD_SIZE - COLLISION_MARGIN * 2;
    const birdTop = bird.y + COLLISION_MARGIN;
    const birdBottom = bird.y + BIRD_SIZE - COLLISION_MARGIN;

    // Check ground and ceiling collision
    if (birdTop <= 0 || birdBottom >= GAME_HEIGHT - 16) {
      return true;
    }

    // Check pipe collision
    for (let pipe of pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      // Only check collision if bird is within pipe's horizontal range
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + pipe.gap) {
          return true;
        }
      }
    }

    return false;
  };

  useEffect(() => {
    const gameLoop = () => {
      if (!gameStartedRef.current || gameOverRef.current) return;

      frameRef.current++;
      const difficulty = getDifficulty();

      // Update bird
      birdRef.current.velocity += GRAVITY;
      birdRef.current.y += birdRef.current.velocity;
      birdRef.current.wingFrame = (birdRef.current.wingFrame + 0.3) % 3;

      // Update clouds (parallax) - only every 3 frames
      if (frameRef.current % 3 === 0) {
        cloudRef.current.forEach(cloud => {
          cloud.x -= 0.5;
          if (cloud.x < -100) cloud.x = GAME_WIDTH + 50;
        });
      }

      // Spawn pipes
      if (frameRef.current % 90 === 0) {
        const topHeight = Math.random() * (GAME_HEIGHT - difficulty.pipeGap - 150) + 50;
        pipesRef.current.push({
          x: GAME_WIDTH,
          topHeight: topHeight,
          gap: difficulty.pipeGap,
          scored: false
        });
        spawnPowerUp();
      }

      // Update pipes
      const newPipes = [];
      for (let i = 0; i < pipesRef.current.length; i++) {
        const pipe = pipesRef.current[i];
        pipe.x -= difficulty.pipeSpeed;

        if (!pipe.scored && pipe.x + PIPE_WIDTH < GAME_WIDTH / 2) {
          pipe.scored = true;
          scoreRef.current++;
          setScore(scoreRef.current);
          playSound('score');
          playGameSound('score', 0.3);
          
          // Milestone celebration - reduced particles
          if (scoreRef.current % 10 === 0) {
            createParticles(GAME_WIDTH / 2, 100, 5);
          }
        }

        if (pipe.x > -PIPE_WIDTH) {
          newPipes.push(pipe);
        }
      }
      pipesRef.current = newPipes;

      // Update power-up
      if (powerUpRef.current) {
        const powerUp = powerUpRef.current;
        powerUp.x -= difficulty.pipeSpeed;
        
        // Check collection
        const birdX = GAME_WIDTH / 2;
        const dist = Math.sqrt(
          Math.pow(powerUp.x - birdX, 2) + 
          Math.pow(powerUp.y - birdRef.current.y, 2)
        );
        
        if (dist < 30) {
          playSound('powerup');
          createParticles(powerUp.x, powerUp.y, 5);
          
          if (powerUp.type === 'shield') {
            hasShieldRef.current = true;
            setTimeout(() => {
              hasShieldRef.current = false;
              forceUpdate({});
            }, 5000);
          } else if (powerUp.type === 'double') {
            scoreRef.current += 10;
            setScore(scoreRef.current);
          }
          
          powerUpRef.current = null;
        } else if (powerUp.x < -50) {
          powerUpRef.current = null;
        }
      }

      // Update particles - only every 2 frames to reduce overhead
      if (frameRef.current % 2 === 0) {
        particlesRef.current = particlesRef.current
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.3,
            life: p.life - 1
          }))
          .filter(p => p.life > 0);
      }

      // Check collision
      if (checkCollision(birdRef.current, pipesRef.current)) {
        if (hasShieldRef.current) {
          hasShieldRef.current = false;
          createParticles(GAME_WIDTH / 2, birdRef.current.y, 5);
          forceUpdate({});
        } else {
          playSound('die');
          playGameSound('hit', 0.4);
          setTimeout(() => playGameSound('gameOver', 0.5), 200);
          createParticles(GAME_WIDTH / 2, birdRef.current.y, 8);
          gameOverRef.current = true;
          setGameOver(true);
          
          // Update stats & achievements
          updateStats({ gamesPlayed: 1, bestScore: scoreRef.current });
          const unlocked = checkAchievements({ score: scoreRef.current, won: false });
          if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
          updateChallenge(scoreRef.current);
          
          if (scoreRef.current > 0) {
            leaderboardService.submitScore(playerName || 'Guest_Player', 'flappybird', scoreRef.current).catch(console.error);
          }
          return;
        }
      }

      // Force update only every 2 frames for 30 FPS (still smooth, better performance)
      if (frameRef.current % 2 === 0) {
        forceUpdate({});
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameStarted && !gameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const theme = getTheme();
  const medal = getMedal(score);
  const wingRotation = Math.floor(birdRef.current.wingFrame);

  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12">
      <div className="w-full flex justify-between items-center mb-6 px-4 flex-wrap gap-4">
        <button 
          onClick={onBack} 
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold transition-colors"
        >
          ← Back
        </button>
        
        <div className="flex gap-3 flex-wrap items-center justify-center flex-1">
          <GameStats 
            gameId="flappybird" 
            playerName={playerName} 
            currentScore={score}
            isPlaying={gameStarted && !gameOver}
          />
        </div>
      </div>

      <div 
        className="relative rounded-3xl shadow-2xl border-8 border-slate-800 overflow-hidden cursor-pointer"
        style={{ 
          width: GAME_WIDTH, 
          height: GAME_HEIGHT,
          background: `linear-gradient(to bottom, ${theme.sky[0]}, ${theme.sky[1]})`
        }}
        onClick={jump}
      >
        {/* Clouds (Parallax) - optimized without blur */}
        {cloudRef.current.map((cloud, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-30"
            style={{
              left: cloud.x,
              top: cloud.y,
              width: cloud.size,
              height: cloud.size * 0.6
            }}
          />
        ))}

        {/* Stars (Night only) - static for performance */}
        {score >= 60 && (
          <>
            <div className="absolute top-20 left-50 w-2 h-2 bg-white rounded-full opacity-80"></div>
            <div className="absolute top-40 right-80 w-1 h-1 bg-white rounded-full opacity-60"></div>
            <div className="absolute top-100 left-150 w-1.5 h-1.5 bg-white rounded-full opacity-70"></div>
          </>
        )}

        {/* Pipes */}
        {pipesRef.current.map((pipe, idx) => (
          <div key={idx}>
            <div
              className="absolute rounded-b-lg border-4"
              style={{
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.topHeight,
                backgroundColor: theme.pipe,
                borderColor: theme.pipe,
                filter: 'brightness(0.9)'
              }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-8 border-t-4" style={{ backgroundColor: theme.pipe, borderColor: theme.pipe, filter: 'brightness(0.7)' }}></div>
            </div>
            <div
              className="absolute rounded-t-lg border-4"
              style={{
                left: pipe.x,
                top: pipe.topHeight + pipe.gap,
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - pipe.topHeight - pipe.gap,
                backgroundColor: theme.pipe,
                borderColor: theme.pipe,
                filter: 'brightness(0.9)'
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-8 border-b-4" style={{ backgroundColor: theme.pipe, borderColor: theme.pipe, filter: 'brightness(0.7)' }}></div>
            </div>
          </div>
        ))}

        {/* Power-up - optimized without bounce animation */}
        {powerUpRef.current && (
          <div
            className="absolute text-3xl"
            style={{
              left: powerUpRef.current.x - 15,
              top: powerUpRef.current.y - 15,
              filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'
            }}
          >
            {powerUpRef.current.icon}
          </div>
        )}

        {/* Particles - optimized */}
        {particlesRef.current.map((p, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: p.x,
              top: p.y,
              backgroundColor: p.color,
              opacity: p.life / 15
            }}
          />
        ))}

        {/* Bird with wing animation */}
        <div
          className="absolute"
          style={{
            left: GAME_WIDTH / 2 - BIRD_SIZE / 2,
            top: birdRef.current.y,
            width: BIRD_SIZE,
            height: BIRD_SIZE,
            transform: `rotate(${Math.min(Math.max(birdRef.current.velocity * 3, -30), 90)}deg)`,
            transition: 'transform 0.1s',
            filter: hasShieldRef.current ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))' : 'none'
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-amber-400 rounded-full border-4 border-amber-600 shadow-lg"></div>
            {hasShieldRef.current && (
              <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-pulse"></div>
            )}
            <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full border-2 border-slate-800">
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
            </div>
            <div className="absolute top-1/2 -right-2 w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-orange-500 border-b-4 border-b-transparent"></div>
            {/* Wing animation */}
            <div 
              className="absolute top-1/2 left-1 w-4 h-3 bg-amber-500 rounded-full border-2 border-amber-600 transition-transform duration-100"
              style={{
                transform: `translateY(${wingRotation === 0 ? '-2px' : wingRotation === 1 ? '0px' : '2px'})`
              }}
            ></div>
          </div>
        </div>

        {/* Ground - simplified */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-16 border-t-4"
          style={{
            background: theme.ground,
            borderColor: theme.ground,
            filter: 'brightness(0.8)'
          }}
        ></div>

        {/* Shield indicator - optimized */}
        {hasShieldRef.current && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            🛡️ SHIELD
          </div>
        )}

        {/* Difficulty indicator */}
        {score >= 20 && (
          <div className="absolute top-4 right-4 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            LEVEL {Math.floor(score / 20) + 1}
          </div>
        )}

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="text-6xl font-black text-amber-400 mb-4 drop-shadow-2xl animate-bounce">
              FLAPPY BIRD
            </div>
            <div className="bg-amber-500 text-slate-900 px-8 py-3 rounded-full font-black text-xl shadow-xl mb-4">
              TAP TO START
            </div>
            <p className="text-slate-300 text-sm font-bold">Press SPACE or Click to Flap</p>
            <p className="text-slate-400 text-xs mt-2">Collect power-ups for bonuses!</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-30">
            <h2 className="text-6xl font-black text-rose-500 mb-4 drop-shadow-2xl">GAME OVER</h2>
            <div className="bg-slate-800 rounded-2xl p-6 mb-6 border-4 border-slate-700">
              <div className="text-center mb-4">
                <span className="text-slate-400 text-sm block mb-1">SCORE</span>
                <span className="text-4xl font-black text-amber-400">{score}</span>
              </div>
              {medal && (
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">{medal.icon}</div>
                  <div className="text-sm font-bold" style={{ color: medal.color }}>
                    {Object.keys(MEDALS).find(key => MEDALS[key] === medal)} MEDAL
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); resetGame(); }}
              className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xl rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-[0_20px_40px_rgba(251,191,36,0.3)]"
            >
              TRY AGAIN
            </button>
            <button
              onClick={onBack}
              className="mt-4 text-slate-500 font-bold hover:text-slate-300 transition-colors"
            >
              MENU
            </button>
            <AutoReturnTimer onTimerEnd={onBack} seconds={10} />
          </div>
        )}

        {gameStarted && !gameOver && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
            <div className="text-6xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              {score}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-slate-400 font-medium bg-slate-800/50 px-6 py-3 rounded-full border border-slate-700">
          <kbd className="bg-slate-700 px-2 py-1 rounded mx-1 text-slate-200 shadow">SPACE</kbd> 
          or 
          <kbd className="bg-slate-700 px-2 py-1 rounded mx-1 text-slate-200 shadow">CLICK</kbd> 
          to flap!
        </p>
      </div>

      <div className="mt-6 w-full max-w-md px-4">
        <DailyChallengeCard gameId="flappybird" compact={true} />
      </div>

      <HelpButton game="flappybird" />
      
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
