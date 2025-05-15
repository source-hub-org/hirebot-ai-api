/**
 * OAuth Token Model
 * @module models/oauthTokenModel
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * OAuth Access Token Schema
 */
const OAuthAccessTokenSchema = new Schema(
  {
    accessToken: { type: String, required: true, unique: true },
    accessTokenExpiresAt: { type: Date, required: true },
    client: { type: Object, required: true }, // Client information
    user: { type: Object, required: true }, // User information
    scope: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'oauth_access_token',
  }
);

/**
 * OAuth Refresh Token Schema
 */
const OAuthRefreshTokenSchema = new Schema(
  {
    refreshToken: { type: String, required: true, unique: true },
    refreshTokenExpiresAt: { type: Date, required: true },
    client: { type: Object, required: true }, // Client information
    user: { type: Object, required: true }, // User information
    scope: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'oauth_refresh_token',
  }
);

/**
 * OAuth Authorization Code Schema
 */
const OAuthAuthorizationCodeSchema = new Schema(
  {
    authorizationCode: { type: String, required: true, unique: true },
    authorizationCodeExpiresAt: { type: Date, required: true },
    client: { type: Object, required: true }, // Client information
    user: { type: Object, required: true }, // User information
    scope: { type: String },
    redirectUri: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'oauth_authorization_code',
  }
);

// Create models
const OAuthAccessToken = mongoose.model('oauth_access_token', OAuthAccessTokenSchema);
const OAuthRefreshToken = mongoose.model('oauth_refresh_token', OAuthRefreshTokenSchema);
const OAuthAuthorizationCode = mongoose.model(
  'oauth_authorization_code',
  OAuthAuthorizationCodeSchema
);

module.exports = {
  OAuthAccessToken,
  OAuthRefreshToken,
  OAuthAuthorizationCode,
};
