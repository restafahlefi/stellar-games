# Stellar Games Backend - Domain-Driven Design (DDD)

Backend API untuk Stellar Games menggunakan arsitektur Domain-Driven Design (DDD).

## 📁 Struktur Folder DDD

```
src/
├── domain/                          # Domain Layer - Business Logic
│   ├── games/                       # Game Bounded Context
│   │   ├── entities/                # Domain Entities
│   │   │   └── Game.js
│   │   ├── valueObjects/            # Value Objects (immutable)
│   │   │   └── GameMetadata.js
│   │   ├── services/                # Domain Services
│   │   │   └── GameService.js
│   │   └── repositories/            # Repository Interfaces
│   │       └── IGameRepository.js
│   │
│   ├── players/                     # Player Bounded Context
│   │   ├── entities/
│   │   │   └── Player.js
│   │   ├── services/
│   │   │   └── PlayerService.js
│   │   └── repositories/
│   │       └── IPlayerRepository.js
│   │
│   └── leaderboard/                 # Leaderboard Bounded Context
│       ├── entities/
│       │   └── Score.js
│       ├── services/
│       │   └── LeaderboardService.js
│       └── repositories/
│           └── IScoreRepository.js
│
├── application/                     # Application Layer - Use Cases
│   └── useCases/
│       ├── games/
│       │   ├── GetAllGamesUseCase.js
│       │   └── CreateGameUseCase.js
│       ├── players/
│       │   └── CreatePlayerUseCase.js
│       └── leaderboard/
│           ├── GetLeaderboardUseCase.js
│           └── SubmitScoreUseCase.js
│
├── infrastructure/                  # Infrastructure Layer
│   ├── persistence/                 # Repository Implementations
│   │   ├── InMemoryGameRepository.js
│   │   ├── InMemoryPlayerRepository.js
│   │   └── InMemoryScoreRepository.js
│   ├── di/                          # Dependency Injection
│   │   └── container.js
│   └── seeders/                     # Seed Data
│       └── gameSeed.js
│
├── interfaces/                      # Interface Layer - API
│   └── http/
│       ├── controllers/             # HTTP Controllers
│       │   ├── GameController.js
│       │   ├── PlayerController.js
│       │   └── LeaderboardController.js
│       └── routes/                  # Express Routes
│           ├── gameRoutes.js
│           ├── playerRoutes.js
│           └── leaderboardRoutes.js
│
├── shared/                          # Shared Kernel
│   ├── exceptions/                  # Custom Exceptions
│   │   └── DomainException.js
│   └── utils/                       # Utilities
│       ├── idGenerator.js
│       └── logger.js
│
├── config/                          # Configuration
│   ├── constants.js
│   └── database.js
│
├── index.js                         # Entry Point
└── server.js                        # Express App Setup
```

## 🏗️ Arsitektur DDD

### 1. **Domain Layer** (Inti Bisnis)
- **Entities**: Objek dengan identitas unik (Game, Player, Score)
- **Value Objects**: Objek immutable tanpa identitas (GameMetadata)
- **Domain Services**: Business logic yang tidak cocok di Entity
- **Repository Interfaces**: Contract untuk data access

### 2. **Application Layer** (Use Cases)
- Orchestrates domain objects untuk menyelesaikan use case
- Tidak mengandung business logic
- Koordinasi antar domain services

### 3. **Infrastructure Layer** (Technical Details)
- Implementasi konkret dari repository interfaces
- Database access, external services
- Dependency Injection container

### 4. **Interface Layer** (API)
- HTTP Controllers dan Routes
- Request/Response handling
- Input validation

### 5. **Shared Kernel**
- Kode yang digunakan bersama di semua layer
- Utilities, exceptions, constants

## 🎯 Bounded Contexts

### Games Context
Mengelola metadata game, kategori, dan statistik game.

### Players Context
Mengelola profil pemain, autentikasi, dan statistik pemain.

### Leaderboard Context
Mengelola skor, ranking, dan achievements.

## 🚀 API Endpoints

### Games
- `GET /api/v1/games` - Get all games
- `GET /api/v1/games/active` - Get active games
- `GET /api/v1/games/:id` - Get game by ID
- `GET /api/v1/games/category/:category` - Get games by category
- `POST /api/v1/games` - Create new game

### Players
- `GET /api/v1/players` - Get all players
- `GET /api/v1/players/:id` - Get player by ID
- `GET /api/v1/players/:id/stats` - Get player stats
- `POST /api/v1/players` - Create new player
- `PUT /api/v1/players/:id` - Update player profile

### Leaderboard
- `GET /api/v1/leaderboard/global` - Get global leaderboard
- `GET /api/v1/leaderboard/:gameId` - Get leaderboard for game
- `GET /api/v1/leaderboard/:gameId/player/:playerId/rank` - Get player rank
- `POST /api/v1/leaderboard/scores` - Submit new score

## 🔧 Installation

```bash
npm install
```

## 🏃 Running

```bash
# Development
npm run dev

# Production
npm start
```

## 📝 Prinsip DDD yang Diterapkan

1. **Ubiquitous Language**: Menggunakan bahasa domain yang sama di code dan komunikasi
2. **Bounded Context**: Setiap domain memiliki boundary yang jelas
3. **Entity vs Value Object**: Pemisahan objek dengan identitas vs tanpa identitas
4. **Repository Pattern**: Abstraksi data access
5. **Domain Services**: Business logic yang tidak cocok di entity
6. **Use Cases**: Application-specific business rules
7. **Dependency Inversion**: Domain tidak bergantung pada infrastructure

## 🎨 Design Patterns

- **Repository Pattern**: Data access abstraction
- **Dependency Injection**: Loose coupling
- **Factory Pattern**: Object creation (IdGenerator)
- **Service Layer**: Business logic organization

## 📚 Referensi

- Domain-Driven Design by Eric Evans
- Clean Architecture by Robert C. Martin
- Implementing Domain-Driven Design by Vaughn Vernon
