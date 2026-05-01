/**
 * Global Sound Engine untuk Stellar Games
 * Menyediakan sound effects yang konsisten untuk semua game
 */

// Create shared audio context
let sharedAudioCtx = null;

const getAudioContext = () => {
  if (!sharedAudioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      sharedAudioCtx = new AudioContext();
    }
  }
  return sharedAudioCtx;
};

/**
 * Play sound effect dengan volume control global
 * @param {string} type - Tipe sound effect
 * @param {number} baseVolume - Volume dasar (0-1), default 0.3
 */
export const playGameSound = (type, baseVolume = 0.3) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Apply global volume from VolumeControl
    const globalVolume = typeof window.gameVolume !== 'undefined' ? window.gameVolume : 0.7;
    const finalVolume = baseVolume * globalVolume;

    // Sound definitions
    switch(type) {
      // Universal sounds
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gainNode.gain.setValueAtTime(finalVolume * 0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
        break;

      case 'win':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
        break;

      case 'lose':
      case 'gameOver':
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        break;

      case 'error':
      case 'wrong':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(finalVolume * 0.8, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        break;

      case 'score':
      case 'point':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(finalVolume * 0.6, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
        break;

      case 'levelUp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(finalVolume * 0.7, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
        break;

      case 'newRecord':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
        break;

      case 'complete':
        // Completion fanfare
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
        break;

      case 'countdown':
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gainNode.gain.setValueAtTime(finalVolume * 0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        break;

      case 'draw':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gainNode.gain.setValueAtTime(finalVolume * 0.6, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        break;

      case 'hit':
      case 'crash':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(finalVolume * 0.9, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
        break;

      default:
        // Default beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gainNode.gain.setValueAtTime(finalVolume * 0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }
  } catch(e) {
    console.error('Sound error:', e);
  }
};

/**
 * Play multiple sounds in sequence
 * @param {Array} sounds - Array of {type, delay} objects
 */
export const playSoundSequence = (sounds) => {
  sounds.forEach(({type, delay = 0, volume = 0.3}) => {
    setTimeout(() => playGameSound(type, volume), delay);
  });
};

export default { playGameSound, playSoundSequence };
