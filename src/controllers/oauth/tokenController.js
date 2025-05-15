/**
 * OAuth Token Controller
 * @module controllers/oauth/tokenController
 */

const logger = require('../../utils/logger');

/**
 * Handle token requests (token endpoint)
 * This controller is used with the OAuth server's token middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleTokenRequest = (req, res, next) => {
  // The actual token generation is handled by the OAuth server middleware
  // This controller is just a placeholder for any additional logic

  // Check if req.body exists
  if (!req.body) {
    logger.error('Request body is undefined');
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Request body is missing',
    });
  }

  // Log the token request (without sensitive data)
  logger.debug('Token request received', {
    grant_type: req.body.grant_type || 'undefined',
    client_id: req.body.client_id || 'undefined',
    // Don't log client_secret, username, password, etc.
  });

  // The response will be handled by the OAuth server middleware
  next();
};

/**
 * Handle token revocation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleTokenRevocation = (req, res, next) => {
  // The actual token revocation is handled by the OAuth server middleware
  // This controller is just a placeholder for any additional logic

  // Check if req.body exists
  if (!req.body) {
    logger.error('Request body is undefined');
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Request body is missing',
    });
  }

  // Log the token revocation request (without sensitive data)
  logger.debug('Token revocation request received', {
    token_type_hint: req.body.token_type_hint || 'undefined',
    client_id: req.body.client_id || 'undefined',
    // Don't log client_secret, token, etc.
  });

  // The response will be handled by the OAuth server middleware
  next();
};

module.exports = {
  handleTokenRequest,
  handleTokenRevocation,
};
