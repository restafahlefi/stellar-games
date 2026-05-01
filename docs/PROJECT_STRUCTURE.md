# 📁 Stellar Games - Project Structure

Dokumentasi lengkap struktur folder dan file dalam project Stellar Games.

## 🌳 Tree Structure

```
stellar_games/
│
├── 📂 frontend/                          # React Frontend Application
│   ├── 📂 src/
│   │   ├── 📂 assets/                   # Images, icons, static files
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   │
│   │   ├── 📂 components/               # Reusable React components
│   │   │   └── (empty - ready for shared components)
│   │   │
│   │   ├── 📂 data/                     # Game configurations & data
│   │   │   └── gamesData.js            # Game metadata (10 games)
│   │   │
│   │   ├── 📂 games/                    # Individual game components
│   │   │   ├── TicTacToe.jsx           # Tic-Tac-Toe game
│   │   │   ├── Snake.jsx               # Snake game
│   │   │   ├── MemoryMatch.jsx         # Memory card game
│   │   │   ├── RockPaperScissors.jsx   # RPS game
│   │   │   ├── SimonSays.jsx           # Simon Says game
│   │   │   ├── TypingTest.jsx          # Typing speed test
│   │   │   ├── ConnectFour.jsx         # Connect 4 game
│   │   │   ├── Game2048.jsx            # 2048 puzzle
│   │   │   ├── Minesweeper.jsx         # Minesweeper game
│   │   │   └── Wordle.jsx              # Wordle clone
│   │   │
│   │   ├── 📂 ui/                       # UI components
│   │   │   └── VolumeControl.jsx       # Audio control component
│   │   │
│   │   ├── App.jsx                      # Main app component
│   │   ├── App.css                      # App-specific styles
│   │   ├── index.css                    # Global styles
│   │   └── main.jsx                     # Entry point
│   │
│   ├── 📂 public/                       # Public static files
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── package.json                     # Frontend dependencies
│   ├── vite.config.js                   # Vite configuration
│   ├── tailwind.config.js               # TailwindCSS config
│   ├── postcss.config.js                # PostCSS config
│   ├── eslint.config.js                 # ESLint rules
│   ├── Dockerfile                       # Docker config for frontend
│   ├── .gitignore                       # Git ignore rules
│   └── README.md                        # Frontend documentation
│
├── 📂 backend_node/                     # Node.js Backend (DDD Architecture)
│   ├── 📂 src/
│   │   │
│   │   ├── 📂 domain/                   # 🎯 DOMAIN LAYER (Business Logic)
│   │   │   │
│   │   │   ├── 📂 games/                # Games Bounded Context
│   │   │   │   ├── 📂 entities/
│   │   │   │   │   └── Game.js         # Game entity with business logic
│   │   │   │   ├── 📂 valueObjects/
│   │   │   │   │   └── GameMetadata.js # Immutable game metadata
│   │   │   │   ├── 📂 services/
│   │   │   │   │   └── GameService.js  # Game domain service
│   │   │   │   └── 📂 repositories/
│   │   │   │       └── IGameRepository.js # Repository interface
│   │   │   │
│   │   │   ├── 📂 players/              # Players Bounded Context
│   │   │   │   ├── 📂 entities/
│   │   │   │   │   └── Player.js       # Player entity
│   │   │   │   ├── 📂 services/
│   │   │   │   │   └── PlayerService.js
│   │   │   │   └── 📂 repositories/
│   │   │   │       └── IPlayerRepository.js
│   │   │   │
│   │   │   └── 📂 leaderboard/          # Leaderboard Bounded Context
│   │   │       ├── 📂 entities/
│   │   │       │   └── Score.js        # Score entity
│   │   │       ├── 📂 services/
│   │   │       │   └── LeaderboardService.js
│   │   │       └── 📂 repositories/
│   │   │           └── IScoreRepository.js
│   │   │
│   │   ├── 📂 application/              # 🔄 APPLICATION LAYER (Use Cases)
│   │   │   └── 📂 useCases/
│   │   │       ├── 📂 games/
│   │   │       │   ├── GetAllGamesUseCase.js
│   │   │       │   └── CreateGameUseCase.js
│   │   │       ├── 📂 players/
│   │   │       │   └── CreatePlayerUseCase.js
│   │   │       └── 📂 leaderboard/
│   │   │           ├── GetLeaderboardUseCase.js
│   │   │           └── SubmitScoreUseCase.js
│   │   │
│   │   ├── 📂 infrastructure/           # 🔧 INFRASTRUCTURE LAYER
│   │   │   ├── 📂 persistence/          # Repository implementations
│   │   │   │   ├── InMemoryGameRepository.js
│   │   │   │   ├── InMemoryPlayerRepository.js
│   │   │   │   └── InMemoryScoreRepository.js
│   │   │   ├── 📂 di/                   # Dependency Injection
│   │   │   │   └── container.js        # DI Container
│   │   │   └── 📂 seeders/              # Seed data
│   │   │       └── gameSeed.js         # Initial game data
│   │   │
│   │   ├── 📂 interfaces/               # 🌐 INTERFACE LAYER (API)
│   │   │   └── 📂 http/
│   │   │       ├── 📂 controllers/      # HTTP Controllers
│   │   │       │   ├── GameController.js
│   │   │       │   ├── PlayerController.js
│   │   │       │   └── LeaderboardController.js
│   │   │       └── 📂 routes/           # Express Routes
│   │   │           ├── gameRoutes.js
│   │   │           ├── playerRoutes.js
│   │   │           └── leaderboardRoutes.js
│   │   │
│   │   ├── 📂 shared/                   # 🔗 SHARED KERNEL
│   │   │   ├── 📂 exceptions/           # Custom exceptions
│   │   │   │   └── DomainException.js
│   │   │   └── 📂 utils/                # Utilities
│   │   │       ├── idGenerator.js
│   │   │       └── logger.js
│   │   │
│   │   ├── 📂 config/                   # ⚙️ Configuration
│   │   │   ├── constants.js            # App constants
│   │   │   └── database.js             # Database config
│   │   │
│   │   ├── index.js                     # Entry point
│   │   └── server.js                    # Express app setup
│   │
│   ├── 📚 Documentation/
│   │   ├── README.md                    # Backend overview
│   │   ├── ARCHITECTURE.md              # DDD architecture guide
│   │   ├── API_EXAMPLES.md              # API usage examples
│   │   ├── GETTING_STARTED.md           # Development guide
│   │   └── DDD_CHEATSHEET.md            # Quick reference
│   │
│   ├── package.json                     # Backend dependencies
│   ├── .env.example                     # Environment variables template
│   ├── .gitignore                       # Git ignore rules
│   └── Dockerfile                       # Docker config for backend
│
├── 📂 backend_python/                   # Python Backend (Optional - Future)
│   ├── 📂 src/
│   │   └── main.py                      # FastAPI entry point
│   ├── requirements.txt                 # Python dependencies
│   └── Dockerfile                       # Docker config
│
├── docker-compose.yml                   # Docker orchestration
├── README.md                            # Main project documentation
└── PROJECT_STRUCTURE.md                 # This file
```

