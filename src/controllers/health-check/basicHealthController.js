/**
 * Basic Health Check Controller
 * @module controllers/health-check/basicHealthController
 */

/**
 * Get basic API health status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} API health status
 */
const getBasicHealth = (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'API is running',
  });
};

module.exports = {
  getBasicHealth,
};
