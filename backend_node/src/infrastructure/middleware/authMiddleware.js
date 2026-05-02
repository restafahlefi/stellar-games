/**
 * Auth Middleware - Verify JWT token
 * Attaches user to request if token is valid
 */

module.exports = (container) => {
  const verifyTokenUseCase = container.verifyTokenUseCase;

  return async (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const token = authHeader.replace('Bearer ', '');

      // Verify token
      const result = await verifyTokenUseCase.execute(token);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Attach user to request
      req.user = result.user;
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};
