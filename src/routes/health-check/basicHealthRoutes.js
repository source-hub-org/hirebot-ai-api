/**
 * Basic Health Check Routes
 * @module routes/health-check/basicHealthRoutes
 */

const express = require('express');
const router = express.Router();
const { getBasicHealth } = require('../../controllers/health-check/basicHealthController');

/**
 * @swagger
 * /api/health-check:
 *   get:
 *     summary: Basic API health check
 *     description: Returns a simple status to confirm the API is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: API is running
 */
router.get('/', getBasicHealth);

module.exports = router;
