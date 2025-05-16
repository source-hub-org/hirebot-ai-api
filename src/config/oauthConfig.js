/**
 * OAuth2 Configuration Module
 * @module config/oauthConfig
 */

require('dotenv').config();
const logger = require('../utils/logger');

/**
 * Default OAuth2 configuration values if environment variables are not set
 * @constant {Object}
 */
const DEFAULT_OAUTH_CONFIG = {
  accessTokenLifetime: 3600, // 1 hour in seconds
  refreshTokenLifetime: 1209600, // 14 days in seconds
  authorizationCodeLifetime: 300, // 5 minutes in seconds
  allowBearerTokensInQueryString: false,
  allowExtendedTokenAttributes: false,
  requireClientAuthentication: {
    password: true,
    refresh_token: true,
    authorization_code: true,
  },
};

/**
 * Get OAuth2 configuration from environment variables or fallback to defaults
 * @returns {Object} - OAuth2 configuration object
 */
const getOAuthConfig = () => {
  return {
    accessTokenLifetime:
      parseInt(process.env.OAUTH_ACCESS_TOKEN_LIFETIME) || DEFAULT_OAUTH_CONFIG.accessTokenLifetime,
    refreshTokenLifetime:
      parseInt(process.env.OAUTH_REFRESH_TOKEN_LIFETIME) ||
      DEFAULT_OAUTH_CONFIG.refreshTokenLifetime,
    authorizationCodeLifetime:
      parseInt(process.env.OAUTH_AUTHORIZATION_CODE_LIFETIME) ||
      DEFAULT_OAUTH_CONFIG.authorizationCodeLifetime,
    allowBearerTokensInQueryString:
      process.env.OAUTH_ALLOW_BEARER_TOKENS_IN_QUERY === 'true' ||
      DEFAULT_OAUTH_CONFIG.allowBearerTokensInQueryString,
    allowExtendedTokenAttributes:
      process.env.OAUTH_ALLOW_EXTENDED_TOKEN_ATTRIBUTES === 'true' ||
      DEFAULT_OAUTH_CONFIG.allowExtendedTokenAttributes,
    requireClientAuthentication: {
      password:
        process.env.OAUTH_REQUIRE_CLIENT_AUTH_PASSWORD === 'false'
          ? false
          : DEFAULT_OAUTH_CONFIG.requireClientAuthentication.password,
      refresh_token:
        process.env.OAUTH_REQUIRE_CLIENT_AUTH_REFRESH_TOKEN === 'false'
          ? false
          : DEFAULT_OAUTH_CONFIG.requireClientAuthentication.refresh_token,
      authorization_code:
        process.env.OAUTH_REQUIRE_CLIENT_AUTH_AUTHORIZATION_CODE === 'false'
          ? false
          : DEFAULT_OAUTH_CONFIG.requireClientAuthentication.authorization_code,
    },
  };
};

/**
 * Get client credentials from environment variables
 * @returns {Array} - Array of client credentials objects
 */
const getClientCredentials = () => {
  const clientsString = process.env.OAUTH_CLIENTS;

  if (!clientsString) {
    logger.warn('No OAuth clients defined in environment variables, using default test client');
    return [
      {
        id: process.env.OAUTH_DEFAULT_CLIENT_ID || 'test-client',
        secret: process.env.OAUTH_DEFAULT_CLIENT_SECRET || 'test-secret',
        grants: ['password', 'refresh_token', 'authorization_code'],
        redirectUris: [
          process.env.OAUTH_DEFAULT_REDIRECT_URI || 'http://localhost:3000/oauth/callback',
        ],
      },
    ];
  }

  try {
    return JSON.parse(clientsString);
  } catch (error) {
    logger.error('Failed to parse OAUTH_CLIENTS environment variable:', error);
    return [
      {
        id: process.env.OAUTH_DEFAULT_CLIENT_ID || 'test-client',
        secret: process.env.OAUTH_DEFAULT_CLIENT_SECRET || 'test-secret',
        grants: ['password', 'refresh_token', 'authorization_code'],
        redirectUris: [
          process.env.OAUTH_DEFAULT_REDIRECT_URI || 'http://localhost:3000/oauth/callback',
        ],
      },
    ];
  }
};

module.exports = {
  getOAuthConfig,
  getClientCredentials,
  DEFAULT_OAUTH_CONFIG,
};
