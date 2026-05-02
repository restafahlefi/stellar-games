// Dependency Injection Container
// Mengatur semua dependencies dan wiring

// Repositories
const InMemoryGameRepository = require('../persistence/InMemoryGameRepository');
const InMemoryPlayerRepository = require('../persistence/InMemoryPlayerRepository');
const InMemoryScoreRepository = require('../persistence/InMemoryScoreRepository');
const FileAuthRepository = require('../persistence/FileAuthRepository');

// Domain Services
const GameService = require('../../domain/games/services/GameService');
const PlayerService = require('../../domain/players/services/PlayerService');
const LeaderboardService = require('../../domain/leaderboard/services/LeaderboardService');
const AuthService = require('../../domain/auth/services/AuthService');
const AdminService = require('../../domain/admin/services/AdminService');

// Use Cases
const GetAllGamesUseCase = require('../../application/useCases/games/GetAllGamesUseCase');
const CreateGameUseCase = require('../../application/useCases/games/CreateGameUseCase');
const GetGlobalStatsUseCase = require('../../application/useCases/games/GetGlobalStatsUseCase');
const CreatePlayerUseCase = require('../../application/useCases/players/CreatePlayerUseCase');
const GetLeaderboardUseCase = require('../../application/useCases/leaderboard/GetLeaderboardUseCase');
const SubmitScoreUseCase = require('../../application/useCases/leaderboard/SubmitScoreUseCase');
const RegisterUseCase = require('../../application/useCases/auth/RegisterUseCase');
const LoginUseCase = require('../../application/useCases/auth/LoginUseCase');
const VerifyTokenUseCase = require('../../application/useCases/auth/VerifyTokenUseCase');

// Controllers
const GameController = require('../../interfaces/http/controllers/GameController');
const PlayerController = require('../../interfaces/http/controllers/PlayerController');
const LeaderboardController = require('../../interfaces/http/controllers/LeaderboardController');
const AuthController = require('../../interfaces/http/controllers/AuthController');

// Initialize Repositories
const gameRepository = new InMemoryGameRepository();
const playerRepository = new InMemoryPlayerRepository();
const scoreRepository = new InMemoryScoreRepository();
const authRepository = new FileAuthRepository();

// Initialize Domain Services
const gameService = new GameService(gameRepository, playerRepository);
const playerService = new PlayerService(playerRepository);
const leaderboardService = new LeaderboardService(scoreRepository, playerRepository);
const authService = new AuthService(authRepository);
const adminService = new AdminService(authRepository, playerRepository, scoreRepository, gameRepository);

// Initialize Use Cases
const getAllGamesUseCase = new GetAllGamesUseCase(gameService);
const createGameUseCase = new CreateGameUseCase(gameService);
const getGlobalStatsUseCase = new GetGlobalStatsUseCase(gameService);
const createPlayerUseCase = new CreatePlayerUseCase(playerService);
const getLeaderboardUseCase = new GetLeaderboardUseCase(leaderboardService);
const submitScoreUseCase = new SubmitScoreUseCase(leaderboardService, gameService, playerService);
const registerUseCase = new RegisterUseCase(authService);
const loginUseCase = new LoginUseCase(authService);
const verifyTokenUseCase = new VerifyTokenUseCase(authService);

// Initialize Controllers
const gameController = new GameController(getAllGamesUseCase, createGameUseCase, gameService, getGlobalStatsUseCase);
const playerController = new PlayerController(createPlayerUseCase, playerService);
const leaderboardController = new LeaderboardController(getLeaderboardUseCase, submitScoreUseCase, leaderboardService);
const authController = new AuthController(registerUseCase, loginUseCase, verifyTokenUseCase);

// Export container
module.exports = {
  // Repositories
  gameRepository,
  playerRepository,
  scoreRepository,
  authRepository,
  
  // Services
  gameService,
  playerService,
  leaderboardService,
  authService,
  adminService,
  
  // Use Cases
  getAllGamesUseCase,
  createGameUseCase,
  createPlayerUseCase,
  getLeaderboardUseCase,
  submitScoreUseCase,
  registerUseCase,
  loginUseCase,
  verifyTokenUseCase,
  
  // Controllers
  gameController,
  playerController,
  leaderboardController,
  authController,

  // Resolve method for dynamic dependency resolution
  resolve(name) {
    return this[name];
  }
};

