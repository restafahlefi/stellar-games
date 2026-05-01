// Application constants

const GAME_TYPES = {
  TICTACTOE: 'tictactoe',
  SNAKE: 'snake',
  FLAPPYBIRD: 'flappybird',
  PACMAN: 'pacman',
  MEMORY: 'memory',
  RPS: 'rps',
  SIMON: 'simon',
  TYPING: 'typing',
  CONNECT4: 'connect4',
  GAME2048: 'game2048',
  MINESWEEPER: 'minesweeper',
  WORDLE: 'wordle'
};

const GAME_CATEGORIES = {
  PUZZLE: 'puzzle',
  ARCADE: 'arcade',
  STRATEGY: 'strategy',
  MEMORY: 'memory',
  WORD: 'word',
  ACTION: 'action',
  QUICK: 'quick'
};

const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

const PLAYER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned'
};

module.exports = {
  GAME_TYPES,
  GAME_CATEGORIES,
  DIFFICULTY_LEVELS,
  PLAYER_STATUS
};
