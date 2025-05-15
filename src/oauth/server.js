/**
 * OAuth Server Initialization
 * @module oauth/server
 */

const OAuthServer = require('express-oauth-server');
const oauthModel = require('./models');
const { getOAuthConfig } = require('../config/oauthConfig');
const logger = require('../utils/logger');

/**
 * Initialize the OAuth server
 * @returns {OAuthServer} - The configured OAuth server instance
 */
const initializeOAuthServer = () => {
  try {
    const config = getOAuthConfig();

    logger.info('Initializing OAuth server with configuration:', config);

    // Create and return the OAuth server instance
    return new OAuthServer({
      model: oauthModel,
      accessTokenLifetime: config.accessTokenLifetime,
      refreshTokenLifetime: config.refreshTokenLifetime,
      authorizationCodeLifetime: config.authorizationCodeLifetime,
      allowBearerTokensInQueryString: config.allowBearerTokensInQueryString,
      allowExtendedTokenAttributes: config.allowExtendedTokenAttributes,
      requireClientAuthentication: config.requireClientAuthentication,
    });
  } catch (error) {
    logger.error('Error initializing OAuth server:', error);
    throw error;
  }
};

module.exports = {
  initializeOAuthServer,
};