## 📊 Layer Responsibilities

### Frontend (`frontend/`)
- **Purpose**: User interface and game rendering
- **Tech**: React, Vite, TailwindCSS
- **Responsibilities**:
  - Render 10 games
  - Handle user interactions
  - Manage local state
  - Communicate with backend API

### Backend - Domain Layer (`backend_node/src/domain/`)
- **Purpose**: Core business logic
- **Contains**:
  - **Entities**: Objects with identity (Game, Player, Score)
  - **Value Objects**: Immutable objects (GameMetadata)
  - **Domain Services**: Business logic coordination
  - **Repository Interfaces**: Data access contracts
- **Rules**:
  - ✅ Pure business logic
  - ❌ No framework dependencies
  - ❌ No database knowledge

### Backend - Application Layer (`backend_node/src/application/`)
- **Purpose**: Use cases and workflows
- **Contains**:
  - Use Cases for each user action
- **Responsibilities**:
  - Orchestrate domain objects
  - Handle application flow
  - Transaction boundaries

### Backend - Infrastructure Layer (`backend_node/src/infrastructure/`)
- **Purpose**: Technical implementation
- **Contains**:
  - Repository implementations
  - Database access
  - External services
  - Dependency injection
- **Responsibilities**:
  - Implement repository interfaces
  - Handle persistence
  - Manage dependencies

