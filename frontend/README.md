# Stellar Games - Frontend

Frontend untuk Stellar Games menggunakan React + Vite dengan TailwindCSS.

## 🎮 Games Available

10 premium browser games:
- Tic-Tac-Toe
- Classic Snake
- Memory Match
- Rock Paper Scissors
- Simon Says
- Typing Test
- Connect Four
- 2048
- Minesweeper
- Wordle Clone

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Server akan berjalan di `http://localhost:5173`

### Build Production
```bash
npm run build
npm run preview
```

## 📁 Struktur Folder (Improved)

```
src/
├── assets/              # Static files
│   ├── images/          # Images
│   └── icons/           # Icons & SVGs
│
├── components/          # Reusable components
│   └── ui/              # UI components (VolumeControl, etc)
│
├── data/                # Game configurations
│   └── gamesData.js     # Game metadata
│
├── games/               # Individual game components
│   ├── TicTacToe.jsx
│   ├── Snake.jsx
│   └── ... (8 more games)
│
├── services/            # ✨ NEW: API services
│   ├── api.js           # Base API client
│   ├── gameService.js   # Game API calls
│   ├── playerService.js # Player API calls
│   └── leaderboardService.js # Leaderboard API calls
│
├── hooks/               # ✨ NEW: Custom React hooks
│   ├── useLocalStorage.js # localStorage management
│   ├── useGameState.js    # Game state management
│   └── useApi.js          # API call management
│
├── utils/               # ✨ NEW: Utility functions
│   ├── constants.js     # App constants
│   └── helpers.js       # Helper functions
│
├── App.jsx              # Main app component
├── App.css              # App styles
├── index.css            # Global styles
└── main.jsx             # Entry point
```

## 🎨 Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first CSS
- **Canvas Confetti** - Victory animations

## 🔗 API Integration

Frontend berkomunikasi dengan backend Node.js di `http://localhost:5000/api/v1`

### Using Services

```javascript
import { gameService, playerService, leaderboardService } from './services';

// Get all games
const games = await gameService.getAllGames();

// Create player
const player = await playerService.createPlayer({
  username: 'john_doe',
  email: 'john@example.com'
});

// Submit score
await leaderboardService.submitScore({
  playerId: player.id,
  gameId: 'snake',
  score: 500
});
```

### Using Custom Hooks

```javascript
import { useLocalStorage, useGameState, useApi } from './hooks';

// localStorage hook
const [highScore, setHighScore] = useLocalStorage('highscore', 0);

// Game state hook
const {
  score,
  lives,
  isPlaying,
  startGame,
  endGame,
  addScore
} = useGameState({
  initialScore: 0,
  initialLives: 3
});

// API hook
const { data, loading, error, execute } = useApi(gameService.getAllGames);
```

## 📝 Features

### Services Layer
- ✅ Centralized API calls
- ✅ Error handling
- ✅ Request/Response formatting
- ✅ localStorage fallback

### Custom Hooks
- ✅ `useLocalStorage` - Sync state with localStorage
- ✅ `useHighScore` - High score management
- ✅ `useGameSettings` - Settings management
- ✅ `useGameState` - Game state (playing, paused, etc)
- ✅ `useGameTimer` - Countdown timer
- ✅ `useApi` - API calls with loading/error states

### Utilities
- ✅ Constants (API URLs, game IDs, etc)
- ✅ Helper functions (formatNumber, shuffleArray, etc)
- ✅ Device detection (mobile, tablet, desktop)
- ✅ Sound & vibration helpers

## 🎯 Best Practices

### Component Organization
```javascript
// Good: Use services for API calls
import { gameService } from '@/services';

const games = await gameService.getAllGames();

// Good: Use hooks for state management
import { useGameState } from '@/hooks';

const { score, addScore } = useGameState();

// Good: Use utils for helpers
import { formatNumber, shuffleArray } from '@/utils';
```

### State Management
- Use `useGameState` for game logic
- Use `useLocalStorage` for persistence
- Use `useApi` for API calls

### Styling
- Use TailwindCSS utility classes
- Keep component-specific styles in separate CSS files
- Use CSS variables for theming

## 🔧 Environment Variables

Create `.env` file from `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Stellar Games
VITE_ENABLE_LEADERBOARD=true
```

## 📚 Documentation

- [Structure Recommendation](./STRUCTURE_RECOMMENDATION.md) - Detailed structure guide
- [Backend API](../backend_node/API_EXAMPLES.md) - API documentation

## 🎮 Game Development

### Adding New Game

1. Create game component in `src/games/`
2. Add game metadata to `src/data/gamesData.js`
3. Import and use in `App.jsx`
4. Use `useGameState` hook for state management
5. Use `leaderboardService` to submit scores

### Example Game Component

```javascript
import { useGameState } from '@/hooks';
import { leaderboardService } from '@/services';

function MyGame() {
  const {
    score,
    isPlaying,
    startGame,
    endGame,
    addScore
  } = useGameState({
    onGameOver: async ({ score }) => {
      await leaderboardService.submitGameScore('mygame', score, player);
    }
  });

  return (
    <div>
      <h1>Score: {score}</h1>
      {!isPlaying && <button onClick={startGame}>Start</button>}
    </div>
  );
}
```

## 🐛 Troubleshooting

### API Connection Issues
- Check if backend is running on port 5000
- Verify `VITE_API_URL` in `.env`
- Check browser console for CORS errors

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

**Built with ❤️ using React + Vite**
