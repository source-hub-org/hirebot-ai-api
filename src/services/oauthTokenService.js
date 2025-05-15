/**
 * OAuth Token Service
 * @module services/oauthTokenService
 */

const oauthTokenRepository = require('../repository/oauthTokenRepository');
const logger = require('../utils/logger');

/**
 * Save an access token
 * @param {Object} token - The token object to save
 * @param {Object} client - The client object
 * @param {Object} user - The user object
 * @returns {Promise<Object>} - The saved token
 */
const saveAccessToken = async (token, client, user) => {
  try {
    const tokenData = {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      client: client,
      user: user,
      scope: token.scope,
    };

    await oauthTokenRepository.saveAccessToken(tokenData);

    return tokenData;
  } catch (error) {
    logger.error('Error saving access token:', error);
    throw error;
  }
};

/**
 * Get an access token
 * @param {string} accessToken - The access token to find
 * @returns {Promise<Object|null>} - The found token or null
 */
const getAccessToken = async accessToken => {
  try {
    const token = await oauthTokenRepository.getAccessToken(accessToken);

    if (!token) {
      logger.debug(`Access token not found: ${accessToken}`);
      return null;
    }

    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      client: token.client,
      user: token.user,
      scope: token.scope,
    };
  } catch (error) {
    logger.error('Error getting access token:', error);
    throw error;
  }
};

/**
 * Revoke an access token
 * @param {string} accessToken - The access token to revoke
 * @returns {Promise<boolean>} - True if token was revoked, false otherwise
 */
const revokeAccessToken = async accessToken => {
  try {
    return await oauthTokenRepository.revokeAccessToken(accessToken);
  } catch (error) {
    logger.error('Error revoking access token:', error);
    throw error;
  }
};

/**
 * Save a refresh token
 * @param {Object} token - The token object to save
 * @param {Object} client - The client object
 * @param {Object} user - The user object
 * @returns {Promise<Object>} - The saved token
 */
const saveRefreshToken = async (token, client, user) => {
  try {
    const tokenData = {
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      client: client,
      user: user,
      scope: token.scope,
    };

    await oauthTokenRepository.saveRefreshToken(tokenData);

    return tokenData;
  } catch (error) {
    logger.error('Error saving refresh token:', error);
    throw error;
  }
};

/**
 * Get a refresh token
 * @param {string} refreshToken - The refresh token to find
 * @returns {Promise<Object|null>} - The found token or null
 */
const getRefreshToken = async refreshToken => {
  try {
    const token = await oauthTokenRepository.getRefreshToken(refreshToken);

    if (!token) {
      logger.debug(`Refresh token not found: ${refreshToken}`);
      return null;
    }

    return {
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      client: token.client,
      user: token.user,
      scope: token.scope,
    };
  } catch (error) {
    logger.error('Error getting refresh token:', error);
    throw error;
  }
};

/**
 * Revoke a refresh token
 * @param {string} refreshToken - The refresh token to revoke
 * @returns {Promise<boolean>} - True if token was revoked, false otherwise
 */
const revokeRefreshToken = async refreshToken => {
  try {
    return await oauthTokenRepository.revokeRefreshToken(refreshToken);
  } catch (error) {
    logger.error('Error revoking refresh token:', error);
    throw error;
  }
};

/**
 * Save an authorization code
 * @param {Object} code - The authorization code object to save
 * @param {Object} client - The client object
 * @param {Object} user - The user object
 * @returns {Promise<Object>} - The saved authorization code
 */
const saveAuthorizationCode = async (code, client, user) => {
  try {
    const codeData = {
      authorizationCode: code.authorizationCode,
      authorizationCodeExpiresAt: code.authorizationCodeExpiresAt,
      client: client,
      user: user,
      scope: code.scope,
      redirectUri: code.redirectUri,
    };

    await oauthTokenRepository.saveAuthorizationCode(codeData);

    return codeData;
  } catch (error) {
    logger.error('Error saving authorization code:', error);
    throw error;
  }
};

/**
 * Get an authorization code
 * @param {string} authorizationCode - The authorization code to find
 * @returns {Promise<Object|null>} - The found authorization code or null
 */
const getAuthorizationCode = async authorizationCode => {
  try {
    const code = await oauthTokenRepository.getAuthorizationCode(authorizationCode);

    if (!code) {
      logger.debug(`Authorization code not found: ${authorizationCode}`);
      return null;
    }

    return {
      authorizationCode: code.authorizationCode,
      authorizationCodeExpiresAt: code.authorizationCodeExpiresAt,
      client: code.client,
      user: code.user,
      scope: code.scope,
      redirectUri: code.redirectUri,
    };
  } catch (error) {
    logger.error('Error getting authorization code:', error);
    throw error;
  }
};

/**
 * Revoke an authorization code
 * @param {string} authorizationCode - The authorization code to revoke
 * @returns {Promise<boolean>} - True if code was revoked, false otherwise
 */
const revokeAuthorizationCode = async authorizationCode => {
  try {
    return await oauthTokenRepository.revokeAuthorizationCode(authorizationCode);
  } catch (error) {
    logger.error('Error revoking authorization code:', error);
    throw error;
  }
};

module.exports = {
  saveAccessToken,
  getAccessToken,
  revokeAccessToken,
  saveRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
  saveAuthorizationCode,
  getAuthorizationCode,
  revokeAuthorizationCode,
};
