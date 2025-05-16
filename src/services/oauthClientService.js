/**
 * OAuth Client Service
 * @module services/oauthClientService
 */

const oauthClientRepository = require('../repository/oauthClientRepository');
const logger = require('../utils/logger');

/**
 * Initialize OAuth clients in the database
 * @returns {Promise<void>}
 */
const initializeOAuthClients = async () => {
  try {
    await oauthClientRepository.initializeOAuthClients();
    logger.info('OAuth clients initialized');
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
    const client = await oauthClientRepository.getClientById(clientId);

    if (!client) {
      logger.debug(`OAuth client not found: ${clientId}`);
      return null;
    }

    // Format client for OAuth server
    return {
      id: client.clientId,
      redirectUris: client.redirectUris,
      grants: client.grants,
      accessTokenLifetime: client.accessTokenLifetime,
      refreshTokenLifetime: client.refreshTokenLifetime,
    };
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
    const client = await oauthClientRepository.getClientByIdAndSecret(clientId, clientSecret);

    if (!client) {
      logger.debug(`OAuth client not found or secret doesn't match: ${clientId}`);
      return null;
    }

    // Format client for OAuth server
    return {
      id: client.clientId,
      redirectUris: client.redirectUris,
      grants: client.grants,
      accessTokenLifetime: client.accessTokenLifetime,
      refreshTokenLifetime: client.refreshTokenLifetime,
    };
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
    // Check if client already exists
    const existingClient = await oauthClientRepository.getClientById(clientData.clientId);

    if (existingClient) {
      const error = new Error(`OAuth client already exists: ${clientData.clientId}`);
      error.status = 409; // Conflict
      throw error;
    }

    const client = await oauthClientRepository.createClient(clientData);

    // Format client for response
    return {
      id: client.clientId,
      redirectUris: client.redirectUris,
      grants: client.grants,
      accessTokenLifetime: client.accessTokenLifetime,
      refreshTokenLifetime: client.refreshTokenLifetime,
      createdAt: client.createdAt,
    };
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
    // Check if client exists
    const existingClient = await oauthClientRepository.getClientById(clientId);

    if (!existingClient) {
      logger.debug(`OAuth client not found for update: ${clientId}`);
      return null;
    }

    const client = await oauthClientRepository.updateClient(clientId, clientData);

    // Format client for response
    return {
      id: client.clientId,
      redirectUris: client.redirectUris,
      grants: client.grants,
      accessTokenLifetime: client.accessTokenLifetime,
      refreshTokenLifetime: client.refreshTokenLifetime,
      updatedAt: client.updatedAt,
    };
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
    return await oauthClientRepository.deleteClient(clientId);
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
