/**
 * OAuth Token Routes
 * @module routes/oauth/tokenRoutes
 */

const express = require('express');
const router = express.Router();
const {
  handleTokenRequest,
  handleTokenRevocation,
} = require('../../controllers/oauth/tokenController');
const { initializeOAuthServer } = require('../../oauth/server');

// Initialize OAuth server
const oauthServer = initializeOAuthServer();

/**
 * @swagger
 * /api/oauth/token:
 *   post:
 *     summary: OAuth 2.0 token endpoint
 *     description: Obtain an access token using various grant types (password, refresh_token, authorization_code)
 *     tags: [OAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               grant_type:
 *                 type: string
 *                 enum: [password, refresh_token, authorization_code]
 *                 description: The grant type
 *               client_id:
 *                 type: string
 *                 description: The client ID
 *               client_secret:
 *                 type: string
 *                 description: The client secret
 *               username:
 *                 type: string
 *                 description: The username (for password grant)
 *               password:
 *                 type: string
 *                 description: The password (for password grant)
 *               refresh_token:
 *                 type: string
 *                 description: The refresh token (for refresh_token grant)
 *               code:
 *                 type: string
 *                 description: The authorization code (for authorization_code grant)
 *               redirect_uri:
 *                 type: string
 *                 description: The redirect URI (for authorization_code grant)
 *             required:
 *               - grant_type
 *               - client_id
 *               - client_secret
 *     responses:
 *       200:
 *         description: Access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: The access token
 *                 token_type:
 *                   type: string
 *                   example: Bearer
 *                 expires_in:
 *                   type: integer
 *                   description: Token expiration time in seconds
 *                 refresh_token:
 *                   type: string
 *                   description: The refresh token (if applicable)
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/', handleTokenRequest, oauthServer.token());

/**
 * @swagger
 * /api/oauth/revoke:
 *   post:
 *     summary: OAuth 2.0 token revocation endpoint
 *     description: Revoke an access token or refresh token
 *     tags: [OAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The token to revoke
 *               token_type_hint:
 *                 type: string
 *                 enum: [access_token, refresh_token]
 *                 description: The type of token to revoke
 *               client_id:
 *                 type: string
 *                 description: The client ID
 *               client_secret:
 *                 type: string
 *                 description: The client secret
 *             required:
 *               - token
 *               - client_id
 *               - client_secret
 *     responses:
 *       200:
 *         description: Token revoked successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/revoke', handleTokenRevocation, (req, res) => {
  // The token revocation is handled by the controller
  // This is just a placeholder for the response
  res.status(200).json({
    status: 'success',
    message: 'Token revoked successfully',
  });
});

module.exports = router;
