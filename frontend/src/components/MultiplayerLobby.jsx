import { useState, useEffect } from 'react';
import { socketService } from '../services/socketService';

export default function MultiplayerLobby({ gameType, gameName, playerName, onGameStart, onBack }) {
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [roomId, setRoomId] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    // Connect to socket server with promise
    const connectToServer = async () => {
      try {
        await socketService.connect();
        setConnecting(false);
      } catch (error) {
        console.error('Connection failed:', error);
        setConnecting(false);
        setError('Tidak dapat terhubung ke server multiplayer. Pastikan server berjalan.');
      }
    };

    connectToServer();

    // Listen for game start
    const handleGameStart = ({ room, players }) => {
      setWaiting(false);
      onGameStart({ room, players });
    };

    socketService.socket?.on('game-start', handleGameStart);

    return () => {
      socketService.socket?.off('game-start', handleGameStart);
    };
  }, [onGameStart]);

  const handleCreateRoom = async () => {
    setError('');
    setWaiting(true);
    
    try {
      const { roomId: newRoomId } = await socketService.createRoom(gameType, playerName);
      setRoomId(newRoomId);
      setMode('create');
      // Game will start when opponent joins (handled by game-start event)
    } catch (err) {
      setError(err.message || 'Gagal membuat room');
      setWaiting(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError('Masukkan Room ID');
      return;
    }

    setError('');
    setWaiting(true);
    
    try {
      await socketService.joinRoom(roomId.toUpperCase(), playerName);
      // Game will start automatically (handled by game-start event)
    } catch (err) {
      setError(err.message || 'Gagal bergabung ke room');
      setWaiting(false);
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    // Show copied feedback
    const btn = document.getElementById('copy-btn');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    }
  };

  if (connecting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-spin">🔄</div>
          <h3 className="text-2xl font-black text-blue-400">Menghubungkan...</h3>
          <p className="text-slate-500">Connecting to multiplayer server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl p-8 max-w-md w-full border-2 border-slate-700/50 shadow-2xl shadow-blue-900/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce-slow">🎮</div>
          <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text mb-2">
            MULTIPLAYER
          </h2>
          <p className="text-slate-400 text-sm font-bold">{gameName}</p>
        </div>

        {!mode && !waiting && (
          <div className="space-y-4">
            {/* Create Room Button */}
            <button
              onClick={handleCreateRoom}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/50 flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🎯</span>
              <span>BUAT ROOM</span>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-slate-500 font-bold">ATAU</span>
              </div>
            </div>

            {/* Join Room Input */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Masukkan Room ID"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value.toUpperCase());
                  setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 focus:border-blue-500 rounded-xl text-white font-mono text-center text-lg uppercase outline-none transition-all"
                maxLength={6}
              />

              <button
                onClick={handleJoinRoom}
                disabled={!roomId.trim()}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🚪</span>
                <span>GABUNG ROOM</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-xl text-red-400 text-sm text-center font-bold animate-shake">
                ⚠️ {error}
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={onBack}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl transition-colors"
            >
              ← Kembali
            </button>
          </div>
        )}

        {/* Waiting for Opponent */}
        {mode === 'create' && waiting && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="text-6xl animate-bounce">⏳</div>
            
            <div>
              <h3 className="text-2xl font-black text-emerald-400 mb-2">Room Dibuat!</h3>
              <p className="text-slate-400 text-sm">Bagikan kode ini ke temanmu</p>
            </div>

            {/* Room ID Display */}
            <div className="p-6 bg-slate-800 rounded-2xl border-2 border-blue-500/50 shadow-lg shadow-blue-900/30">
              <p className="text-slate-400 text-xs mb-2 font-bold">ROOM ID:</p>
              <p className="text-5xl font-black font-mono text-blue-400 tracking-wider mb-4">
                {roomId}
              </p>
              <button
                id="copy-btn"
                onClick={handleCopyRoomId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors"
              >
                📋 Copy Room ID
              </button>
            </div>

            {/* Waiting Animation */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            <p className="text-slate-400 text-sm animate-pulse">
              Menunggu lawan...
            </p>

            {/* Cancel Button */}
            <button
              onClick={() => {
                socketService.leaveRoom();
                setMode(null);
                setWaiting(false);
                setRoomId('');
              }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl transition-colors"
            >
              Batalkan
            </button>
          </div>
        )}

        {/* Joining Room */}
        {mode === 'join' && waiting && (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="text-6xl animate-spin">🔄</div>
            <h3 className="text-2xl font-black text-blue-400">Bergabung...</h3>
            <p className="text-slate-500 text-sm">Connecting to room {roomId}</p>
          </div>
        )}
      </div>
    </div>
  );
}
