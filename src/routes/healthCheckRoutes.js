/**
 * Health Check Routes
 * @module routes/healthCheckRoutes
 */

const express = require('express');
const { getConnectionInfo } = require('@repository/baseRepository');

const router = express.Router();

/**
 * Database health check endpoint
 * @route GET /api/health-check/database
 * @returns {Object} 200 - Database connection status
 * @returns {Object} 500 - Server error
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
    console.error('Database health check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check database connection',
      error: error.message,
    });
  }
});

module.exports = router;
