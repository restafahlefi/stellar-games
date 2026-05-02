/**
 * Register Use Case
 * Handles user registration business logic
 */
class RegisterUseCase {
  constructor(authService) {
    this.authService = authService;
  }

  async execute(username, password) {
    try {
      const result = await this.authService.register(username, password);
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

module.exports = RegisterUseCase;
