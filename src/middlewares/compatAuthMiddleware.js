/**
 * Compatibility Authentication Middleware
 * @module middlewares/compatAuthMiddleware
 *
 * This middleware provides compatibility between the old authentication system
 * and the new OAuth system, allowing both to work during the transition period.
 */

const { authenticate } = require('./oauthMiddleware');
const logger = require('../utils/logger');
const { attachUserFromToken, handleOAuthFailure, overrideResponseEnd } = require('./auth-utils');

/**
 * Handle successful OAuth authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleOAuthSuccess = async (req, res, next) => {
  // If a user is found from OAuth, attach it as loggedUser
  if (req.user) {
    req.loggedUser = req.user;
    next();
    return;
  }

  // If req.user is undefined, try to get user from the token
  await attachUserFromToken(req);

  // Continue to the next middleware regardless of whether we found a user
  next();
};

/**
 * Process OAuth authentication result
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {Object} responseHandler - Response handler with restore and oauthFailed methods
 * @param {Error} err - Error from OAuth authentication
 */
const processOAuthResult = async (req, res, next, responseHandler, err) => {
  // Restore the original end method
  responseHandler.restore();

  if (err) {
    // If there's an error, try the old auth method
    await handleOAuthFailure(req, res, next, err);
  } else if (!responseHandler.oauthFailed()) {
    // If OAuth succeeded, and we didn't already handle a failure
    await handleOAuthSuccess(req, res, next);
  }
};

/**
 * Middleware that tries OAuth authentication first, then falls back to the old method
 * @returns {Function} Express middleware function
 */
const compatAuthenticate = (options = {}) => {
  const oauthMiddleware = authenticate(options);

  return async (req, res, next) => {
    // Store the original end method to intercept 401 responses
    const originalEnd = res.end;

    // Override response end method to intercept 401 responses
    const responseHandler = overrideResponseEnd(req, res, next, originalEnd);

    try {
      // Try OAuth authentication first
      await oauthMiddleware(req, res, async err => {
        await processOAuthResult(req, res, next, responseHandler, err);
      });
    } catch (error) {
      // If OAuth throws an exception, try the old auth method
      logger.error('Error in OAuth authentication, trying legacy auth:', error);
      responseHandler.restore();
      await handleOAuthFailure(req, res, next, null);
    }
  };
};

module.exports = {
  compatAuthenticate,
};
