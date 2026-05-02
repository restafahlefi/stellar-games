/**
 * Verify Token Use Case
 * Handles JWT token verification
 */
class VerifyTokenUseCase {
  constructor(authService) {
    this.authService = authService;
  }

  async execute(token) {
    try {
      const user = await this.authService.verifyToken(token);
      return {
        success: true,
        data: { user: user.toSafeJSON() }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = VerifyTokenUseCase;
