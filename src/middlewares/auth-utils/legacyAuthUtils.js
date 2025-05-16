/**
 * Legacy Authentication Utilities
 * @module middlewares/auth-utils/legacyAuthUtils
 */

const { verifyAccessToken } = require('../authMiddleware');
const logger = require('../../utils/logger');

/**
 * Attempt legacy authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Function>} - Promise that resolves with next function to call
 */
const attemptLegacyAuth = (req, res) => {
  return new Promise(resolve => {
    verifyAccessToken(req, res, err => {
      if (!err && req.user) {
        // If token is valid and user is found, attach it as loggedUser
        req.loggedUser = req.user;
      }
      resolve(err);
    });
  });
};

/**
 * Handle OAuth failure by trying legacy authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {Error} error - Error from OAuth authentication
 */
const handleOAuthFailure = async (req, res, next, error) => {
  if (error) {
    logger.debug('OAuth authentication failed, trying legacy auth:', error.message);
  } else {
    logger.debug('OAuth authentication failed, trying legacy auth');
  }

  const err = await attemptLegacyAuth(req, res);
  next(err);
};

module.exports = {
  attemptLegacyAuth,
  handleOAuthFailure,
};
