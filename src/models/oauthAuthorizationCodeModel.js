/**
 * OAuth Authorization Code Model
 * @module models/oauthAuthorizationCodeModel
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

// Create model
const OAuthAuthorizationCode = mongoose.model(
  'OAuthAuthorizationCode',
  OAuthAuthorizationCodeSchema
);

module.exports = OAuthAuthorizationCode;
