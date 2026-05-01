/**
 * Game-Specific Optimizations
 * Konfigurasi optimasi untuk setiap game agar lebih smooth dan responsive
 */

export const GAME_OPTIMIZATIONS = {
  snake: {
    // Snake Game Optimizations
    baseSpeed: 120, // Reduced from 150 for smoother movement
    speedIncrement: 8, // Gradual speed increase
    maxSpeed: 80, // Minimum interval (fastest speed)
    
    // Rendering optimizations
    useCanvasOptimization: true,
    enableSmoothMovement: true,
    
    // Performance settings
    maxParticles: 10,
    particleLifetime: 500,
    
    // Mobile optimizations
    mobileSpeedMultiplier: 0.9,
    touchSensitivity: 50
  },

  flappybird: {
    // Flappy Bird Optimizations
    gravity: 0.45, // Slightly reduced for smoother feel
    jumpStrength: -8.5, // Adjusted for better control
    pipeSpeed: 2.5, // Reduced from 3 for smoother movement
    
    // Frame rate optimizations
    targetFPS: 60,
    physicsSteps: 1,
    
    // Visual optimizations
    enableParticles: true,
    maxParticles: 8,
    enableTrails: false, // Disable on low-end devices
    
    // Mobile optimizations
    touchResponseTime: 50,
    mobileGravityMultiplier: 0.95
  },

  game2048: {
    // 2048 Game Optimizations
    animationDuration: 150, // Faster animations
    slideAnimationEasing: 'ease-out',
    
    // Touch optimizations
    swipeThreshold: 30,
    swipeTimeout: 300,
    
    // Visual optimizations
    enableTileAnimations: true,
    enableMergeEffects: true,
    maxConcurrentAnimations: 16,
    
    // Performance
    useTransform3d: true, // Hardware acceleration
    enableWillChange: true
  },

  pacman: {
    // Pac-Man Optimizations
    gameSpeed: 120, // Base game speed
    ghostSpeed: 100, // Ghost movement speed
    
    // Rendering optimizations
    useSpriteBatching: true,
    maxGhosts: 4,
    
    // Animation optimizations
    pacmanAnimationSpeed: 200,
    ghostAnimationSpeed: 300,
    
    // Collision detection
    collisionPrecision: 'medium', // balance between accuracy and performance
    
    // Mobile optimizations
    touchControlSize: 60,
    mobileSpeedAdjustment: 0.9
  },

  memory: {
    // Memory Match Optimizations
    flipAnimationDuration: 300,
    matchAnimationDuration: 500,
    
    // Card rendering
    useCardCaching: true,
    preloadImages: true,
    
    // Touch optimizations
    touchDebounce: 200,
    preventDoubleClick: true,
    
    // Visual effects
    enableFlipEffects: true,
    enableMatchEffects: true,
    particleCount: 6
  },

  simonsays: {
    // Simon Says Optimizations
    buttonFlashDuration: 400,
    sequenceDelay: 600,
    
    // Audio optimizations
    audioPreload: true,
    audioBufferSize: 4,
    
    // Visual optimizations
    enableGlowEffects: true,
    buttonAnimationDuration: 200,
    
    // Input handling
    inputDebounce: 100,
    sequenceTimeout: 3000
  },

  typing: {
    // Typing Test Optimizations
    updateInterval: 100, // WPM calculation frequency
    
    // Text rendering
    useVirtualScrolling: true,
    maxVisibleLines: 10,
    
    // Input optimizations
    inputBufferSize: 50,
    keystrokeDebounce: 10,
    
    // Visual feedback
    enableTypingEffects: true,
    cursorBlinkRate: 530,
    
    // Performance
    enableTextCaching: true
  },

  minesweeper: {
    // Minesweeper Optimizations
    cellSize: 32, // Optimized for touch and mouse
    
    // Rendering optimizations
    useCellCaching: true,
    batchCellUpdates: true,
    
    // Input handling
    clickDebounce: 50,
    rightClickDelay: 200,
    
    // Visual effects
    enableRevealAnimation: true,
    revealAnimationDuration: 150,
    
    // Mobile optimizations
    touchHoldDuration: 500, // For right-click simulation
    mobileCellSize: 40
  },

  wordle: {
    // Wordle Optimizations
    letterFlipDuration: 300,
    rowSubmitDelay: 100,
    
    // Input handling
    keyboardDebounce: 50,
    enableKeyboardShortcuts: true,
    
    // Visual effects
    enableLetterAnimations: true,
    enableShakeAnimation: true,
    shakeAnimationDuration: 400,
    
    // Performance
    useLetterCaching: true,
    preloadKeyboard: true
  },

  tictactoe: {
    // Tic-Tac-Toe Optimizations
    markAnimationDuration: 200,
    winLineAnimationDuration: 500,
    
    // Input handling
    cellClickDebounce: 100,
    preventDoubleClick: true,
    
    // Visual effects
    enableMarkAnimations: true,
    enableWinEffects: true,
    
    // Multiplayer optimizations
    networkUpdateThrottle: 100,
    connectionTimeout: 5000
  },

  rps: {
    // Rock Paper Scissors Optimizations
    choiceAnimationDuration: 300,
    resultDisplayDuration: 2000,
    
    // Input handling
    choiceDebounce: 200,
    
    // Visual effects
    enableChoiceAnimations: true,
    enableResultEffects: true,
    
    // Multiplayer
    networkLatencyCompensation: true,
    maxWaitTime: 10000
  },

  connect4: {
    // Connect Four Optimizations
    dropAnimationDuration: 400,
    dropAnimationEasing: 'ease-in',
    
    // Physics simulation
    dropGravity: 0.8,
    bounceEffect: 0.1,
    
    // Visual effects
    enableDropAnimation: true,
    enableWinAnimation: true,
    
    // Input handling
    columnHoverDelay: 100,
    clickDebounce: 150,
    
    // Multiplayer
    moveTransmissionDelay: 50,
    syncInterval: 1000
  }
};

