/**
 * OAuth Client Routes
 * @module routes/oauth/clientRoutes
 */

const express = require('express');
const router = express.Router();
const {
  getClients,
  createClient,
  getClientById,
  updateClient,
  deleteClient,
} = require('../../controllers/oauth/clientController');

/**
 * @swagger
 * /api/oauth/clients:
 *   get:
 *     summary: Get all OAuth clients
 *     description: Returns a list of all OAuth clients
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of OAuth clients
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', getClients);

/**
 * @swagger
 * /api/oauth/clients:
 *   post:
 *     summary: Create a new OAuth client
 *     description: Creates a new OAuth client
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: The client ID
 *               clientSecret:
 *                 type: string
 *                 description: The client secret
 *               redirectUris:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The redirect URIs
 *               grants:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [password, refresh_token, authorization_code]
 *                 description: The grant types
 *             required:
 *               - clientId
 *               - clientSecret
 *     responses:
 *       201:
 *         description: OAuth client created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: OAuth client already exists
 *       500:
 *         description: Server error
 */
router.post('/', createClient);

/**
 * @swagger
 * /api/oauth/clients/{clientId}:
 *   get:
 *     summary: Get an OAuth client by ID
 *     description: Returns an OAuth client by ID
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The client ID
 *     responses:
 *       200:
 *         description: OAuth client
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: OAuth client not found
 *       500:
 *         description: Server error
 */
router.get('/:clientId', getClientById);

/**
 * @swagger
 * /api/oauth/clients/{clientId}:
 *   put:
 *     summary: Update an OAuth client
 *     description: Updates an OAuth client
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               redirectUris:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The redirect URIs
 *               grants:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [password, refresh_token, authorization_code]
 *                 description: The grant types
 *     responses:
 *       200:
 *         description: OAuth client updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: OAuth client not found
 *       500:
 *         description: Server error
 */
router.put('/:clientId', updateClient);

/**
 * @swagger
 * /api/oauth/clients/{clientId}:
 *   delete:
 *     summary: Delete an OAuth client
 *     description: Deletes an OAuth client
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The client ID
 *     responses:
 *       200:
 *         description: OAuth client deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: OAuth client not found
 *       500:
 *         description: Server error
 */
router.delete('/:clientId', deleteClient);

module.exports = router;
