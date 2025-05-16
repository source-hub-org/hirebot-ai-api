/**
 * OAuth Client Repository
 * @module repository/oauthClientRepository
 */

const OAuthClient = require('../models/oauthClientModel');
const { getClientCredentials } = require('../config/oauthConfig');
const logger = require('../utils/logger');

/**
 * Initialize OAuth clients in the database from environment variables
 * @returns {Promise<void>}
 */
const initializeOAuthClients = async () => {
  try {
    const clients = getClientCredentials();

    // Check if clients already exist
    for (const client of clients) {
      const existingClient = await OAuthClient.findOne({ clientId: client.id });

      if (!existingClient) {
        // Create new client
        const newClient = new OAuthClient({
          clientId: client.id,
          clientSecret: client.secret,
          redirectUris: client.redirectUris || [],
          grants: client.grants || ['password', 'refresh_token'],
          accessTokenLifetime: client.accessTokenLifetime,
          refreshTokenLifetime: client.refreshTokenLifetime,
        });

        await newClient.save();
        logger.info(`OAuth client created: ${client.id}`);
      } else {
        logger.debug(`OAuth client already exists: ${client.id}`);
      }
    }
  } catch (error) {
    logger.error('Error initializing OAuth clients:', error);
    throw error;
  }
};

/**
 * Get a client by client ID
 * @param {string} clientId - The client ID to find
 * @returns {Promise<Object|null>} - The found client or null
 */
const getClientById = async clientId => {
  try {
    return await OAuthClient.findOne({ clientId });
  } catch (error) {
    logger.error('Error getting OAuth client:', error);
    throw error;
  }
};

/**
 * Get a client by client ID and secret
 * @param {string} clientId - The client ID to find
 * @param {string} clientSecret - The client secret to match
 * @returns {Promise<Object|null>} - The found client or null
 */
const getClientByIdAndSecret = async (clientId, clientSecret) => {
  try {
    return await OAuthClient.findOne({ clientId, clientSecret });
  } catch (error) {
    logger.error('Error getting OAuth client by ID and secret:', error);
    throw error;
  }
};

/**
 * Create a new OAuth client
 * @param {Object} clientData - The client data to create
 * @returns {Promise<Object>} - The created client
 */
const createClient = async clientData => {
  try {
    const client = new OAuthClient({
      clientId: clientData.clientId,
      clientSecret: clientData.clientSecret,
      redirectUris: clientData.redirectUris || [],
      grants: clientData.grants || ['password', 'refresh_token'],
      accessTokenLifetime: clientData.accessTokenLifetime,
      refreshTokenLifetime: clientData.refreshTokenLifetime,
    });

    return await client.save();
  } catch (error) {
    logger.error('Error creating OAuth client:', error);
    throw error;
  }
};

/**
 * Update an existing OAuth client
 * @param {string} clientId - The client ID to update
 * @param {Object} clientData - The client data to update
 * @returns {Promise<Object|null>} - The updated client or null
 */
const updateClient = async (clientId, clientData) => {
  try {
    const updateData = {
      ...clientData,
      updatedAt: new Date(),
    };

    return await OAuthClient.findOneAndUpdate({ clientId }, updateData, { new: true });
  } catch (error) {
    logger.error('Error updating OAuth client:', error);
    throw error;
  }
};

/**
 * Delete an OAuth client
 * @param {string} clientId - The client ID to delete
 * @returns {Promise<boolean>} - True if client was deleted, false otherwise
 */
const deleteClient = async clientId => {
  try {
    const result = await OAuthClient.deleteOne({ clientId });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error('Error deleting OAuth client:', error);
    throw error;
  }
};

module.exports = {
  initializeOAuthClients,
  getClientById,
  getClientByIdAndSecret,
  createClient,
  updateClient,
  deleteClient,
};
