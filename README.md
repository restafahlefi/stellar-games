# 🎮 Stellar Games Portal

A modern gaming platform with 12 interactive games, real-time leaderboards, and achievement system.

**Live Demo:** https://stellargame.up.railway.app/

---

## 🚀 Quick Start

### Development
```bash
# Backend
cd backend_node
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Production (Docker)
```bash
docker-compose up --build
```

### Deploy to Railway
```bash
git push origin main  # Auto-deploy enabled
```

---

## 📁 Project Structure (DDD Architecture)

```
stellar_games/
├── backend_node/              # Node.js Backend (DDD)
│   ├── src/
│   │   ├── domain/           # Business Logic Layer
│   │   │   ├── games/        # Game domain
│   │   │   ├── leaderboard/  # Leaderboard domain
│   │   │   └── players/      # Player domain
│   │   ├── application/      # Use Cases Layer
│   │   │   └── useCases/
│   │   ├── infrastructure/   # Infrastructure Layer
│   │   │   ├── persistence/  # In-memory repositories
│   │   │   ├── socket/       # WebSocket server
│   │   │   └── schedulers/   # Background jobs
│   │   └── interfaces/       # Interface Layer
│   │       └── http/         # REST API controllers
│   └── package.json
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── games/            # 12 game components
│   │   ├── components/       # UI components
│   │   ├── services/         # API services
│   │   └── utils/            # Utilities
│   └── package.json
│
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
├── Dockerfile                 # Production container
├── docker-compose.yml         # Local development
└── railway.toml              # Railway deployment config
```

---

## 🎮 Games (12 Total)

1. **Tic-Tac-Toe** - Multiplayer strategy
2. **Snake** - Classic arcade with emoji controls
3. **Flappy Bird** - Endless runner
4. **Pac-Man** - Maze chase with ghosts
5. **Memory Match** - Card matching
6. **Rock Paper Scissors** - Multiplayer
7. **Simon Says** - Memory pattern
8. **Typing Test** - Speed typing
9. **Connect Four** - Multiplayer strategy
10. **2048** - Number puzzle with emoji controls
11. **Minesweeper** - Logic puzzle
12. **Wordle** - Word guessing

---

## 🏗️ Tech Stack

**Backend:**
- Node.js + Express
- Socket.IO (real-time)
- In-memory storage
- DDD architecture

**Frontend:**
- React 19
- Vite
- TailwindCSS 4
- Canvas Confetti

**Deployment:**
- Railway (production)
- Docker (containerization)

---

## 🎯 Features

- ✅ 12 interactive games
- ✅ Real-time leaderboard (auto-refresh every 15s)
- ✅ Achievement system
- ✅ Daily challenges
- ✅ Mobile touch controls (emoji buttons)
- ✅ Sound system (Web Audio API)
- ✅ Volume control
- ✅ Player profiles
- ✅ Global & server leaderboards

---

## 📊 Current Version

**v0.0.10** - Mobile scroll fix, sound system, touch controls

---

## 📝 License

MIT License - See LICENSE file

---

## 🔗 Links

- **Live:** https://stellargame.up.railway.app/
- **Repository:** GitHub (private)
- **Deployment:** Railway (auto-deploy on push)

---

**Built with ❤️ using Domain-Driven Design**
