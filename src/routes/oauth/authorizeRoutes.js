/**
 * OAuth Authorization Routes
 * @module routes/oauth/authorizeRoutes
 */

const express = require('express');
const router = express.Router();
const {
  renderAuthorizationForm,
  handleAuthorizationDecision,
} = require('../../controllers/oauth/authorizeController');
const { initializeOAuthServer } = require('../../oauth/server');

// Initialize OAuth server
const oauthServer = initializeOAuthServer();

/**
 * @swagger
 * /api/oauth/authorize:
 *   get:
 *     summary: OAuth 2.0 authorization endpoint (form)
 *     description: Renders the authorization form for the user to approve or deny
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: response_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [code]
 *         description: The response type (must be 'code' for authorization code flow)
 *       - in: query
 *         name: client_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The client ID
 *       - in: query
 *         name: redirect_uri
 *         required: true
 *         schema:
 *           type: string
 *         description: The redirect URI
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *         description: The requested scope
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: An opaque value used for security
 *     responses:
 *       200:
 *         description: Authorization form rendered successfully
 *       400:
 *         description: Invalid request
 */
router.get('/', renderAuthorizationForm);

/**
 * @swagger
 * /api/oauth/authorize:
 *   post:
 *     summary: OAuth 2.0 authorization endpoint (decision)
 *     description: Handles the user's decision to approve or deny the authorization
 *     tags: [OAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               client_id:
 *                 type: string
 *                 description: The client ID
 *               redirect_uri:
 *                 type: string
 *                 description: The redirect URI
 *               response_type:
 *                 type: string
 *                 enum: [code]
 *                 description: The response type
 *               scope:
 *                 type: string
 *                 description: The requested scope
 *               state:
 *                 type: string
 *                 description: An opaque value used for security
 *               approved:
 *                 type: string
 *                 enum: [true, false]
 *                 description: Whether the user approved the authorization
 *             required:
 *               - client_id
 *               - redirect_uri
 *               - response_type
 *               - approved
 *     responses:
 *       302:
 *         description: Redirects to the redirect URI with authorization code or error
 *       400:
 *         description: Invalid request
 */
router.post(
  '/',
  handleAuthorizationDecision,
  oauthServer.authorize({
    authenticateHandler: {
      handle: req => {
        // The user is set in the handleAuthorizationDecision middleware
        // if the user approved the authorization
        return req.user;
      },
    },
  })
);

module.exports = router;
