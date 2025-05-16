/**
 * Compatibility Authentication Middleware
 * @module middlewares/compatAuthMiddleware
 *
 * This middleware provides compatibility between the old authentication system
 * and the new OAuth system, allowing both to work during the transition period.
 */

const { authenticate } = require('./oauthMiddleware');
const { verifyAccessToken } = require('./authMiddleware');
const logger = require('../utils/logger');

/**
 * Middleware that tries OAuth authentication first, then falls back to the old method
 * @returns {Function} Express middleware function
 */
const compatAuthenticate = (options = {}) => {
  const oauthMiddleware = authenticate(options);

  return async (req, res, next) => {
    // Store the original end method to intercept 401 responses
    const originalEnd = res.end;
    let oauthFailed = false;

    // Override res.end to detect OAuth authentication failure
    res.end = function (chunk, encoding) {
      // If OAuth middleware returned a 401, we'll try the old auth method
      if (res.statusCode === 401) {
        oauthFailed = true;
        // Restore original end method
        res.end = originalEnd;
        // Reset response
        res.statusCode = 200;
        // Try old authentication method
        verifyAccessToken(req, res, next);
      } else {
        // If not a 401, just proceed normally
        res.end = originalEnd;
        res.end(chunk, encoding);
      }
    };

    try {
      // Try OAuth authentication first
      oauthMiddleware(req, res, err => {
        if (err) {
          // If there's an error, try the old auth method
          logger.debug('OAuth authentication failed, trying legacy auth:', err.message);
          // Restore original end method
          res.end = originalEnd;
          // Try old authentication method
          verifyAccessToken(req, res, next);
        } else if (!oauthFailed) {
          // If OAuth succeeded and we didn't already handle a failure
          // Restore original end method
          res.end = originalEnd;
          // Continue to the next middleware
          next();
        }
      });
    } catch (error) {
      // If OAuth throws an exception, try the old auth method
      logger.error('Error in OAuth authentication, trying legacy auth:', error);
      // Restore original end method
      res.end = originalEnd;
      // Try old authentication method
      verifyAccessToken(req, res, next);
    }
  };
};

module.exports = {
  compatAuthenticate,
};
