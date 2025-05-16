/**
 * OAuth User Model Functions
 * @module oauth/models/userModel
 */

const oauthUserService = require('../../services/oauthUserService');
const logger = require('../../utils/logger');

/**
 * Get a user by username and password
 * @param {string} username - The username to find
 * @param {string} password - The password to match
 * @returns {Promise<Object|null>} - The found user or null
 */
const getUser = async (username, password) => {
  try {
    return await oauthUserService.getUserByCredentials(username, password);
  } catch (error) {
    logger.error('Error in getUser OAuth model function:', error);
    throw error;
  }
};

module.exports = {
  getUser,
};
