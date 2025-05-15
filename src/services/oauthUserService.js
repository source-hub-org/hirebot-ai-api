/**
 * OAuth User Service
 * @module services/oauthUserService
 */

const logger = require('../utils/logger');

/**
 * Get a user by username and password
 * @param {string} username - The username to find
 * @param {string} password - The password to match
 * @returns {Promise<Object|null>} - The found user or null
 *
 * Note: This is a placeholder implementation. In a real application,
 * you would validate against your user database.
 */
const getUserByCredentials = async (username, password) => {
  try {
    // This is a placeholder implementation
    // In a real application, you would validate against your user database

    // For demonstration purposes, we'll accept a test user
    if (username === 'test' && password === 'password') {
      return {
        id: '1',
        username: 'test',
        // Don't include sensitive information like passwords
      };
    }

    logger.debug(`Invalid credentials for user: ${username}`);
    return null;
  } catch (error) {
    logger.error('Error getting user by credentials:', error);
    throw error;
  }
};

/**
 * Get a user by ID
 * @param {string} userId - The user ID to find
 * @returns {Promise<Object|null>} - The found user or null
 *
 * Note: This is a placeholder implementation. In a real application,
 * you would fetch from your user database.
 */
const getUserById = async userId => {
  try {
    // This is a placeholder implementation
    // In a real application, you would fetch from your user database

    // For demonstration purposes, we'll return a test user
    if (userId === '1') {
      return {
        id: '1',
        username: 'test',
        // Don't include sensitive information like passwords
      };
    }

    logger.debug(`User not found: ${userId}`);
    return null;
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    throw error;
  }
};

module.exports = {
  getUserByCredentials,
  getUserById,
};