/**
 * Get optimized settings for a specific game
 */
export function getGameOptimization(gameId) {
  return GAME_OPTIMIZATIONS[gameId] || {};
}

/**
 * Apply mobile-specific optimizations
 */
export function getMobileOptimizations(gameId) {
  const base = getGameOptimization(gameId);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) return base;
  
  // Apply mobile-specific adjustments
  return {
    ...base,
    // Reduce particle effects
    maxParticles: Math.floor((base.maxParticles || 10) * 0.6),
    
    // Adjust animation durations
    animationDuration: (base.animationDuration || 300) * 0.8,
    
    // Reduce visual effects
    enableTrails: false,
    enableGlowEffects: false,
    
    // Optimize touch controls
    touchOptimized: true
  };
}

/**
 * Performance monitoring and adaptive optimization
 */
export class AdaptiveOptimizer {
  constructor() {
    this.performanceHistory = [];
    this.currentSettings = {};
  }

  recordPerformance(gameId, fps, frameTime) {
    this.performanceHistory.push({
      gameId,
      fps,
      frameTime,
      timestamp: Date.now()
    });

    // Keep only last 100 records
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }

    // Auto-adjust settings if performance is poor
    this.autoAdjustSettings(gameId, fps);
  }

  autoAdjustSettings(gameId, currentFPS) {
    const targetFPS = 50; // Minimum acceptable FPS
    
    if (currentFPS < targetFPS) {
      console.log(`🔧 Auto-optimizing ${gameId} due to low FPS: ${currentFPS}`);
      
      // Reduce quality settings
      this.currentSettings[gameId] = {
        ...getGameOptimization(gameId),
        maxParticles: 3,
        enableVisualEffects: false,
        animationDuration: 100,
        useSimplifiedRendering: true
      };
    }
  }

  getAdaptiveSettings(gameId) {
    return this.currentSettings[gameId] || getGameOptimization(gameId);
  }
}

export const adaptiveOptimizer = new AdaptiveOptimizer();