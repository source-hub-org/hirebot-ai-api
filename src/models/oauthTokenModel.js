/**
 * OAuth Token Models Index
 * @module models/oauthTokenModel
 * @description This file is maintained for backward compatibility. It imports and re-exports the OAuth token models from their individual files.
 */

const OAuthAccessToken = require('./oauthAccessTokenModel');
const OAuthRefreshToken = require('./oauthRefreshTokenModel');
const OAuthAuthorizationCode = require('./oauthAuthorizationCodeModel');

module.exports = {
  OAuthAccessToken,
  OAuthRefreshToken,
  OAuthAuthorizationCode,
};
