import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { gameService } from '../services/gameService';
import { leaderboardService } from '../services/leaderboardService';
import AutoReturnTimer from '../components/AutoReturnTimer';
import GameStats from '../components/GameStats';
import { playGameSound } from '../utils/soundEngine';
import HelpButton from '../components/HelpButton';

// Audio Engine Lokal
let c4AudioCtx = null;
const playSound = (type) => {
  try {
    if (!c4AudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) c4AudioCtx = new AudioContext();
    }
    if (!c4AudioCtx) return;
    if (c4AudioCtx.state === 'suspended') c4AudioCtx.resume();
    const ctx = c4AudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'drop') {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
};

const ConnectFour = ({ onBack, playerName }) => {
  const [board, setBoard] = useState(Array(6).fill(null).map(() => Array(7).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [isAiTurn, setIsAiTurn] = useState(false);

  const checkWin = (b, p) => {
    // Horizontal
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === p && b[r][c+1] === p && b[r][c+2] === p && b[r][c+3] === p) return true;
      }
    }
    // Vertical
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        if (b[r][c] === p && b[r+1][c] === p && b[r+2][c] === p && b[r+3][c] === p) return true;
      }
    }
    // Diagonal
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === p && b[r+1][c+1] === p && b[r+2][c+2] === p && b[r+3][c+3] === p) return true;
        if (b[r+3][c] === p && b[r+2][c+1] === p && b[r+1][c+2] === p && b[r][c+3] === p) return true;
      }
    }
    return false;
  };

  const handleMove = (col) => {
    if (winner || isAiTurn) return;
    
    let row = -1;
    for(let r=5; r>=0; r--) {
        if(!board[r][col]) { row = r; break; }
    }
    if (row === -1) {
      playGameSound('error', 0.3);
      return;
    }

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    playSound('drop');

    if (checkWin(newBoard, currentPlayer)) {
      setWinner(currentPlayer);
      if (currentPlayer === 1) {
        playGameSound('win', 0.5);
      } else {
        playGameSound('lose', 0.4);
      }
      confetti();
      gameService.recordGamePlay('connect4').catch(console.error);
      if (currentPlayer === 1) {
        leaderboardService.submitScore(playerName || 'Guest_Player', 'connect4', 500).catch(console.error);
      }
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      setIsAiTurn(currentPlayer === 1);
    }
  };

  useEffect(() => {
    if (isAiTurn && !winner) {
      setTimeout(() => {
        const availableCols = board[0].map((v, i) => v === null ? i : null).filter(v => v !== null);
        if (availableCols.length > 0) {
          const col = availableCols[Math.floor(Math.random() * availableCols.length)];
          let row = -1;
          for(let r=5; r>=0; r--) { if(!board[r][col]) { row = r; break; } }
          const newBoard = board.map(r => [...r]);
          newBoard[row][col] = 2;
          setBoard(newBoard);
          playGameSound('click', 0.2);
          if (checkWin(newBoard, 2)) {
            setWinner(2);
            playGameSound('lose', 0.4);
          } else setCurrentPlayer(1);
          setIsAiTurn(false);
        }
      }, 800);
    }
  }, [isAiTurn, winner, board]);

  const reset = () => {
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
    setCurrentPlayer(1);
    setWinner(null);
    setIsAiTurn(false);
  };

  return (
    <div className="game-container flex flex-col items-center max-w-4xl mx-auto w-full animate-fade-in pb-12 relative">
      {winner && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center rounded-3xl">
          <h2 className={`text-6xl font-black mb-6 drop-shadow-2xl ${winner === 1 ? 'text-blue-400' : 'text-rose-500'}`}>
            {winner === 1 ? '🏆 YOU WIN!' : '💀 AI WINS'}
          </h2>
          <div className="flex flex-col gap-4 w-full max-w-[200px]">
            <button onClick={reset} className="w-full py-4 bg-indigo-500 text-white font-black text-xl rounded-2xl shadow-xl">PLAY AGAIN</button>
            <button onClick={onBack} className="w-full py-3 bg-slate-700 text-white font-bold rounded-xl">MENU</button>
            <AutoReturnTimer onTimerEnd={onBack} seconds={12} />
          </div>
        </div>
      )}

      <div className="w-full flex justify-between items-center mb-8 px-4 flex-wrap gap-4">
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold">← Back</button>
        <div className={`px-6 py-2 rounded-full border-2 font-black uppercase tracking-widest ${currentPlayer === 1 ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-rose-500/20 border-rose-500 text-rose-400'}`}>
            {currentPlayer === 1 ? 'Your Turn' : 'AI Thinking...'}
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-700">
        <div className="grid grid-cols-7 gap-3 bg-indigo-900/40 p-4 rounded-2xl border-4 border-indigo-900 shadow-inner">
          {board[0].map((_, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-3">
              {[0,1,2,3,4,5].map(rowIdx => (
                <button
                  key={rowIdx}
                  onClick={() => handleMove(colIdx)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-inner transition-all transform hover:scale-105 ${board[rowIdx][colIdx] === 1 ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : board[rowIdx][colIdx] === 2 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'bg-slate-900'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <HelpButton game="connect4" />
    </div>
  );
};

export default ConnectFour;
