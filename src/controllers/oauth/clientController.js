/**
 * OAuth Client Controller
 * @module controllers/oauth/clientController
 */

const oauthClientService = require('../../services/oauthClientService');
const logger = require('../../utils/logger');

/**
 * Get all OAuth clients
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getClients = async (req, res, next) => {
  try {
    // This is a placeholder - in a real application, you would
    // implement a method to get all clients from the database

    // For now, we'll return a simple message
    return res.status(200).json({
      status: 'success',
      message: 'This endpoint would return all OAuth clients',
      // In a real implementation, you would return the clients here
    });
  } catch (error) {
    logger.error('Error getting OAuth clients:', error);
    next(error);
  }
};

/**
 * Create a new OAuth client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createClient = async (req, res, next) => {
  try {
    const { clientId, clientSecret, redirectUris, grants } = req.body;

    // Validate required fields
    if (!clientId || !clientSecret) {
      return res.status(400).json({
        status: 'error',
        message: 'Client ID and client secret are required',
      });
    }

    // Create the client
    const client = await oauthClientService.createClient({
      clientId,
      clientSecret,
      redirectUris: redirectUris || [],
      grants: grants || ['password', 'refresh_token'],
    });

    return res.status(201).json({
      status: 'success',
      message: 'OAuth client created successfully',
      data: {
        client: {
          id: client.id,
          redirectUris: client.redirectUris,
          grants: client.grants,
        },
      },
    });
  } catch (error) {
    logger.error('Error creating OAuth client:', error);

    // Handle duplicate client error
    if (error.status === 409) {
      return res.status(409).json({
        status: 'error',
        message: 'OAuth client already exists',
      });
    }

    next(error);
  }
};

/**
 * Get an OAuth client by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getClientById = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    const client = await oauthClientService.getClientById(clientId);

    if (!client) {
      return res.status(404).json({
        status: 'error',
        message: 'OAuth client not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        client: {
          id: client.id,
          redirectUris: client.redirectUris,
          grants: client.grants,
        },
      },
    });
  } catch (error) {
    logger.error('Error getting OAuth client:', error);
    next(error);
  }
};

/**
 * Update an OAuth client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateClient = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { redirectUris, grants } = req.body;

    // Update the client
    const client = await oauthClientService.updateClient(clientId, {
      redirectUris,
      grants,
    });

    if (!client) {
      return res.status(404).json({
        status: 'error',
        message: 'OAuth client not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'OAuth client updated successfully',
      data: {
        client: {
          id: client.id,
          redirectUris: client.redirectUris,
          grants: client.grants,
        },
      },
    });
  } catch (error) {
    logger.error('Error updating OAuth client:', error);
    next(error);
  }
};

/**
 * Delete an OAuth client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteClient = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    const deleted = await oauthClientService.deleteClient(clientId);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'OAuth client not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'OAuth client deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting OAuth client:', error);
    next(error);
  }
};

module.exports = {
  getClients,
  createClient,
  getClientById,
  updateClient,
  deleteClient,
};
