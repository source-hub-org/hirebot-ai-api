/**
 * Authentication Middleware
 * @module middlewares/authMiddleware
 */

const { getAccessToken } = require('../services/oauthTokenService');
const logger = require('../utils/logger');

/**
 * Middleware to verify access token for protected routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyAccessToken = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    // Check if authorization header exists
    if (!authHeader) {
      logger.debug('Authorization header missing');
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'Access token is required',
      });
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.debug('Invalid authorization header format');
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'Invalid token format',
      });
    }

    const accessToken = parts[1];

    // Verify the access token
    const token = await getAccessToken(accessToken);

    // Check if token exists and is valid
    if (!token) {
      logger.debug('Invalid access token');
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'Invalid access token',
      });
    }

    // Check if the token is expired
    if (token.accessTokenExpiresAt < new Date()) {
      logger.debug('Access token expired');
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'Access token expired',
      });
    }

    // Add user and client info to request object
    req.user = token.user;
    req.client = token.client;
    req.scope = token.scope;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    logger.error('Error verifying access token:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred while verifying the access token',
    });
  }
};

/**
 * Middleware to verify access token with specific scope
 * @param {string} requiredScope - The required scope
 * @returns {Function} - Middleware function
 */
const verifyScope = requiredScope => {
  return async (req, res, next) => {
    try {
      // First verify the access token
      await verifyAccessToken(req, res, err => {
        if (err) return next(err);

        // Check if token has the required scope
        const tokenScopes = req.scope ? req.scope.split(' ') : [];

        if (!tokenScopes.includes(requiredScope)) {
          logger.debug(`Missing required scope: ${requiredScope}`);
          return res.status(403).json({
            error: 'insufficient_scope',
            error_description: `Scope '${requiredScope}' is required`,
          });
        }

        // Continue to the next middleware or route handler
        next();
      });
    } catch (error) {
      logger.error('Error verifying scope:', error);
      return res.status(500).json({
        error: 'server_error',
        error_description: 'An error occurred while verifying the token scope',
      });
    }
  };
};

/**
 * Middleware to make authentication optional
 * If a valid token is provided, user info will be added to the request
 * If no token or invalid token is provided, the request will continue without authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    // If no authorization header, continue without authentication
    if (!authHeader) {
      return next();
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const accessToken = parts[1];

    // Verify the access token
    const token = await getAccessToken(accessToken);

    // If token exists and is valid, add user info to request
    if (token && token.accessTokenExpiresAt >= new Date()) {
      req.user = token.user;
      req.client = token.client;
      req.scope = token.scope;
    }

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // In case of error, continue without authentication
    logger.error('Error in optional authentication:', error);
    next();
  }
};

module.exports = {
  verifyAccessToken,
  verifyScope,
  optionalAuth,
};
