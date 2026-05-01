import { useState, useEffect } from 'react';

export default function VolumeControl() {
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('stellar_gameVolume');
    return saved ? parseFloat(saved) : 0.7;
  });
  
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('stellar_gameMuted');
    return saved === 'true';
  });

  // Update global volume
  useEffect(() => {
    localStorage.setItem('stellar_gameVolume', volume.toString());
    window.gameVolume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    localStorage.setItem('stellar_gameMuted', isMuted.toString());
    window.gameVolume = isMuted ? 0 : volume;
  }, [isMuted]);

  // Initialize global volume on mount
  useEffect(() => {
    window.gameVolume = isMuted ? 0 : volume;
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 shadow-lg">
      {/* Mute Button */}
      <button 
        onClick={toggleMute}
        className="text-xl hover:scale-110 transition-transform active:scale-95"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : volume > 0.5 ? '🔊' : volume > 0 ? '🔉' : '🔈'}
      </button>
      
      {/* Volume Slider */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={handleVolumeChange}
        className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #334155 ${volume * 100}%, #334155 100%)`
        }}
        disabled={isMuted}
        title={`Volume: ${Math.round(volume * 100)}%`}
      />
      
      {/* Volume Percentage */}
      <span className="text-xs text-slate-400 font-mono w-8 text-right">
        {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
      </span>
    </div>
  );
}
