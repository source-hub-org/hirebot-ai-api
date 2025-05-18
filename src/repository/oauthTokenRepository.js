/**
 * OAuth Token Repository
 * @module repository/oauthTokenRepository
 */

const {
  OAuthAccessToken,
  OAuthRefreshToken,
  OAuthAuthorizationCode,
} = require('../models/oauthTokenModel');
const logger = require('../utils/logger');

/**
 * Save an access token
 * @param {Object} token - The token object to save
 * @returns {Promise<Object>} - The saved token
 */
const saveAccessToken = async token => {
  try {
    const accessToken = new OAuthAccessToken(token);
    await accessToken.save();
    return accessToken;
  } catch (error) {
    logger.error('Error saving access token to database:', error);
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
    const token = await OAuthAccessToken.findOne({ accessToken });

    // If token exists and has a user with an _id, try to populate the candidate_id
    if (token && token.user && token.user._id) {
      // Get the User model
      const User = require('../models/userModel');

      // Find the user with populated candidate_id
      const user = await User.findById(token.user._id).populate('candidate_id').exec();

      // If user is found, update the token's user object with the populated user
      if (user) {
        const userObj = user.toObject();

        // Add candidate field with the populated candidate data
        if (userObj.candidate_id) {
          userObj.candidate = userObj.candidate_id;
          // Keep candidate_id as just the ID
          userObj.candidate_id = userObj.candidate_id._id;
        }

        token.user = userObj;
      }
    }

    return token;
  } catch (error) {
    logger.error('Error getting access token from database:', error);
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
    const result = await OAuthAccessToken.deleteOne({ accessToken });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error('Error revoking access token from database:', error);
    throw error;
  }
};

/**
 * Save a refresh token
 * @param {Object} token - The token object to save
 * @returns {Promise<Object>} - The saved token
 */
const saveRefreshToken = async token => {
  try {
    const refreshToken = new OAuthRefreshToken(token);
    await refreshToken.save();
    return refreshToken;
  } catch (error) {
    logger.error('Error saving refresh token to database:', error);
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
    return await OAuthRefreshToken.findOne({ refreshToken });
  } catch (error) {
    logger.error('Error getting refresh token from database:', error);
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
    const result = await OAuthRefreshToken.deleteOne({ refreshToken });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error('Error revoking refresh token from database:', error);
    throw error;
  }
};

/**
 * Save an authorization code
 * @param {Object} code - The authorization code object to save
 * @returns {Promise<Object>} - The saved authorization code
 */
const saveAuthorizationCode = async code => {
  try {
    const authCode = new OAuthAuthorizationCode(code);
    await authCode.save();
    return authCode;
  } catch (error) {
    logger.error('Error saving authorization code to database:', error);
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
    return await OAuthAuthorizationCode.findOne({ authorizationCode });
  } catch (error) {
    logger.error('Error getting authorization code from database:', error);
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
    const result = await OAuthAuthorizationCode.deleteOne({ authorizationCode });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error('Error revoking authorization code from database:', error);
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
