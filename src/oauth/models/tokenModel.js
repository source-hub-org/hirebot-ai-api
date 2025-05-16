/**
 * OAuth Token Model Functions
 * @module oauth/models/tokenModel
 */

const oauthTokenService = require('../../services/oauthTokenService');
const logger = require('../../utils/logger');

/**
 * Get an access token
 * @param {string} accessToken - The access token to find
 * @returns {Promise<Object|null>} - The found token or null
 */
const getAccessToken = async accessToken => {
  try {
    return await oauthTokenService.getAccessToken(accessToken);
  } catch (error) {
    logger.error('Error in getAccessToken OAuth model function:', error);
    throw error;
  }
};

/**
 * Get a refresh token
 * @param {string} refreshToken - The refresh token to find
 * @returns {Promise<Object|null>} - The found token or null
 */
const getRefreshToken = async refreshToken => {
  try {
    return await oauthTokenService.getRefreshToken(refreshToken);
  } catch (error) {
    logger.error('Error in getRefreshToken OAuth model function:', error);
    throw error;
  }
};

/**
 * Revoke a refresh token
 * @param {Object} token - The token object to revoke
 * @returns {Promise<boolean>} - True if token was revoked, false otherwise
 */
const revokeToken = async token => {
  try {
    return await oauthTokenService.revokeRefreshToken(token.refreshToken);
  } catch (error) {
    logger.error('Error in revokeToken OAuth model function:', error);
    throw error;
  }
};

/**
 * Save a token
 * @param {Object} token - The token object to save
 * @param {Object} client - The client object
 * @param {Object} user - The user object
 * @returns {Promise<Object>} - The saved token
 */
const saveToken = async (token, client, user) => {
  try {
    // Save access token
    if (token.accessToken) {
      await oauthTokenService.saveAccessToken(token, client, user);
    }

    // Save refresh token if present
    if (token.refreshToken) {
      await oauthTokenService.saveRefreshToken(token, client, user);
    }

    // Return the token with client and user for OAuth server
    return {
      ...token,
      client,
      user,
    };
  } catch (error) {
    logger.error('Error in saveToken OAuth model function:', error);
    throw error;
  }
};

module.exports = {
  getAccessToken,
  getRefreshToken,
  revokeToken,
  saveToken,
};
