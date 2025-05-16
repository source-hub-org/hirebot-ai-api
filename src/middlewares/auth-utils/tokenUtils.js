/**
 * Token Utilities for Authentication
 * @module middlewares/auth-utils/tokenUtils
 */

const logger = require('../../utils/logger');
const userService = require('../../services/userService');
const { getAccessToken } = require('../../services/oauthTokenService');

/**
 * Extract access token from authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} - The access token or null if not found
 */
const extractAccessToken = req => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  return null;
};

/**
 * Get user from access token
 * @param {string} accessToken - The access token
 * @returns {Object|null} - User object or null if not found
 */
const getUserFromToken = async accessToken => {
  try {
    const token = await getAccessToken(accessToken);

    if (!token || !token.user) {
      return null;
    }

    const userId = token.user._id || token.user.id;
    if (!userId) {
      return null;
    }

    return await userService.getUserById(userId);
  } catch (error) {
    logger.error('Error getting user from token:', error);
    return null;
  }
};

/**
 * Attach user to request if token is valid
 * @param {Object} req - Express request object
 * @returns {Promise<boolean>} - True if user was attached, false otherwise
 */
const attachUserFromToken = async req => {
  const accessToken = extractAccessToken(req);

  if (!accessToken) {
    return false;
  }

  const user = await getUserFromToken(accessToken);

  if (user) {
    req.loggedUser = user;
    return true;
  }

  return false;
};

module.exports = {
  extractAccessToken,
  getUserFromToken,
  attachUserFromToken,
};
