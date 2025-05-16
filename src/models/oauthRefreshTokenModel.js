/**
 * OAuth Refresh Token Model
 * @module models/oauthRefreshTokenModel
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

// Create model
const OAuthRefreshToken = mongoose.model('OAuthRefreshToken', OAuthRefreshTokenSchema);

module.exports = OAuthRefreshToken;
