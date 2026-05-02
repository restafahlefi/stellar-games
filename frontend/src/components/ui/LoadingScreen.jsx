import { useState, useEffect } from 'react';

const QUOTES = [
  "Initializing Stellar Engine v2.4...",
  "Compiling hyper-visual assets...",
  "Establishing secure neural link...",
  "Optimizing latency protocols...",
  "Loading game modules: [12/12]",
  "Calibrating score-tracking database...",
  "Deploying anti-cheat protection..."
];

const LOGS = [
  "SYSTEM: OK",
  "NETWORK: STABLE",
  "LATENCY: 12ms",
  "REGION: GLOBAL",
  "SHADERS: CACHED"
];

export default function LoadingScreen({ onFinished }) {
  const [progress, setProgress] = useState(0);
  const [quote, setQuote] = useState("");
  const [fullQuote, setFullQuote] = useState(QUOTES[0]);
  const [fadeOut, setFadeOut] = useState(false);

  // Debug log
  useEffect(() => {
    console.log('🎬 LoadingScreen mounted - Starting from 0%');
    return () => console.log('🎬 LoadingScreen unmounted');
  }, []);

  // Efek Typing untuk Quote
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setQuote(fullQuote.slice(0, index));
      index++;
      if (index > fullQuote.length) {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [fullQuote]);

  // Ganti Quote secara berkala
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      const nextQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setFullQuote(nextQuote);
    }, 3000);
    return () => clearInterval(quoteTimer);
  }, []);

  // Logika Progress Bar - Mulai dari 0% dan smooth progression (SLOWER for enjoyment)
  useEffect(() => {
    let intervalId = null;
    
    intervalId = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev;
        
        if (newProgress >= 100) {
          if (intervalId) clearInterval(intervalId);
          setTimeout(() => setFadeOut(true), 500); // Delay sebelum fade
          setTimeout(() => {
            if (onFinished) onFinished();
          }, 1200); // Delay sebelum selesai
          return 100;
        }
        
        // SLOWER progression untuk dinikmati lebih lama
        // 0-30%: increment 1.5-2.5 (medium)
        // 30-70%: increment 0.8-1.5 (slow)
        // 70-90%: increment 0.5-1 (very slow)
        // 90-100%: increment 0.3-0.6 (ultra slow untuk dramatic effect)
        let diff;
        if (newProgress < 30) {
          diff = Math.random() * 1 + 1.5; // 1.5-2.5
        } else if (newProgress < 70) {
          diff = Math.random() * 0.7 + 0.8; // 0.8-1.5
        } else if (newProgress < 90) {
          diff = Math.random() * 0.5 + 0.5; // 0.5-1
        } else {
          diff = Math.random() * 0.3 + 0.3; // 0.3-0.6
        }
        
        const nextProgress = Math.min(newProgress + diff, 100);
        console.log(`📊 Progress: ${Math.round(nextProgress)}%`);
        return nextProgress;
      });
    }, 250); // Update setiap 250ms (lebih lambat dari 150ms) untuk lebih smooth dan lama
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('🛑 Progress interval cleared');
      }
    };
  }, [onFinished]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Video Background - Brighter */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: 'brightness(0.5)' }}
      >
        <source src="/67116-521253275.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay - Lighter */}
      <div className="absolute inset-0 z-0 bg-slate-950/40"></div>
      
      {/* 1. LAYER: Particles Background */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-500/20 blur-sm animate-pulse"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* 2. LAYER: Scanlines & Grid Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10"></div>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-10"></div>

      {/* 3. LAYER: Floating Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] z-10"></div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center max-w-sm w-full px-8">
        
        {/* Title with Glitch Effect + EXTRA Strong Shadow for maximum readability */}
        <div className="relative mb-16 group">
          <div className="text-7xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse" style={{textShadow: '0 6px 30px rgba(0,0,0,1), 0 0 60px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.7)'}}>
            STELLAR
          </div>
          <div className="absolute -bottom-3 right-0 flex items-center gap-2">
             <div className="h-[1px] w-12 bg-blue-500/50"></div>
             <span className="text-[9px] tracking-[0.6em] text-blue-400 font-bold uppercase">Engine v2.4</span>
          </div>
          {/* Subtle Glitch Decoration */}
          <div className="absolute -inset-1 border border-blue-500/10 scale-110 opacity-50 skew-x-12"></div>
        </div>

        {/* Progress System */}
        <div className="w-full space-y-5">
          <div className="flex justify-between items-end px-1">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Status Report</span>
              <span className="text-blue-400 font-mono text-[11px] font-bold h-4">
                {quote}<span className="animate-ping inline-block w-1.5 h-3 bg-blue-400 ml-1"></span>
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Power</span>
              <span className="text-emerald-400 font-mono text-2xl font-black italic leading-none">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          
          <div className="relative h-2 w-full bg-slate-900/50 rounded-full border border-slate-800/50 p-0.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_20px_rgba(59,130,246,0.6)]"
              style={{ width: `${progress}%` }}
            ></div>
            {/* Moving shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-20 animate-[move_2s_linear_infinite]" style={{ left: '-100px' }}></div>
          </div>
          
          <style>{`
            @keyframes move {
              0% { transform: translateX(-100px); }
              100% { transform: translateX(500px); }
            }
          `}</style>

          {/* Micro-logs */}
          <div className="flex justify-center gap-6 pt-4">
            {LOGS.map((log, i) => (
              <div key={i} className="flex flex-col items-center opacity-20">
                <span className="text-[7px] text-slate-400 font-bold tracking-widest">{log.split(': ')[0]}</span>
                <span className="text-[8px] text-blue-400 font-black">{log.split(': ')[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Left System Info */}
      <div className="absolute top-8 left-8 flex flex-col gap-1 opacity-20 font-mono text-[8px] text-blue-300 z-20">
        <div>CORE_INIT: SUCCESS</div>
        <div>VRAM_ALLOC: 4096MB</div>
        <div>DRIVERS: LOADED</div>
      </div>

      {/* Top Right Version */}
      <div className="absolute top-8 right-8 font-mono text-[9px] text-slate-700 font-bold tracking-widest uppercase z-20">
        Stellar-OS // Build_882
      </div>

      {/* Bottom Corner Decorations */}
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l border-b border-blue-500/20 z-20"></div>
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-blue-500/20 z-20"></div>
    </div>
  );
}
