/**
 * OAuth Authorization Code Model Functions
 * @module oauth/models/authCodeModel
 */

const oauthTokenService = require('../../services/oauthTokenService');
const logger = require('../../utils/logger');

/**
 * Get an authorization code
 * @param {string} authorizationCode - The authorization code to find
 * @returns {Promise<Object|null>} - The found authorization code or null
 */
const getAuthorizationCode = async authorizationCode => {
  try {
    return await oauthTokenService.getAuthorizationCode(authorizationCode);
  } catch (error) {
    logger.error('Error in getAuthorizationCode OAuth model function:', error);
    throw error;
  }
};

/**
 * Save an authorization code
 * @param {Object} code - The authorization code object to save
 * @param {Object} client - The client object
 * @param {Object} user - The user object
 * @returns {Promise<Object>} - The saved authorization code
 */
const saveAuthorizationCode = async (code, client, user) => {
  try {
    return await oauthTokenService.saveAuthorizationCode(code, client, user);
  } catch (error) {
    logger.error('Error in saveAuthorizationCode OAuth model function:', error);
    throw error;
  }
};

/**
 * Revoke an authorization code
 * @param {Object} code - The authorization code object to revoke
 * @returns {Promise<boolean>} - True if code was revoked, false otherwise
 */
const revokeAuthorizationCode = async code => {
  try {
    return await oauthTokenService.revokeAuthorizationCode(code.authorizationCode);
  } catch (error) {
    logger.error('Error in revokeAuthorizationCode OAuth model function:', error);
    throw error;
  }
};

module.exports = {
  getAuthorizationCode,
  saveAuthorizationCode,
  revokeAuthorizationCode,
};
