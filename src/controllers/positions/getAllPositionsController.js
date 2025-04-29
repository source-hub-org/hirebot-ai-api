/**
 * Get All Positions Controller
 * @module controllers/positions/getAllPositionsController
 */

const { getAllPositionsService } = require('../../service/positionsService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful positions retrieval
 * @param {Array} positions - Array of position objects
 * @param {Object} metadata - Metadata about the query results
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = (positions, metadata = {}) => {
  return {
    status: 'success',
    data: positions,
    metadata,
  };
};

/**
 * Formats the response for error in positions retrieval
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'Failed to retrieve positions.',
    error: error.message,
  };
};

/**
 * Controller to get all positions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with positions or error
 */
const getAllPositionsController = async (req, res) => {
  try {
    const positions = await getAllPositionsService(req.query);

    // Calculate metadata for pagination if needed
    const metadata = {};
    if (req.query.page || req.query.limit) {
      metadata.page = parseInt(req.query.page) || 1;
      metadata.limit = parseInt(req.query.limit) || 10;
      metadata.total = positions.length; // This would need to be updated for accurate count
    }

    return res.status(200).json(formatSuccessResponse(positions, metadata));
  } catch (error) {
    logger.error('Error retrieving positions:', error);
    return res.status(500).json(formatErrorResponse(error));
  }
};

module.exports = {
  getAllPositionsController,
  formatSuccessResponse,
  formatErrorResponse,
};
