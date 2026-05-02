/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */
class AuthController {
  constructor(registerUseCase, loginUseCase, verifyTokenUseCase) {
    this.registerUseCase = registerUseCase;
    this.loginUseCase = loginUseCase;
    this.verifyTokenUseCase = verifyTokenUseCase;
  }

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
      }

      const result = await this.registerUseCase.execute(username, password);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
      }

      const result = await this.loginUseCase.execute(username, password);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Verify token
   * GET /api/v1/auth/verify
   */
  async verify(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const result = await this.verifyTokenUseCase.execute(token);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Verify error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Logout user (client-side token removal)
   * POST /api/v1/auth/logout
   */
  async logout(req, res) {
    // JWT is stateless, so logout is handled client-side
    // This endpoint is just for consistency
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}

module.exports = AuthController;
