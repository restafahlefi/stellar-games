import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import AutoReturnTimer from '../components/AutoReturnTimer';
import GameStats from '../components/GameStats';
import HelpButton from '../components/HelpButton';
import AchievementPopup from '../components/AchievementPopup';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { useGameProgress } from '../hooks/useGameProgress';
/* global confetti */

const CELL_SIZE = 20;
const GRID_WIDTH = 19;
const GRID_HEIGHT = 21;
const GAME_SPEED = 100;
const FRIGHTENED_SPEED = 140;
const COMBO_TIMEOUT = 500;
const DOTS_BEFORE_FRUIT = 70;

// Multiple maze layouts for level progression
const MAZES = [
  // Level 1 - Classic
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
    [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
    [1,1,1,1,2,1,0,1,1,4,1,1,0,1,2,1,1,1,1],
    [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
    [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
    [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
    [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
    [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // Level 2 - More complex
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,3,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,1,1,2,1,1,1,1,0,1,0,1,1,1,1,2,1,1,1],
    [0,0,0,2,2,2,0,0,0,0,0,0,0,2,2,2,0,0,0],
    [1,1,1,2,1,0,0,1,1,4,1,1,0,0,1,2,1,1,1],
    [0,0,0,2,1,0,0,1,0,0,0,1,0,0,1,2,0,0,0],
    [1,1,1,2,1,0,0,1,1,1,1,1,0,0,1,2,1,1,1],
    [0,0,0,2,2,2,0,0,0,0,0,0,0,2,2,2,0,0,0],
    [1,1,1,2,1,1,1,1,0,1,0,1,1,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,2,1],
    [1,3,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,3,1],
    [1,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // Level 3 - Advanced
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,1,1,2,1,2,1,2,1,2,1,1,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1],
    [0,0,0,1,2,2,2,0,0,0,0,0,2,2,2,1,0,0,0],
    [1,1,1,1,2,1,0,1,1,4,1,1,0,1,2,1,1,1,1],
    [0,0,0,0,2,1,0,1,0,0,0,1,0,1,2,0,0,0,0],
    [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
    [0,0,0,1,2,2,2,0,0,0,0,0,2,2,2,1,0,0,0],
    [1,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,2,1],
    [1,3,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,3,1],
    [1,2,1,1,1,1,2,1,2,1,2,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ]
];

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const GHOST_COLORS = {
  blinky: '#FF0000',
  pinky: '#FFB8FF',
  inky: '#00FFFF',
  clyde: '#FFB852'
};

const FRUITS = [
  { icon: '🍒', points: 100, name: 'Cherry' },
  { icon: '🍓', points: 300, name: 'Strawberry' },
  { icon: '🍊', points: 500, name: 'Orange' },
  { icon: '🍎', points: 700, name: 'Apple' },
  { icon: '🍈', points: 1000, name: 'Melon' },
  { icon: '🍌', points: 2000, name: 'Banana' },
  { icon: '🔔', points: 3000, name: 'Bell' },
  { icon: '🔑', points: 5000, name: 'Key' }
];

const GHOST_MODES = {
  SCATTER: 'scatter',
  CHASE: 'chase',
  FRIGHTENED: 'frightened'
};

const MODE_TIMINGS = [
  { mode: GHOST_MODES.SCATTER, duration: 7 },
  { mode: GHOST_MODES.CHASE, duration: 20 },
  { mode: GHOST_MODES.SCATTER, duration: 7 },
  { mode: GHOST_MODES.CHASE, duration: 20 },
  { mode: GHOST_MODES.SCATTER, duration: 5 },
  { mode: GHOST_MODES.CHASE, duration: 20 },
  { mode: GHOST_MODES.SCATTER, duration: 5 },
  { mode: GHOST_MODES.CHASE, duration: 999 }
];

let pacAudioCtx = null;
const playSound = (type) => {
  // Throttle sound to prevent lag
  if (type === 'wakka') return;
  
  try {
    if (!pacAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) pacAudioCtx = new AudioContext();
    }
    if (!pacAudioCtx) return;
    if (pacAudioCtx.state === 'suspended') pacAudioCtx.resume();

    const ctx = pacAudioCtx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const masterVol = typeof window.gameVolume !== 'undefined' ? window.gameVolume : 0.7;
    const volumeBoost = 2.0; // Boost volume by 2x

    if (type === 'power') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15 * masterVol * volumeBoost, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'eatGhost') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2 * masterVol * volumeBoost, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'die') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.2 * masterVol * volumeBoost, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch(e) { }
};

// Memoized maze cell to prevent re-rendering every frame
const MazeCell = memo(({ x, y, cell }) => {
  return (
    <div
      className="absolute"
      style={{
        left: x * CELL_SIZE,
        top: y * CELL_SIZE,
        width: CELL_SIZE,
        height: CELL_SIZE
      }}
    >
      {cell === 1 && (
        <div className="w-full h-full bg-blue-600 border border-blue-500"></div>
      )}
      {cell === 2 && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-amber-300 rounded-full"></div>
        </div>
      )}
      {cell === 3 && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-3 h-3 bg-amber-300 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
});

MazeCell.displayName = 'MazeCell';

export default function PacMan({ onBack, playerName }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showIntermission, setShowIntermission] = useState(false);
  const [mazeVersion, setMazeVersion] = useState(0); // Track maze changes for re-render
  const [, forceUpdate] = useState(0);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  const { checkAchievements, updateChallenge, updateStats, clearNewAchievements } = useGameProgress('pacman');

  const pacmanRef = useRef({ 
    x: 9, 
    y: 15, 
    direction: DIRECTIONS.RIGHT, 
    nextDirection: DIRECTIONS.RIGHT,
    chompFrame: 0
  });
  
  const ghostsRef = useRef([
    { id: 'blinky', x: 9, y: 9, direction: DIRECTIONS.LEFT, mode: GHOST_MODES.SCATTER, floatOffset: 0, targetX: 17, targetY: 1, frightened: false },
    { id: 'pinky', x: 8, y: 9, direction: DIRECTIONS.UP, mode: GHOST_MODES.SCATTER, floatOffset: 0.5, targetX: 1, targetY: 1, frightened: false },
    { id: 'inky', x: 10, y: 9, direction: DIRECTIONS.UP, mode: GHOST_MODES.SCATTER, floatOffset: 1, targetX: 17, targetY: 19, frightened: false },
    { id: 'clyde', x: 9, y: 10, direction: DIRECTIONS.DOWN, mode: GHOST_MODES.SCATTER, floatOffset: 1.5, targetX: 1, targetY: 19, frightened: false }
  ]);
  
  const mazeRef = useRef(JSON.parse(JSON.stringify(MAZES[0])));
  const powerTimeoutRef = useRef(null);
  const gameLoopRef = useRef(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const dotsEatenRef = useRef(0);
  const totalDotsRef = useRef(0);
  const comboTimeoutRef = useRef(null);
  const comboMultiplierRef = useRef(1);
  const comboCountRef = useRef(0);
  const modeTimerRef = useRef(null);
  const currentModeIndexRef = useRef(0);
  const frameCountRef = useRef(0);
  const fruitSpawnedRef = useRef(false);
  const powerModeRef = useRef(false);
  const fruitRef = useRef(null);
  const collectedFruitsRef = useRef([]);
  const ghostModeRef = useRef(GHOST_MODES.SCATTER);
  const dotsRemainingRef = useRef(0);

  // Remove maze state sync useEffect - not needed anymore

  // Level utilities
  const countDots = useCallback((mazeData) => {
    let count = 0;
    mazeData.forEach(row => {
      row.forEach(cell => {
        if (cell === 2 || cell === 3) count++;
      });
    });
    return count;
  }, []);

  const isWall = useCallback((x, y) => {
    if (y < 0 || y >= GRID_HEIGHT || x < 0 || x >= GRID_WIDTH) return true;
    return mazeRef.current[y][x] === 1;
  }, []);

  const canMove = useCallback((x, y, direction) => {
    const newX = x + direction.x;
    const newY = y + direction.y;
    return !isWall(newX, newY);
  }, [isWall]);

  const getGhostTarget = useCallback((ghost, pacman) => {
    if (ghost.frightened) {
      return { x: Math.floor(Math.random() * GRID_WIDTH), y: Math.floor(Math.random() * GRID_HEIGHT) };
    }

    if (ghost.mode === GHOST_MODES.SCATTER) {
      return { x: ghost.targetX, y: ghost.targetY };
    }

    // Chase mode - each ghost has unique behavior
    if (ghost.id === 'blinky') {
      // Blinky: Direct chase
      return { x: pacman.x, y: pacman.y };
    } else if (ghost.id === 'pinky') {
      // Pinky: Target 4 tiles ahead of Pac-Man
      return {
        x: pacman.x + pacman.direction.x * 4,
        y: pacman.y + pacman.direction.y * 4
      };
    } else if (ghost.id === 'inky') {
      // Inky: Complex targeting based on Blinky
      const blinky = ghostsRef.current.find(g => g.id === 'blinky');
      const targetX = pacman.x + pacman.direction.x * 2;
      const targetY = pacman.y + pacman.direction.y * 2;
      return {
        x: targetX + (targetX - blinky.x),
        y: targetY + (targetY - blinky.y)
      };
    } else if (ghost.id === 'clyde') {
      // Clyde: Chase if far, scatter if close
      const dist = Math.sqrt(Math.pow(ghost.x - pacman.x, 2) + Math.pow(ghost.y - pacman.y, 2));
      if (dist > 8) {
        return { x: pacman.x, y: pacman.y };
      } else {
        return { x: ghost.targetX, y: ghost.targetY };
      }
    }

    return { x: pacman.x, y: pacman.y };
  }, []);

  const moveGhost = useCallback((ghost, pacman) => {
    const validDirs = [];
    Object.values(DIRECTIONS).forEach(dir => {
      if (canMove(ghost.x, ghost.y, dir)) {
        // Prevent 180-degree turns
        if (!(dir.x === -ghost.direction.x && dir.y === -ghost.direction.y)) {
          validDirs.push(dir);
        }
      }
    });
    
    if (validDirs.length === 0) return;

    const target = getGhostTarget(ghost, pacman);
    
    let bestDir = validDirs[0];
    let bestDist = Infinity;

    validDirs.forEach(dir => {
      const newX = ghost.x + dir.x;
      const newY = ghost.y + dir.y;
      const dist = Math.sqrt(Math.pow(newX - target.x, 2) + Math.pow(newY - target.y, 2));
      
      if (dist < bestDist) {
        bestDist = dist;
        bestDir = dir;
      }
    });

    ghost.direction = bestDir;
    ghost.x += ghost.direction.x;
    ghost.y += ghost.direction.y;

    // Tunnel wrap
    if (ghost.x < 0) ghost.x = GRID_WIDTH - 1;
    if (ghost.x >= GRID_WIDTH) ghost.x = 0;

    // Update float animation
    ghost.floatOffset = (ghost.floatOffset + 0.1) % (Math.PI * 2);
  }, [canMove, getGhostTarget]);

  const handleCombo = useCallback(() => {
    // Disable combo to prevent lag from constant setTimeout
    return;
    
    /* DISABLED FOR PERFORMANCE
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    
    comboMultiplierRef.current = Math.min(comboMultiplierRef.current + 0.1, 3);
    comboCountRef.current = comboCountRef.current + 1;

    comboTimeoutRef.current = setTimeout(() => {
      comboMultiplierRef.current = 1;
      comboCountRef.current = 0;
    }, COMBO_TIMEOUT);
    */
  }, []);

  const spawnFruit = useCallback(() => {
    if (fruitSpawnedRef.current || fruitRef.current) return;
    
    const fruitIndex = Math.min(levelRef.current - 1, FRUITS.length - 1);
    const fruitData = FRUITS[fruitIndex];
    
    fruitRef.current = {
      x: 9,
      y: 15,
      ...fruitData,
      timer: 10000
    };
    
    fruitSpawnedRef.current = true;

    setTimeout(() => {
      fruitRef.current = null;
    }, 10000);
  }, []);

  const gameLoop = useCallback(() => {
    const pacman = pacmanRef.current;
    const ghosts = ghostsRef.current;
    const currentMaze = mazeRef.current;
    frameCountRef.current++;

    // Update chomp animation
    pacman.chompFrame = (pacman.chompFrame + 0.3) % 4;

    // Try to change pacman direction
    if (canMove(pacman.x, pacman.y, pacman.nextDirection)) {
      pacman.direction = pacman.nextDirection;
    }

    // Move pacman
    if (canMove(pacman.x, pacman.y, pacman.direction)) {
      pacman.x += pacman.direction.x;
      pacman.y += pacman.direction.y;

      // Tunnel wrap
      if (pacman.x < 0) pacman.x = GRID_WIDTH - 1;
      if (pacman.x >= GRID_WIDTH) pacman.x = 0;

      // Eat dot
      if (currentMaze[pacman.y][pacman.x] === 2) {
        // Removed sound to prevent lag
        const points = 10; // Fixed points, no combo
        scoreRef.current += points;
        dotsEatenRef.current++;
        
        currentMaze[pacman.y][pacman.x] = 0;
        dotsRemainingRef.current = totalDotsRef.current - dotsEatenRef.current;

        // Spawn fruit after 70 dots
        if (dotsEatenRef.current >= DOTS_BEFORE_FRUIT && !fruitSpawnedRef.current) {
          spawnFruit();
        }
      }

      // Eat power pellet
      if (currentMaze[pacman.y][pacman.x] === 3) {
        playSound('power');
        scoreRef.current += 50;
        dotsEatenRef.current++;
        powerModeRef.current = true;
        ghosts.forEach(ghost => {
          ghost.frightened = true;
          ghost.mode = GHOST_MODES.FRIGHTENED;
        });
        
        if (powerTimeoutRef.current) clearTimeout(powerTimeoutRef.current);
        powerTimeoutRef.current = setTimeout(() => {
          powerModeRef.current = false;
          ghosts.forEach(ghost => {
            ghost.frightened = false;
            ghost.mode = GHOST_MODES.CHASE;
          });
        }, 8000);

        currentMaze[pacman.y][pacman.x] = 0;
        dotsRemainingRef.current = totalDotsRef.current - dotsEatenRef.current;
      }

      // Collect fruit
      if (fruitRef.current && pacman.x === fruitRef.current.x && pacman.y === fruitRef.current.y) {
        playSound('fruit');
        scoreRef.current += fruitRef.current.points;
        collectedFruitsRef.current = [...collectedFruitsRef.current, fruitRef.current];
        fruitRef.current = null;
      }
    }

    // Move ghosts
    ghosts.forEach(ghost => {
      moveGhost(ghost, pacman);
    });

    // Force re-render only every 2 frames for 30 FPS (still smooth, better performance)
    if (frameCountRef.current % 2 === 0) {
      forceUpdate(prev => prev + 1);
    }

    // Check collisions
    ghosts.forEach(ghost => {
      if (ghost.x === pacman.x && ghost.y === pacman.y) {
        if (ghost.frightened) {
          playSound('eatGhost');
          scoreRef.current += 200;
          ghost.x = 9;
          ghost.y = 9;
          ghost.frightened = false;
          ghost.mode = GHOST_MODES.SCATTER;
        } else {
          playSound('die');
          livesRef.current--;
          
          if (livesRef.current <= 0) {
            setGameOver(true);
            
            // Update stats & achievements
            updateStats({ gamesPlayed: 1, losses: 1, bestScore: scoreRef.current });
            const unlocked = checkAchievements({ score: scoreRef.current, level: levelRef.current, won: false });
            if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
            updateChallenge(scoreRef.current);
            
            // OTOMATISASI: Lapor ke server
            gameService.recordGamePlay('pacman').catch(console.error);
            if (scoreRef.current > 0) {
              leaderboardService.submitScore(playerName || 'Guest_Player', 'pacman', scoreRef.current).catch(console.error);
            }
          } else {
            // Reset positions
            pacman.x = 9;
            pacman.y = 15;
            pacman.direction = DIRECTIONS.RIGHT;
            pacman.nextDirection = DIRECTIONS.RIGHT;
            ghostsRef.current = [
              { id: 'blinky', x: 9, y: 9, direction: DIRECTIONS.LEFT, mode: GHOST_MODES.SCATTER, floatOffset: 0, targetX: 17, targetY: 1, frightened: false },
              { id: 'pinky', x: 8, y: 9, direction: DIRECTIONS.UP, mode: GHOST_MODES.SCATTER, floatOffset: 0.5, targetX: 1, targetY: 1, frightened: false },
              { id: 'inky', x: 10, y: 9, direction: DIRECTIONS.UP, mode: GHOST_MODES.SCATTER, floatOffset: 1, targetX: 17, targetY: 19, frightened: false },
              { id: 'clyde', x: 9, y: 10, direction: DIRECTIONS.DOWN, mode: GHOST_MODES.SCATTER, floatOffset: 1.5, targetX: 1, targetY: 19, frightened: false }
            ];
          }
        }
      }
    });

    // Check win
    const hasDotsLeft = currentMaze.some(row => row.some(cell => cell === 2 || cell === 3));
    if (!hasDotsLeft && !won) {
      // Level complete!
      if (levelRef.current < MAZES.length) {
        // Show intermission
        setShowIntermission(true);
        setTimeout(() => {
          levelRef.current++;
          const newMaze = JSON.parse(JSON.stringify(MAZES[Math.min(levelRef.current - 1, MAZES.length - 1)]));
          mazeRef.current = newMaze;
          totalDotsRef.current = countDots(newMaze);
          dotsRemainingRef.current = totalDotsRef.current;
          dotsEatenRef.current = 0;
          fruitSpawnedRef.current = false;
          fruitRef.current = null;
          setShowIntermission(false);
          setMazeVersion(prev => prev + 1); // Trigger maze re-render
          forceUpdate(prev => prev + 1); // Force re-render with new maze
          
          // Reset positions
          pacman.x = 9;
          pacman.y = 15;
          pacman.direction = DIRECTIONS.RIGHT;
          pacman.nextDirection = DIRECTIONS.RIGHT;
          ghostsRef.current = [
            { id: 'blinky', x: 9, y: 9, direction: DIRECTIONS.LEFT, mode: GHOST_MODES.SCATTER, floatOffset: 0, targetX: 17, targetY: 1, frightened: false },
            { id: 'pinky', x: 8, y: 9, direction: DIRECTIONS.UP, mode: GHOST_MODES.SCATTER, floatOffset: 0.5, targetX: 1, targetY: 1, frightened: false },
            { id: 'inky', x: 10, y: 9, direction: DIRECTIONS.UP, mode: GHOST_MODES.SCATTER, floatOffset: 1, targetX: 17, targetY: 19, frightened: false },
            { id: 'clyde', x: 9, y: 10, direction: DIRECTIONS.DOWN, mode: GHOST_MODES.SCATTER, floatOffset: 1.5, targetX: 1, targetY: 19, frightened: false }
          ];
        }, 3000);
      } else {
        // Won all levels!
        setWon(true);
        setGameOver(true);
        
        // Update stats & achievements
        updateStats({ gamesPlayed: 1, wins: 1, bestScore: scoreRef.current });
        const unlocked = checkAchievements({ score: scoreRef.current, level: levelRef.current, won: true, allLevels: true });
        if (unlocked.length > 0) setCurrentAchievement(unlocked[0]);
        updateChallenge(scoreRef.current);
        
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#FBBF24', '#F59E0B', '#10B981']
        });
      }
    }
  }, [canMove, won, countDots, moveGhost, spawnFruit]);

  // Ghost mode cycling - simplified
  useEffect(() => {
    if (!gameStarted || gameOver || showIntermission) return;

    const cycleMode = () => {
      const currentTiming = MODE_TIMINGS[currentModeIndexRef.current];
      ghostModeRef.current = currentTiming.mode;
      
      ghostsRef.current.forEach(ghost => {
        if (!ghost.frightened) {
          ghost.mode = currentTiming.mode;
        }
      });

      currentModeIndexRef.current = (currentModeIndexRef.current + 1) % MODE_TIMINGS.length;
    };

    cycleMode(); // Initial call

    const interval = setInterval(() => {
      cycleMode();
    }, MODE_TIMINGS[currentModeIndexRef.current].duration * 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, showIntermission]);

  useEffect(() => {
    if (!gameStarted || gameOver || showIntermission) return;

    const speed = powerModeRef.current ? FRIGHTENED_SPEED : GAME_SPEED;
    gameLoopRef.current = setInterval(gameLoop, speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, gameLoop, showIntermission]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted && !showIntermission) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          setGameStarted(true);
          totalDotsRef.current = countDots(mazeRef.current);
          dotsRemainingRef.current = totalDotsRef.current;
        }
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        pacmanRef.current.nextDirection = DIRECTIONS.UP;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        pacmanRef.current.nextDirection = DIRECTIONS.DOWN;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        pacmanRef.current.nextDirection = DIRECTIONS.LEFT;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        pacmanRef.current.nextDirection = DIRECTIONS.RIGHT;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, showIntermission, countDots]);

  const resetGame = () => {
    const initialMaze = JSON.parse(JSON.stringify(MAZES[0]));
    mazeRef.current = initialMaze;
    pacmanRef.current = { x: 9, y: 15, direction: DIRECTIONS.RIGHT, nextDirection: DIRECTIONS.RIGHT, chompFrame: 0 };
    ghostsRef.current = [
      { id: 'blinky', x: 9, y: 9, direction: DIRECTIONS.LEFT, mode: GHOST_MODES.SCATTER, floatOffset: 0, targetX: 17, targetY: 1, frightened: false },
      { id: 'pinky', x: 8, y: 9, direction: DIRECTIONS.UP, mode: GHOST_MODES.SCATTER, floatOffset: 0.5, targetX: 1, targetY: 1, frightened: false },
      { id: 'inky', x: 10, y: 9, direction: DIRECTIONS.UP, mode: GHOST_MODES.SCATTER, floatOffset: 1, targetX: 17, targetY: 19, frightened: false },
      { id: 'clyde', x: 9, y: 10, direction: DIRECTIONS.DOWN, mode: GHOST_MODES.SCATTER, floatOffset: 1.5, targetX: 1, targetY: 19, frightened: false }
    ];
    scoreRef.current = 0;
    livesRef.current = 3;
    levelRef.current = 1;
    dotsEatenRef.current = 0;
    fruitSpawnedRef.current = false;
    comboMultiplierRef.current = 1;
    comboCountRef.current = 0;
    currentModeIndexRef.current = 0;
    powerModeRef.current = false;
    fruitRef.current = null;
    collectedFruitsRef.current = [];
    ghostModeRef.current = GHOST_MODES.SCATTER;
    totalDotsRef.current = countDots(initialMaze);
    dotsRemainingRef.current = totalDotsRef.current;
    setGameOver(false);
    setWon(false);
    setGameStarted(false);
    setShowIntermission(false);
    setMazeVersion(0); // Reset maze version
    forceUpdate(0);
    if (powerTimeoutRef.current) clearTimeout(powerTimeoutRef.current);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    if (modeTimerRef.current) clearTimeout(modeTimerRef.current);
  };

  const chompRotation = Math.floor(pacmanRef.current.chompFrame);

  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12">
      {/* Enhanced HUD */}
      <div className="w-full flex justify-between items-center mb-6 px-4 flex-wrap gap-4">
        <button 
          onClick={onBack} 
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold transition-colors"
        >
          ← Back
        </button>
        
        <div className="flex gap-4 items-center flex-wrap justify-center">
          {/* Lives */}
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-500 text-[10px] block leading-none uppercase tracking-widest mb-1">LIVES</span>
            <div className="flex gap-1">
              {Array.from({ length: livesRef.current }).map((_, i) => (
                <span key={i} className="text-xl">⚫</span>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-500 text-[10px] block leading-none uppercase tracking-widest mb-1">LEVEL</span>
            <span className="text-xl font-mono text-purple-400">{levelRef.current}</span>
          </div>

          {/* Dots Remaining */}
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-500 text-[10px] block leading-none uppercase tracking-widest mb-1">DOTS</span>
            <span className="text-xl font-mono text-cyan-400">{dotsRemainingRef.current}</span>
          </div>

          {/* GameStats Component */}
          <GameStats 
            gameId="pacman" 
            playerName={playerName} 
            currentScore={scoreRef.current}
            isPlaying={gameStarted && !gameOver && !showIntermission}
          />

          {/* Collected Fruits */}
          {collectedFruitsRef.current.length > 0 && (
            <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <span className="text-slate-500 text-[10px] block leading-none uppercase tracking-widest mb-1">FRUITS</span>
              <div className="flex gap-1">
                {collectedFruitsRef.current.slice(-5).map((f, i) => (
                  <span key={i} className="text-lg">{f.icon}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Combo Multiplier - DISABLED FOR PERFORMANCE */}
      {false && comboMultiplierRef.current > 1 && (
        <div className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full font-black text-lg shadow-lg animate-pulse">
          🔥 COMBO x{comboMultiplierRef.current.toFixed(1)} ({comboCountRef.current} dots)
        </div>
      )}

      {/* Game Board */}
      <div 
        className="relative bg-slate-950 rounded-3xl shadow-2xl border-8 border-slate-800 overflow-hidden"
        style={{ 
          width: GRID_WIDTH * CELL_SIZE, 
          height: GRID_HEIGHT * CELL_SIZE 
        }}
      >
        {/* Maze - Memoized cells for performance */}
        {mazeRef.current.map((row, y) => (
          row.map((cell, x) => (
            <MazeCell key={`${x}-${y}-${mazeVersion}`} x={x} y={y} cell={cell} />
          ))
        ))}

        {/* Pac-Man with chomp animation */}
        <div
          className="absolute"
          style={{
            left: pacmanRef.current.x * CELL_SIZE,
            top: pacmanRef.current.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            transform: `rotate(${
              pacmanRef.current.direction === DIRECTIONS.RIGHT ? 0 :
              pacmanRef.current.direction === DIRECTIONS.DOWN ? 90 :
              pacmanRef.current.direction === DIRECTIONS.LEFT ? 180 : 270
            }deg)`
          }}
        >
          <div className="w-full h-full bg-amber-400 rounded-full relative overflow-hidden">
            {/* Chomp animation - mouth opens and closes */}
            <div 
              className="absolute top-0 right-0 w-0 h-0 transition-all duration-100"
              style={{
                borderTop: `${10 + chompRotation * 2}px solid transparent`,
                borderRight: `${10 + chompRotation * 2}px solid rgb(2, 6, 23)`,
                borderBottom: `${10 + chompRotation * 2}px solid transparent`
              }}
            ></div>
          </div>
        </div>

        {/* Ghosts with animations */}
        {ghostsRef.current.map(ghost => {
          const floatY = Math.sin(ghost.floatOffset) * 2;
          const eyeOffsetX = ghost.frightened ? 0 : (pacmanRef.current.x - ghost.x) * 0.3;
          const eyeOffsetY = ghost.frightened ? 0 : (pacmanRef.current.y - ghost.y) * 0.3;
          
          return (
            <div
              key={ghost.id}
              className="absolute"
              style={{
                left: ghost.x * CELL_SIZE,
                top: ghost.y * CELL_SIZE + floatY,
                width: CELL_SIZE,
                height: CELL_SIZE
              }}
            >
              <div 
                className="w-full h-full rounded-t-full relative"
                style={{ 
                  backgroundColor: ghost.frightened ? '#2563EB' : GHOST_COLORS[ghost.id]
                }}
              >
                {/* Eyes that follow Pac-Man */}
                {!ghost.frightened && (
                  <>
                    <div 
                      className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"
                      style={{
                        transform: `translate(${Math.max(-1, Math.min(1, eyeOffsetX))}px, ${Math.max(-1, Math.min(1, eyeOffsetY))}px)`
                      }}
                    >
                      <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-slate-900 rounded-full"></div>
                    </div>
                    <div 
                      className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"
                      style={{
                        transform: `translate(${Math.max(-1, Math.min(1, eyeOffsetX))}px, ${Math.max(-1, Math.min(1, eyeOffsetY))}px)`
                      }}
                    >
                      <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-slate-900 rounded-full"></div>
                    </div>
                  </>
                )}
                {/* Frightened face */}
                {ghost.frightened && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                    😱
                  </div>
                )}
                {/* Wavy bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                  <div className="flex-1 bg-slate-950 rounded-t-full"></div>
                  <div className="flex-1"></div>
                  <div className="flex-1 bg-slate-950 rounded-t-full"></div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Fruit */}
        {fruitRef.current && (
          <div
            className="absolute text-2xl animate-bounce"
            style={{
              left: fruitRef.current.x * CELL_SIZE - 2,
              top: fruitRef.current.y * CELL_SIZE - 2,
              filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'
            }}
          >
            {fruitRef.current.icon}
          </div>
        )}

        {/* Power Mode Indicator */}
        {powerModeRef.current && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            ⚡ POWER MODE!
          </div>
        )}

        {/* Ghost Mode Indicator */}
        {!powerModeRef.current && gameStarted && !gameOver && (
          <div className="absolute top-2 right-2 bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold border border-slate-600">
            {ghostModeRef.current === GHOST_MODES.SCATTER ? '🔵 SCATTER' : '🔴 CHASE'}
          </div>
        )}

        {/* Start Screen */}
        {!gameStarted && !gameOver && !showIntermission && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="text-5xl font-black text-amber-400 mb-4 drop-shadow-2xl animate-pulse">
              PAC-MAN
            </div>
            <div className="bg-amber-500 text-slate-900 px-8 py-3 rounded-full font-black text-xl shadow-xl mb-4">
              PRESS ARROW KEY
            </div>
            <p className="text-slate-300 text-sm font-bold">Eat all dots & avoid ghosts!</p>
            <p className="text-slate-400 text-xs mt-2">Collect fruits for bonus points!</p>
          </div>
        )}

        {/* Intermission Screen */}
        {showIntermission && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-30">
            <h2 className="text-5xl font-black text-emerald-400 mb-4 drop-shadow-2xl animate-bounce">
              LEVEL {levelRef.current} COMPLETE!
            </h2>
            <p className="text-slate-300 text-xl font-bold">Get ready for Level {levelRef.current + 1}...</p>
            <div className="mt-6 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
              ))}
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && !showIntermission && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-30">
            <h2 className={`text-5xl font-black mb-4 drop-shadow-2xl ${won ? 'text-emerald-400' : 'text-rose-500'}`}>
              {won ? '🏆 YOU WIN!' : 'GAME OVER'}
            </h2>
            <div className="bg-slate-800 rounded-2xl p-6 mb-6 border-4 border-slate-700">
              <div className="text-center mb-4">
                <span className="text-slate-400 text-sm block mb-1">FINAL SCORE</span>
                <span className="text-4xl font-black text-amber-400">{scoreRef.current}</span>
              </div>
              <div className="text-center mb-4">
                <span className="text-slate-400 text-sm block mb-1">LEVEL REACHED</span>
                <span className="text-2xl font-black text-purple-400">{levelRef.current}</span>
              </div>
              {collectedFruitsRef.current.length > 0 && (
                <div className="text-center mb-4">
                  <span className="text-slate-400 text-sm block mb-1">FRUITS COLLECTED</span>
                  <div className="flex gap-1 justify-center">
                    {collectedFruitsRef.current.map((f, i) => (
                      <span key={i} className="text-2xl">{f.icon}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); resetGame(); }}
              className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xl rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-[0_20px_40px_rgba(251,191,36,0.3)]"
            >
              PLAY AGAIN
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
      </div>

      {/* Touch Controls - Virtual D-Pad for Mobile */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="grid grid-cols-3 gap-3 w-56 h-56 bg-slate-800/50 rounded-3xl p-4 border border-slate-700">
          {/* Up */}
          <div className="col-start-2"></div>
          <button
            onClick={() => {
              pacmanRef.current.nextDirection = DIRECTIONS.UP;
              if (!gameStarted && !showIntermission) {
                setGameStarted(true);
                totalDotsRef.current = countDots(mazeRef.current);
                dotsRemainingRef.current = totalDotsRef.current;
              }
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              pacmanRef.current.nextDirection = DIRECTIONS.UP;
              if (!gameStarted && !showIntermission) {
                setGameStarted(true);
                totalDotsRef.current = countDots(mazeRef.current);
                dotsRemainingRef.current = totalDotsRef.current;
              }
            }}
            className="col-start-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-400 rounded-2xl flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-lg border-2 border-indigo-500 h-full"
          >
            🔼
          </button>
          
          {/* Left, Center, Right */}
          <button
            onClick={() => {
              pacmanRef.current.nextDirection = DIRECTIONS.LEFT;
              if (!gameStarted && !showIntermission) {
                setGameStarted(true);
                totalDotsRef.current = countDots(mazeRef.current);
                dotsRemainingRef.current = totalDotsRef.current;
              }
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              pacmanRef.current.nextDirection = DIRECTIONS.LEFT;
              if (!gameStarted && !showIntermission) {
                setGameStarted(true);
                totalDotsRef.current = countDots(mazeRef.current);
                dotsRemainingRef.current = totalDotsRef.current;
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-400 rounded-2xl flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-lg border-2 border-indigo-500 h-full"
          >
            ◀️
          </button>
          <div className="bg-slate-900/50 rounded-2xl flex items-center justify-center text-3xl h-full">
            ⚫
          </div>
          <button
            onClick={() => {
              pacmanRef.current.nextDirection = DIRECTIONS.RIGHT;
              if (!gameStarted && !showIntermission) {
                setGameStarted(true);
                totalDotsRef.current = countDots(mazeRef.current);
                dotsRemainingRef.current = totalDotsRef.current;
              }
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              pacmanRef.current.nextDirection = DIRECTIONS.RIGHT;
              if (!gameStarted && !showIntermission) {
                setGameStarted(true);
                totalDotsRef.current = countDots(mazeRef.current);
                dotsRemainingRef.current = totalDotsRef.current;
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-400 rounded-2xl flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-lg border-2 border-indigo-500 h-full"
          >
            ▶️
          </button>
          
          {/* Down */}
          <div className="col-start-2"></div>
          <button
            onClick={() => {
              pacmanRef.current.nextDirection = DIRECTIONS.DOWN;
              if (!gameStarted && !showIntermission) {
                setGameStarted(true);
                totalDotsRef.current = countDots(mazeRef.current);
                dotsRemainingRef.current = totalDotsRef.current;
              }
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              pacmanRef.current.nextDirection = DIRECTIONS.DOWN;
              if (!gameStarted && !showIntermission) {
                setGameStarted(true);
                totalDotsRef.current = countDots(mazeRef.current);
                dotsRemainingRef.current = totalDotsRef.current;
              }
            }}
            className="col-start-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-400 rounded-2xl flex items-center justify-center text-3xl font-black transition-all active:scale-95 shadow-lg border-2 border-indigo-500 h-full"
          >
            🔽
          </button>
        </div>
        
        <p className="text-slate-400 text-sm font-medium bg-slate-800/50 px-6 py-3 rounded-full border border-slate-700">
          Keyboard: <kbd className="bg-slate-700 px-2 py-1 rounded mx-1 text-slate-200 shadow">Arrow Keys</kbd> | Mobile: <span className="text-indigo-400 font-bold">Tap Buttons</span>
        </p>
      </div>

      <div className="mt-6 w-full max-w-md px-4">
        <DailyChallengeCard gameId="pacman" compact={true} />
      </div>

      <HelpButton game="pacman" />
      
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
