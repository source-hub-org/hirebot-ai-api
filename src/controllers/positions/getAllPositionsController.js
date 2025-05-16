/**
 * Get All Positions Controller
 * @module controllers/positions/getAllPositionsController
 */

const { getAllPositionsService } = require('../../services/positionsService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful positions retrieval
 * @param {Array} positions - Array of position objects
 * @param {Object} pagination - Metadata about the query results
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = (positions, pagination = {}) => {
  return {
    status: 'success',
    data: positions,
    pagination,
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
    const { positions, totalCount } = await getAllPositionsService(req.query);

    // Calculate pagination for pagination
    const page = parseInt(req.query.page) || 1;
    const page_size = parseInt(req.query.page_size) || parseInt(req.query.limit) || 10;
    const pagination = {
      total: totalCount,
      page: page,
      page_size: page_size,
      total_pages: Math.ceil(totalCount / page_size),
    };

    return res.status(200).json(formatSuccessResponse(positions, pagination));
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
