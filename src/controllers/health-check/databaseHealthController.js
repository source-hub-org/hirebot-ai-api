/**
 * Database Health Check Controller
 * @module controllers/health-check/databaseHealthController
 */

const { getConnectionInfo } = require('../../repository/baseRepository');

/**
 * Get database connection status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Database connection status
 */
const getDatabaseHealth = (req, res) => {
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
};

module.exports = {
  getDatabaseHealth,
};
