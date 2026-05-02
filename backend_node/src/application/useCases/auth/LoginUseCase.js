/**
 * Login Use Case
 * Handles user login business logic
 */
class LoginUseCase {
  constructor(authService) {
    this.authService = authService;
  }

  async execute(username, password) {
    try {
      const result = await this.authService.login(username, password);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = LoginUseCase;
