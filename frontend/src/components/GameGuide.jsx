import React from 'react';

/**
 * Game Guide Component - Shows how to play before starting
 */
export default function GameGuide({ game, onStart, onBack }) {
  const guides = {
    snake: {
      title: 'Classic Snake',
      icon: '🐍',
      color: 'emerald',
      objective: 'Eat dots to grow longer without hitting yourself',
      controls: [
        { key: '↑ ↓ ← →', desc: 'Arrow keys to move' },
        { key: 'SPACE', desc: 'Pause game' }
      ],
      rules: [
        '✨ Walls wrap around - you won\'t die hitting walls',
        '🍎 Eat red dots to grow and score points',
        '⚠️ Game over if you hit your own body',
        '🎯 Try to beat your high score!'
      ],
      tips: [
        'Plan your path ahead',
        'Use wall-wrapping to your advantage',
        'Don\'t trap yourself in corners'
      ]
    },
    flappybird: {
      title: 'Flappy Bird',
      icon: '🐦',
      color: 'amber',
      objective: 'Navigate through pipes without crashing',
      controls: [
        { key: 'SPACE', desc: 'Flap wings' },
        { key: 'CLICK', desc: 'Alternative to flap' }
      ],
      rules: [
        '🐦 Tap to flap and stay airborne',
        '🟢 Avoid green pipes (top & bottom)',
        '⭐ Each pipe passed = +1 score',
        '💎 Collect power-ups for bonuses'
      ],
      tips: [
        'Tap rhythmically, don\'t spam',
        'Stay in the middle when possible',
        'Watch for difficulty increases'
      ]
    },
    game2048: {
      title: '2048',
      icon: '🔢',
      color: 'orange',
      objective: 'Merge tiles to reach 2048',
      controls: [
        { key: '↑ ↓ ← →', desc: 'Slide tiles' }
      ],
      rules: [
        '🔢 Slide tiles in any direction',
        '➕ Same numbers merge when they touch',
        '🎯 Goal: Create a 2048 tile',
        '↩️ Undo button available (use wisely!)'
      ],
      tips: [
        'Keep highest tile in a corner',
        'Build numbers in one direction',
        'Don\'t fill the board randomly'
      ]
    },
    pacman: {
      title: 'Pac-Man',
      icon: '👻',
      color: 'amber',
      objective: 'Eat all dots while avoiding ghosts',
      controls: [
        { key: '↑ ↓ ← →', desc: 'Move Pac-Man' }
      ],
      rules: [
        '⚪ Eat all small dots to win',
        '👻 Avoid 4 colored ghosts',
        '💊 Power pellets make ghosts blue (8 sec)',
        '🍒 Collect fruits for bonus points'
      ],
      tips: [
        'Use power pellets strategically',
        'Learn ghost movement patterns',
        'Clear corners first'
      ]
    },
    memory: {
      title: 'Memory Match',
      icon: '🎴',
      color: 'purple',
      objective: 'Find all matching pairs',
      controls: [
        { key: 'CLICK', desc: 'Flip cards' }
      ],
      rules: [
        '🎴 Click cards to reveal images',
        '🔄 Find 2 cards with same image',
        '✅ Matched pairs stay revealed',
        '🎯 Complete with fewest moves'
      ],
      tips: [
        'Remember card positions',
        'Start from corners',
        'Focus on one area at a time'
      ]
    },
    tictactoe: {
      title: 'Tic-Tac-Toe',
      icon: '❌',
      color: 'blue',
      objective: 'Get 3 in a row before opponent',
      controls: [
        { key: 'CLICK', desc: 'Place your mark' }
      ],
      rules: [
        '❌ You are X, opponent is O',
        '🎯 Get 3 marks in a row to win',
        '↔️ Horizontal, vertical, or diagonal',
        '🤖 Play against smart AI'
      ],
      tips: [
        'Control the center',
        'Block opponent\'s winning moves',
        'Create multiple winning threats'
      ]
    },
    rps: {
      title: 'Rock Paper Scissors',
      icon: '✊',
      color: 'rose',
      objective: 'Beat the AI in classic RPS',
      controls: [
        { key: 'CLICK', desc: 'Choose your weapon' }
      ],
      rules: [
        '✊ Rock beats Scissors',
        '✋ Paper beats Rock',
        '✌️ Scissors beats Paper',
        '🎲 Best of unlimited rounds'
      ],
      tips: [
        'Watch for AI patterns',
        'Mix up your choices',
        'Don\'t be too predictable'
      ]
    },
    simonsays: {
      title: 'Simon Says',
      icon: '🧠',
      color: 'yellow',
      objective: 'Repeat the color sequence',
      controls: [
        { key: 'CLICK', desc: 'Click colored buttons' }
      ],
      rules: [
        '👀 Watch the sequence carefully',
        '🔄 Repeat it in exact order',
        '➕ Sequence gets longer each round',
        '🎵 Sound helps memory'
      ],
      tips: [
        'Focus on the pattern',
        'Use sound cues',
        'Take your time repeating'
      ]
    },
    typing: {
      title: 'Typing Test',
      icon: '⌨️',
      color: 'cyan',
      objective: 'Type as fast and accurate as possible',
      controls: [
        { key: 'KEYBOARD', desc: 'Type the text' }
      ],
      rules: [
        '⌨️ Type the displayed paragraph',
        '⚡ Speed measured in WPM',
        '✅ Accuracy percentage tracked',
        '⏱️ Timer starts on first keystroke'
      ],
      tips: [
        'Focus on accuracy first',
        'Use proper finger placement',
        'Don\'t look at keyboard'
      ]
    },
    connect4: {
      title: 'Connect Four',
      icon: '🔴',
      color: 'indigo',
      objective: 'Connect 4 discs in a row',
      controls: [
        { key: 'CLICK', desc: 'Drop disc in column' }
      ],
      rules: [
        '🔴 Click column to drop your disc',
        '⬇️ Disc falls to lowest empty spot',
        '🎯 Connect 4 in a row to win',
        '↔️ Horizontal, vertical, or diagonal'
      ],
      tips: [
        'Control the center columns',
        'Block opponent\'s threats',
        'Set up multiple winning moves'
      ]
    },
    minesweeper: {
      title: 'Minesweeper',
      icon: '💣',
      color: 'red',
      objective: 'Clear board without hitting mines',
      controls: [
        { key: 'LEFT CLICK', desc: 'Reveal cell' },
        { key: 'RIGHT CLICK', desc: 'Place flag' }
      ],
      rules: [
        '💣 Avoid clicking on mines',
        '🔢 Numbers show nearby mines',
        '🚩 Right-click to flag suspected mines',
        '✅ Reveal all safe cells to win'
      ],
      tips: [
        'Start from corners',
        'Use number clues carefully',
        'Flag mines to track them'
      ]
    },
    wordle: {
      title: 'Wordle',
      icon: '📝',
      color: 'green',
      objective: 'Guess the 5-letter word in 6 tries',
      controls: [
        { key: 'KEYBOARD', desc: 'Type your guess' },
        { key: 'ENTER', desc: 'Submit guess' }
      ],
      rules: [
        '🟩 Green = correct letter, correct position',
        '🟨 Yellow = correct letter, wrong position',
        '⬛ Gray = letter not in word',
        '🎯 6 attempts to guess the word'
      ],
      tips: [
        'Start with common vowels',
        'Use yellow letters in different positions',
        'Eliminate gray letters'
      ]
    }
  };

  const guideData = guides[game.id] || {
    title: game.name,
    icon: game.icon?.[0] || '🎮',
    color: 'blue',
    objective: game.desc,
    controls: [],
    rules: [],
    tips: []
  };

  const colorClasses = {
    emerald: 'from-emerald-600 to-emerald-500',
    amber: 'from-amber-600 to-amber-500',
    orange: 'from-orange-600 to-orange-500',
    purple: 'from-purple-600 to-purple-500',
    blue: 'from-blue-600 to-blue-500',
    rose: 'from-rose-600 to-rose-500',
    yellow: 'from-yellow-600 to-yellow-500',
    cyan: 'from-cyan-600 to-cyan-500',
    indigo: 'from-indigo-600 to-indigo-500',
    red: 'from-red-600 to-red-500',
    green: 'from-green-600 to-green-500'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold transition-colors"
          >
            ← Back to Games
          </button>
          <div className="text-slate-500 text-sm font-bold">
            📖 How to Play
          </div>
        </div>

        {/* Game Title */}
        <div className={`bg-gradient-to-r ${colorClasses[guideData.color]} p-8 rounded-3xl shadow-2xl mb-8 text-center`}>
          <div className="text-7xl mb-4">{guideData.icon}</div>
          <h1 className="text-4xl font-black mb-2">{guideData.title}</h1>
          <p className="text-lg opacity-90">{guideData.objective}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Controls */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <span>🎮</span> Controls
            </h2>
            <div className="space-y-3">
              {guideData.controls.map((control, index) => (
                <div key={index} className="flex items-center gap-3">
                  <kbd className="bg-slate-800 px-3 py-2 rounded-lg font-mono text-sm font-bold min-w-[80px] text-center border border-slate-700">
                    {control.key}
                  </kbd>
                  <span className="text-slate-300 text-sm">{control.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <span>📋</span> Rules
            </h2>
            <ul className="space-y-2">
              {guideData.rules.map((rule, index) => (
                <li key={index} className="text-slate-300 text-sm leading-relaxed">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tips */}
        {guideData.tips.length > 0 && (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 mb-8">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <span>💡</span> Pro Tips
            </h2>
            <ul className="grid md:grid-cols-3 gap-3">
              {guideData.tips.map((tip, index) => (
                <li key={index} className="bg-slate-800/50 p-3 rounded-lg text-sm text-slate-300 border border-slate-700">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={onStart}
            className={`px-12 py-5 bg-gradient-to-r ${colorClasses[guideData.color]} text-white font-black text-2xl rounded-2xl shadow-2xl hover:scale-105 transition-transform`}
          >
            🎮 START PLAYING
          </button>
          <p className="text-slate-500 text-sm mt-4">
            Good luck and have fun! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}