### Backend - Interface Layer (`backend_node/src/interfaces/`)
- **Purpose**: API endpoints
- **Contains**:
  - Controllers
  - Routes
  - Request/Response handling
- **Responsibilities**:
  - HTTP handling
  - Input validation
  - Response formatting

## 🎯 Bounded Contexts

### Games Context
**Location**: `backend_node/src/domain/games/`
**Purpose**: Manage game metadata, categories, and statistics
**Entities**: Game
**Value Objects**: GameMetadata

### Players Context
**Location**: `backend_node/src/domain/players/`
**Purpose**: Manage player profiles, authentication, and stats
**Entities**: Player

### Leaderboard Context
**Location**: `backend_node/src/domain/leaderboard/`
**Purpose**: Manage scores, rankings, and achievements
**Entities**: Score

## 📝 File Naming Conventions

### Frontend
- Components: `PascalCase.jsx` (e.g., `TicTacToe.jsx`)
- Utilities: `camelCase.js` (e.g., `gamesData.js`)
- Styles: `kebab-case.css` or `PascalCase.css`

### Backend
- Entities: `PascalCase.js` (e.g., `Game.js`)
- Services: `PascalCase + Service.js` (e.g., `GameService.js`)
- Use Cases: `Verb + Noun + UseCase.js` (e.g., `CreateGameUseCase.js`)
- Controllers: `PascalCase + Controller.js` (e.g., `GameController.js`)
- Routes: `camelCase + Routes.js` (e.g., `gameRoutes.js`)
- Interfaces: `I + PascalCase.js` (e.g., `IGameRepository.js`)
- Implementations: `Implementation + PascalCase.js` (e.g., `InMemoryGameRepository.js`)

## 🔗 Dependencies Flow

```
Frontend
   ↓ HTTP Requests
Backend Interface Layer (Controllers, Routes)
   ↓ Calls
Backend Application Layer (Use Cases)
   ↓ Uses
Backend Domain Layer (Services, Entities)
   ↓ Depends on
Backend Infrastructure Layer (Repositories)
   ↓ Accesses
Database (In-Memory / MongoDB / PostgreSQL)
```

## 🚀 Key Files

### Must-Read Documentation
1. `stellar_games/README.md` - Project overview
2. `backend_node/README.md` - Backend overview
3. `backend_node/ARCHITECTURE.md` - DDD architecture
4. `backend_node/GETTING_STARTED.md` - Development guide

### Entry Points
- Frontend: `frontend/src/main.jsx`
- Backend: `backend_node/src/index.js`

### Configuration Files
- Frontend: `frontend/vite.config.js`, `frontend/tailwind.config.js`
- Backend: `backend_node/src/config/`
- Docker: `docker-compose.yml`

## 📦 Important Notes

### What's Included
✅ 10 fully functional games (frontend)
✅ Complete DDD backend architecture
✅ RESTful API with 15+ endpoints
✅ Comprehensive documentation
✅ Docker setup
✅ Seed data for games

### What's Optional
⚠️ Backend Python - Commented out in docker-compose (future use)
⚠️ Database - Currently in-memory (easily replaceable)

### What's Ready for Extension
🔧 Add MongoDB/PostgreSQL
🔧 Add authentication/authorization
🔧 Add real-time features (WebSocket)
🔧 Add more games
🔧 Add achievements system

## 🎓 Learning Path

1. **Start Here**: `stellar_games/README.md`
2. **Understand Frontend**: Explore `frontend/src/games/`
3. **Learn DDD**: Read `backend_node/ARCHITECTURE.md`
4. **See Examples**: Check `backend_node/API_EXAMPLES.md`
5. **Start Coding**: Follow `backend_node/GETTING_STARTED.md`

---

**This structure follows industry best practices for scalable, maintainable applications.**
