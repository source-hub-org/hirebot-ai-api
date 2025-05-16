/**
 * OAuth User Service
 * @module services/oauthUserService
 */

const userService = require('./userService');
const logger = require('../utils/logger');

/**
 * Get a user by username and password
 * @param {string} username - The username to find
 * @param {string} password - The password to match
 * @returns {Promise<Object|null>} - The found user or null
 */
const getUserByCredentials = async (username, password) => {
  try {
    // Use the user service to validate credentials
    const user = await userService.validateUserCredentials(username, password);

    if (!user) {
      logger.debug(`Invalid credentials for user: ${username}`);
      return null;
    }

    // Return user in the format expected by OAuth
    return {
      id: user._id.toString(),
      username: user.username,
      // Don't include sensitive information like passwords
    };
  } catch (error) {
    logger.error('Error getting user by credentials:', error);
    throw error;
  }
};

/**
 * Get a user by ID
 * @param {string} userId - The user ID to find
 * @returns {Promise<Object|null>} - The found user or null
 */
const getUserById = async userId => {
  try {
    // Use the user service to get user by ID
    const user = await userService.getUserById(userId);

    if (!user) {
      logger.debug(`User not found: ${userId}`);
      return null;
    }

    // Return user in the format expected by OAuth
    return {
      id: user._id.toString(),
      username: user.username,
      // Don't include sensitive information like passwords
    };
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    throw error;
  }
};

module.exports = {
  getUserByCredentials,
  getUserById,
};
