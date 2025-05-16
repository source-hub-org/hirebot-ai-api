/**
 * OAuth Middleware
 * @module middlewares/oauthMiddleware
 */

const { initializeOAuthServer } = require('../oauth/server');
const logger = require('../utils/logger');

// Initialize OAuth server
const oauthServer = initializeOAuthServer();

/**
 * Middleware to authenticate requests using OAuth
 * @param {Object} options - Options for the middleware
 * @param {boolean} options.required - Whether authentication is required (default: true)
 * @param {string|string[]} options.scope - Required scope(s) (optional)
 * @returns {Function} Express middleware function
 */
const authenticate = (options = {}) => {
  const { required = true, scope = null } = options;

  return async (req, res, next) => {
    try {
      // Use the OAuth server's authenticate middleware
      const authenticateMiddleware = oauthServer.authenticate({
        scope: scope,
      });

      // Handle the authentication
      authenticateMiddleware(req, res, err => {
        if (err) {
          // If authentication is not required, continue
          if (!required) {
            return next();
          }

          // Log the error
          logger.debug('OAuth authentication failed:', err.message);

          // Return an appropriate error response
          return res.status(401).json({
            status: 'error',
            message: 'Unauthorized',
            error: err.message,
          });
        }

        // Authentication successful
        next();
      });
    } catch (error) {
      logger.error('Error in OAuth authentication middleware:', error);

      // If authentication is not required, continue
      if (!required) {
        return next();
      }

      // Return an appropriate error response
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during authentication',
      });
    }
  };
};

module.exports = {
  authenticate,
};
