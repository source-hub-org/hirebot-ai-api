/**
 * OAuth Client Model
 * @module models/oauthClientModel
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * OAuth Client Schema
 */
const OAuthClientSchema = new Schema(
  {
    clientId: { type: String, required: true, unique: true },
    clientSecret: { type: String, required: true },
    redirectUris: { type: [String], required: true },
    grants: { type: [String], required: true },
    accessTokenLifetime: { type: Number },
    refreshTokenLifetime: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'oauth_client',
  }
);

// Create model
const OAuthClient = mongoose.model('OAuthClient', OAuthClientSchema);

module.exports = OAuthClient;
