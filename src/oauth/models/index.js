/**
 * OAuth Model Index
 * @module oauth/models
 */

const { getClient } = require('./clientModel');
const { getUser } = require('./userModel');
const { getAccessToken, getRefreshToken, revokeToken, saveToken } = require('./tokenModel');
const {
  getAuthorizationCode,
  saveAuthorizationCode,
  revokeAuthorizationCode,
} = require('./authCodeModel');

/**
 * OAuth model object that combines all model functions
 * required by express-oauth-server
 */
const oauthModel = {
  // Client functions
  getClient,

  // User functions
  getUser,

  // Token functions
  getAccessToken,
  getRefreshToken,
  revokeToken,
  saveToken,

  // Authorization code functions
  getAuthorizationCode,
  saveAuthorizationCode,
  revokeAuthorizationCode,

  // Optional functions for additional grant types
  // These can be implemented as needed

  // validateScope: function(user, client, scope) {},
  // verifyScope: function(token, scope) {},
};

module.exports = oauthModel;
