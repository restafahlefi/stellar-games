/**
 * Rate Limiting Middleware
 * 
 * Mencegah spam dan abuse dengan membatasi request per IP dan per username:
 * - Registration: 3 attempts per 15 minutes per IP
 * - Login: 10 attempts per 15 minutes per IP
 * - API: 100 requests per minute per IP
 * - Temporary IP blocking untuk repeated violations
 * 
 * Menggunakan in-memory storage (reset saat server restart)
 */

class RateLimitService {
  constructor() {
    // Storage untuk tracking requests
    this.requests = new Map(); // IP -> { endpoint -> { count, resetTime, blocked } }
    this.userAttempts = new Map(); // username -> { count, resetTime, blocked }
    
    // Configuration
    this.limits = {
      registration: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 3,                   // 3 attempts
        blockDuration: 30 * 60 * 1000 // 30 minutes block
      },
      login: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10,                  // 10 attempts
        blockDuration: 15 * 60 * 1000 // 15 minutes block
      },
      api: {
        windowMs: 60 * 1000,      // 1 minute
        max: 100,                 // 100 requests
        blockDuration: 5 * 60 * 1000 // 5 minutes block
      }
    };

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
    
    console.log('🛡️  Rate Limiting Service initialized');
  }

  /**
   * Check rate limit untuk IP dan endpoint
   * @param {string} ip - Client IP address
   * @param {string} endpoint - Endpoint name (registration, login, api)
   * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
   */
  checkIPLimit(ip, endpoint) {
    const now = Date.now();
    const config = this.limits[endpoint];
    
    if (!config) {
      return { allowed: true, remaining: Infinity, resetTime: now };
    }

    // Get atau create IP record
    if (!this.requests.has(ip)) {
      this.requests.set(ip, {});
    }
    
    const ipRecord = this.requests.get(ip);
    
    // Get atau create endpoint record
    if (!ipRecord[endpoint]) {
      ipRecord[endpoint] = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false,
        blockUntil: 0
      };
    }
    
    const record = ipRecord[endpoint];
    
    // Check if currently blocked
    if (record.blocked && now < record.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.blockUntil,
        blocked: true,
        reason: `IP blocked until ${new Date(record.blockUntil).toISOString()}`
      };
    }
    
    // Reset counter if window expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + config.windowMs;
      record.blocked = false;
      record.blockUntil = 0;
    }
    
    // Check if limit exceeded
    if (record.count >= config.max) {
      // Block IP
      record.blocked = true;
      record.blockUntil = now + config.blockDuration;
      
      console.log(`🚫 IP ${ip} blocked for ${endpoint} (${config.blockDuration/1000}s)`);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.blockUntil,
        blocked: true,
        reason: `Rate limit exceeded. IP blocked for ${config.blockDuration/1000} seconds`
      };
    }
    
    // Increment counter
    record.count++;
    
    return {
      allowed: true,
      remaining: config.max - record.count,
      resetTime: record.resetTime,
      blocked: false
    };
  }

  /**
   * Check rate limit untuk username (login attempts)
   * @param {string} username - Username
   * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
   */
  checkUserLimit(username) {
    const now = Date.now();
    const config = this.limits.login; // Use login config for user limits
    
    // Get atau create user record
    if (!this.userAttempts.has(username)) {
      this.userAttempts.set(username, {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false,
        blockUntil: 0
      });
    }
    
    const record = this.userAttempts.get(username);
    
    // Check if currently blocked
    if (record.blocked && now < record.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.blockUntil,
        blocked: true,
        reason: `Username blocked until ${new Date(record.blockUntil).toISOString()}`
      };
    }
    
    // Reset counter if window expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + config.windowMs;
      record.blocked = false;
      record.blockUntil = 0;
    }
    
    // Check if limit exceeded
    if (record.count >= config.max) {
      // Block username
      record.blocked = true;
      record.blockUntil = now + config.blockDuration;
      
      console.log(`🚫 Username ${username} blocked for login (${config.blockDuration/1000}s)`);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.blockUntil,
        blocked: true,
        reason: `Too many failed login attempts. Username blocked for ${config.blockDuration/1000} seconds`
      };
    }
    
    // Increment counter
    record.count++;
    
    return {
      allowed: true,
      remaining: config.max - record.count,
      resetTime: record.resetTime,
      blocked: false
    };
  }

  /**
   * Reset rate limit untuk IP dan endpoint (untuk admin)
   * @param {string} ip - IP address
   * @param {string} endpoint - Endpoint name
   */
  resetIPLimit(ip, endpoint) {
    if (this.requests.has(ip) && this.requests.get(ip)[endpoint]) {
      delete this.requests.get(ip)[endpoint];
      console.log(`✅ Reset rate limit for IP ${ip} on ${endpoint}`);
    }
  }

  /**
   * Reset rate limit untuk username (untuk admin)
   * @param {string} username - Username
   */
  resetUserLimit(username) {
    if (this.userAttempts.has(username)) {
      this.userAttempts.delete(username);
      console.log(`✅ Reset rate limit for username ${username}`);
    }
  }

  /**
   * Get statistics untuk admin panel
   * @returns {Object} - Rate limiting statistics
   */
  getStats() {
    const now = Date.now();
    let totalIPs = 0;
    let blockedIPs = 0;
    let totalUsers = 0;
    let blockedUsers = 0;

    // Count IP stats
    for (const [ip, endpoints] of this.requests.entries()) {
      totalIPs++;
      for (const [endpoint, record] of Object.entries(endpoints)) {
        if (record.blocked && now < record.blockUntil) {
          blockedIPs++;
          break; // Count IP only once even if blocked on multiple endpoints
        }
      }
    }

    // Count user stats
    for (const [username, record] of this.userAttempts.entries()) {
      totalUsers++;
      if (record.blocked && now < record.blockUntil) {
        blockedUsers++;
      }
    }

    return {
      totalIPs,
      blockedIPs,
      totalUsers,
      blockedUsers,
      limits: this.limits
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    // Cleanup IP records
    for (const [ip, endpoints] of this.requests.entries()) {
      for (const [endpoint, record] of Object.entries(endpoints)) {
        if (now > record.resetTime && !record.blocked) {
          delete endpoints[endpoint];
          cleaned++;
        }
      }
      
      // Remove IP if no endpoints left
      if (Object.keys(endpoints).length === 0) {
        this.requests.delete(ip);
      }
    }

    // Cleanup user records
    for (const [username, record] of this.userAttempts.entries()) {
      if (now > record.resetTime && !record.blocked) {
        this.userAttempts.delete(username);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired rate limit entries`);
    }
  }
}

// Create singleton instance
const rateLimitService = new RateLimitService();

/**
 * Express middleware factory untuk rate limiting
 * @param {string} endpoint - Endpoint name (registration, login, api)
 * @returns {Function} - Express middleware
 */
function createRateLimit(endpoint) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Check IP rate limit
    const ipResult = rateLimitService.checkIPLimit(ip, endpoint);
    
    if (!ipResult.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: ipResult.reason,
        retryAfter: Math.ceil((ipResult.resetTime - Date.now()) / 1000)
      });
    }

    // For login endpoint, also check username rate limit
    if (endpoint === 'login' && req.body && req.body.username) {
      const userResult = rateLimitService.checkUserLimit(req.body.username);
      
      if (!userResult.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: userResult.reason,
          retryAfter: Math.ceil((userResult.resetTime - Date.now()) / 1000)
        });
      }
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': rateLimitService.limits[endpoint]?.max || 100,
      'X-RateLimit-Remaining': ipResult.remaining,
      'X-RateLimit-Reset': new Date(ipResult.resetTime).toISOString()
    });

    next();
  };
}

module.exports = {
  rateLimitService,
  createRateLimit,
  
  // Pre-configured middlewares
  registrationLimit: createRateLimit('registration'),
  loginLimit: createRateLimit('login'),
  apiLimit: createRateLimit('api')
};