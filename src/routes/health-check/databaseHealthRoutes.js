/**
 * Database Health Check Routes
 * @module routes/health-check/databaseHealthRoutes
 */

const express = require('express');
const router = express.Router();
const { getDatabaseHealth } = require('../../controllers/health-check/databaseHealthController');

/**
 * @swagger
 * /api/health-check/database:
 *   get:
 *     summary: Check database connection status
 *     description: Returns the current status of the database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database connection information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     isConnected:
 *                       type: boolean
 *                       example: true
 *                     serverAddress:
 *                       type: string
 *                       example: mongodb://localhost:27017
 *                     dbName:
 *                       type: string
 *                       example: hirebot_db
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to check database connection
 *                 error:
 *                   type: string
 *                   example: Connection error
 */
router.get('/database', getDatabaseHealth);

module.exports = router;
