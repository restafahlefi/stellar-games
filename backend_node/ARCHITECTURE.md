# Arsitektur Domain-Driven Design (DDD)

## 📊 Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERFACE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Game       │  │   Player     │  │ Leaderboard  │          │
│  │ Controller   │  │ Controller   │  │ Controller   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐          │
│  │   Routes     │  │   Routes     │  │   Routes     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Get Games   │  │Create Player │  │Submit Score  │          │
│  │  Use Case    │  │  Use Case    │  │  Use Case    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┼──────────────────┘                  │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DOMAIN LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              BOUNDED CONTEXTS                           │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │    GAMES     │  │   PLAYERS    │  │ LEADERBOARD  │ │   │
│  │  │              │  │              │  │              │ │   │
│  │  │ • Game       │  │ • Player     │  │ • Score      │ │   │
│  │  │   Entity     │  │   Entity     │  │   Entity     │ │   │
│  │  │              │  │              │  │              │ │   │
│  │  │ • Metadata   │  │ • Stats      │  │ • Rank       │ │   │
│  │  │   ValueObj   │  │   ValueObj   │  │   ValueObj   │ │   │
│  │  │              │  │              │  │              │ │   │
│  │  │ • Game       │  │ • Player     │  │ • Leaderboard│ │   │
│  │  │   Service    │  │   Service    │  │   Service    │ │   │
│  │  │              │  │              │  │              │ │   │
│  │  │ • IGame      │  │ • IPlayer    │  │ • IScore     │ │   │
│  │  │   Repository │  │   Repository │  │   Repository │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  InMemory    │  │  InMemory    │  │  InMemory    │          │
│  │    Game      │  │   Player     │  │    Score     │          │
│  │  Repository  │  │  Repository  │  │  Repository  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┼──────────────────┘                  │
│                           ▼                                      │
│                  ┌─────────────────┐                            │
│                  │   Database      │                            │
│                  │  (In-Memory)    │                            │
│                  └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flow Data Request

```
HTTP Request
    │
    ▼
┌─────────────┐
│   Routes    │  (Interface Layer)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controller  │  (Interface Layer)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Use Case   │  (Application Layer)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Domain    │  (Domain Layer)
│   Service   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Entity    │  (Domain Layer)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Repository  │  (Infrastructure Layer)
│    Impl     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │
└─────────────┘
```

## 🎯 Dependency Rule

```
┌──────────────────────────────────────────┐
│         Interface Layer                  │
│  (Controllers, Routes, DTOs)             │
│         ↓ depends on ↓                   │
├──────────────────────────────────────────┤
│       Application Layer                  │
│       (Use Cases)                        │
│         ↓ depends on ↓                   │
├──────────────────────────────────────────┤
│         Domain Layer                     │
│  (Entities, Services, Interfaces)        │
│         ↑ implemented by ↑               │
├──────────────────────────────────────────┤
│      Infrastructure Layer                │
│  (Repository Impl, Database)             │
└──────────────────────────────────────────┘

RULE: Dependencies hanya boleh mengarah ke dalam (inward)
Domain Layer TIDAK boleh depend pada layer luar
```

## 🏛️ Layer Responsibilities

### 1. Domain Layer (Core)
**Tanggung Jawab:**
- Business logic murni
- Domain entities dan value objects
- Domain services
- Repository interfaces (contracts)

**Tidak Boleh:**
- Depend pada framework
- Depend pada database
- Depend pada HTTP/API concerns

**Contoh:**
```javascript
// Game.js - Entity
class Game {
  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
  }
  
  canBePlayedBy(playerCount) {
    return playerCount <= this.maxPlayers;
  }
}
```

### 2. Application Layer
**Tanggung Jawab:**
- Orchestrate use cases
- Coordinate domain objects
- Transaction management
- Application-specific business rules

**Tidak Boleh:**
- Contain business logic (harus di domain)
- Direct database access

**Contoh:**
```javascript
// SubmitScoreUseCase.js
class SubmitScoreUseCase {
  async execute(scoreData) {
    // Validate game exists
    await this.gameService.getGameById(scoreData.gameId);
    
    // Submit score
    const score = await this.leaderboardService.submitScore(scoreData);
    
    // Update player stats
    await this.playerService.recordGamePlay(...);
    
    return { success: true, data: score };
  }
}
```

### 3. Infrastructure Layer
**Tanggung Jawab:**
- Implement repository interfaces
- Database access
- External services integration
- Technical details

**Contoh:**
```javascript
// InMemoryGameRepository.js
class InMemoryGameRepository extends IGameRepository {
  async findById(gameId) {
    return db.findById('games', gameId);
  }
}
```

### 4. Interface Layer
**Tanggung Jawab:**
- HTTP request/response handling
- Input validation
- Route definition
- API documentation

**Contoh:**
```javascript
// GameController.js
class GameController {
  async getAllGames(req, res) {
    const result = await this.getAllGamesUseCase.execute();
    res.json({ status: 'success', data: result.data });
  }
}
```

## 🔗 Dependency Injection

```javascript
// container.js
const gameRepository = new InMemoryGameRepository();
const gameService = new GameService(gameRepository);
const getAllGamesUseCase = new GetAllGamesUseCase(gameService);
const gameController = new GameController(getAllGamesUseCase, gameService);

module.exports = { gameController, ... };
```

## 📦 Bounded Contexts

### Games Context
- **Entities**: Game
- **Value Objects**: GameMetadata
- **Services**: GameService
- **Repositories**: IGameRepository

### Players Context
- **Entities**: Player
- **Services**: PlayerService
- **Repositories**: IPlayerRepository

### Leaderboard Context
- **Entities**: Score
- **Services**: LeaderboardService
- **Repositories**: IScoreRepository

## 🎨 Design Patterns

1. **Repository Pattern**: Abstraksi data access
2. **Dependency Injection**: Loose coupling
3. **Factory Pattern**: Object creation
4. **Service Layer**: Business logic organization
5. **Use Case Pattern**: Application flow

## ✅ Best Practices

1. **Entities** harus memiliki business logic
2. **Value Objects** harus immutable
3. **Services** untuk logic yang tidak cocok di entity
4. **Repositories** hanya interface di domain layer
5. **Use Cases** orchestrate, tidak contain business logic
6. **Controllers** thin, hanya handle HTTP concerns
7. **Dependencies** selalu inject, jangan hardcode

## 🚀 Keuntungan Arsitektur Ini

1. **Testability**: Setiap layer bisa ditest terpisah
2. **Maintainability**: Kode terorganisir dengan baik
3. **Scalability**: Mudah menambah fitur baru
4. **Flexibility**: Mudah ganti database/framework
5. **Business Focus**: Domain logic terpisah dari technical details
6. **Team Collaboration**: Setiap bounded context bisa dikerjakan terpisah
