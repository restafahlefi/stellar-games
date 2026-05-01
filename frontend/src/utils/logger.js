/**
 * Logger Utility
 * Conditional logging based on environment
 * - Development: All logs enabled
 * - Production: Only errors enabled
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log general information (disabled in production)
   */
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always enabled)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Log warnings (disabled in production)
   */
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log debug information (disabled in production)
   */
  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Log info (disabled in production)
   */
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  }
};

export default logger;
