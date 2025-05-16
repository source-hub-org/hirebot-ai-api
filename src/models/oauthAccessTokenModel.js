/**
 * OAuth Access Token Model
 * @module models/oauthAccessTokenModel
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

// Create model
const OAuthAccessToken = mongoose.model('OAuthAccessToken', OAuthAccessTokenSchema);

module.exports = OAuthAccessToken;
