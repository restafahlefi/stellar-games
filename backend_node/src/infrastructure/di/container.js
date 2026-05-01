// Dependency Injection Container
// Mengatur semua dependencies dan wiring

// Repositories
const InMemoryGameRepository = require('../persistence/InMemoryGameRepository');
const InMemoryPlayerRepository = require('../persistence/InMemoryPlayerRepository');
const InMemoryScoreRepository = require('../persistence/InMemoryScoreRepository');

// Domain Services
const GameService = require('../../domain/games/services/GameService');
const PlayerService = require('../../domain/players/services/PlayerService');
const LeaderboardService = require('../../domain/leaderboard/services/LeaderboardService');

// Use Cases
const GetAllGamesUseCase = require('../../application/useCases/games/GetAllGamesUseCase');
const CreateGameUseCase = require('../../application/useCases/games/CreateGameUseCase');
const GetGlobalStatsUseCase = require('../../application/useCases/games/GetGlobalStatsUseCase');
const CreatePlayerUseCase = require('../../application/useCases/players/CreatePlayerUseCase');
const GetLeaderboardUseCase = require('../../application/useCases/leaderboard/GetLeaderboardUseCase');
const SubmitScoreUseCase = require('../../application/useCases/leaderboard/SubmitScoreUseCase');

// Controllers
const GameController = require('../../interfaces/http/controllers/GameController');
const PlayerController = require('../../interfaces/http/controllers/PlayerController');
const LeaderboardController = require('../../interfaces/http/controllers/LeaderboardController');

// Initialize Repositories
const gameRepository = new InMemoryGameRepository();
const playerRepository = new InMemoryPlayerRepository();
const scoreRepository = new InMemoryScoreRepository();

// Initialize Domain Services
const gameService = new GameService(gameRepository, playerRepository);
const playerService = new PlayerService(playerRepository);
const leaderboardService = new LeaderboardService(scoreRepository, playerRepository);

// Initialize Use Cases
const getAllGamesUseCase = new GetAllGamesUseCase(gameService);
const createGameUseCase = new CreateGameUseCase(gameService);
const getGlobalStatsUseCase = new GetGlobalStatsUseCase(gameService);
const createPlayerUseCase = new CreatePlayerUseCase(playerService);
const getLeaderboardUseCase = new GetLeaderboardUseCase(leaderboardService);
const submitScoreUseCase = new SubmitScoreUseCase(leaderboardService, gameService, playerService);

// Initialize Controllers
const gameController = new GameController(getAllGamesUseCase, createGameUseCase, gameService, getGlobalStatsUseCase);
const playerController = new PlayerController(createPlayerUseCase, playerService);
const leaderboardController = new LeaderboardController(getLeaderboardUseCase, submitScoreUseCase, leaderboardService);

// Export container
module.exports = {
  // Repositories
  gameRepository,
  playerRepository,
  scoreRepository,
  
  // Services
  gameService,
  playerService,
  leaderboardService,
  
  // Use Cases
  getAllGamesUseCase,
  createGameUseCase,
  createPlayerUseCase,
  getLeaderboardUseCase,
  submitScoreUseCase,
  
  // Controllers
  gameController,
  playerController,
  leaderboardController
};
