/**
 * OAuth Client Model Functions
 * @module oauth/models/clientModel
 */

const oauthClientService = require('../../services/oauthClientService');
const logger = require('../../utils/logger');

/**
 * Get a client by client ID and secret
 * @param {string} clientId - The client ID to find
 * @param {string} clientSecret - The client secret to match
 * @returns {Promise<Object|null>} - The found client or null
 */
const getClient = async (clientId, clientSecret) => {
  try {
    // If clientSecret is provided, validate both ID and secret
    if (clientSecret) {
      return await oauthClientService.getClientByIdAndSecret(clientId, clientSecret);
    }

    // Otherwise, just validate the ID
    return await oauthClientService.getClientById(clientId);
  } catch (error) {
    logger.error('Error in getClient OAuth model function:', error);
    throw error;
  }
};

module.exports = {
  getClient,
};
