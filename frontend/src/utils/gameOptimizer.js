/**
 * Game Performance Optimizer
 * Mengoptimalkan performa game untuk pengalaman yang lebih smooth
 */

class GameOptimizer {
  constructor() {
    this.frameRate = 60;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fpsHistory = [];
    this.maxHistoryLength = 60;
  }

  /**
   * Optimized requestAnimationFrame dengan throttling
   */
  requestOptimizedFrame(callback) {
    return requestAnimationFrame((currentTime) => {
      const deltaTime = currentTime - this.lastFrameTime;
      
      // Target 60 FPS (16.67ms per frame)
      if (deltaTime >= 16.67) {
        this.lastFrameTime = currentTime;
        this.updateFPS(deltaTime);
        callback(currentTime, deltaTime);
      } else {
        // Skip frame if too early
        this.requestOptimizedFrame(callback);
      }
    });
  }

  /**
   * Update FPS tracking
   */
  updateFPS(deltaTime) {
    const fps = 1000 / deltaTime;
    this.fpsHistory.push(fps);
    
    if (this.fpsHistory.length > this.maxHistoryLength) {
      this.fpsHistory.shift();
    }
    
    this.frameCount++;
  }

  /**
   * Get average FPS
   */
  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  /**
   * Detect if device is low-end
   */
  isLowEndDevice() {
    const avgFPS = this.getAverageFPS();
    return avgFPS < 45 && this.frameCount > 60; // After 1 second of tracking
  }

  /**
   * Get optimized settings based on performance
   */
  getOptimizedSettings() {
    const isLowEnd = this.isLowEndDevice();
    
    return {
      // Reduce particle effects on low-end devices
      particleCount: isLowEnd ? 5 : 15,
      
      // Adjust animation smoothness
      animationQuality: isLowEnd ? 'low' : 'high',
      
      // Reduce shadow/glow effects
      visualEffects: isLowEnd ? false : true,
      
      // Adjust game speed compensation
      speedMultiplier: isLowEnd ? 0.9 : 1.0,
      
      // Canvas optimization
      canvasOptimization: isLowEnd ? 'performance' : 'quality'
    };
  }

  /**
   * Optimize canvas rendering
   */
  optimizeCanvas(canvas, context) {
    if (!canvas || !context) return;
    
    const settings = this.getOptimizedSettings();
    
    // Set canvas optimization hints
    if (settings.canvasOptimization === 'performance') {
      context.imageSmoothingEnabled = false;
      canvas.style.imageRendering = 'pixelated';
    } else {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
    }
    
    // Optimize for mobile devices
    if (this.isMobileDevice()) {
      context.globalCompositeOperation = 'source-over';
    }
  }

  /**
   * Detect mobile device
   */
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Memory cleanup for games
   */
  cleanupGameMemory() {
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    // Clear any cached audio contexts
    this.cleanupAudioContexts();
  }

  /**
   * Cleanup audio contexts to prevent memory leaks
   */
  cleanupAudioContexts() {
    // Close unused audio contexts
    if (window.snakeAudioCtx && window.snakeAudioCtx.state !== 'closed') {
      window.snakeAudioCtx.close();
      window.snakeAudioCtx = null;
    }
    
    if (window.flappyAudioCtx && window.flappyAudioCtx.state !== 'closed') {
      window.flappyAudioCtx.close();
      window.flappyAudioCtx = null;
    }
  }

  /**
   * Preload and optimize game assets
   */
  async preloadAssets(assetUrls) {
    const promises = assetUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    });
    
    try {
      return await Promise.all(promises);
    } catch (error) {
      console.warn('Some assets failed to preload:', error);
      return [];
    }
  }

  /**
   * Throttle function calls for performance
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Debounce function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Reset optimizer state
   */
  reset() {
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fpsHistory = [];
  }
}

// Export singleton instance
export const gameOptimizer = new GameOptimizer();
export default gameOptimizer;