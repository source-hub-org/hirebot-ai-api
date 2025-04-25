/**
 * Health Check Routes
 * @module routes/healthCheckRoutes
 */

const express = require('express');
const { getConnectionInfo } = require('../repository/baseRepository');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health check endpoints
 */

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
router.get('/', (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'API is running',
  });
});

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
router.get('/database', (req, res) => {
  try {
    // Get MongoDB connection information
    const connectionInfo = getConnectionInfo();

    // Return connection status as JSON
    return res.status(200).json({
      status: 'success',
      data: {
        isConnected: connectionInfo.isConnected,
        serverAddress: connectionInfo.serverAddress,
        dbName: connectionInfo.dbName,
      },
    });
  } catch (error) {
    console.debug('Database health check error.');
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check database connection',
      error: error.message,
    });
  }
});

module.exports = router;
