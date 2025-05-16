/**
 * Get Position By ID Controller
 * @module controllers/positions/getPositionByIdController
 */

const { getPositionByIdService } = require('../../services/positionsService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful position retrieval
 * @param {Object} position - Position object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = position => {
  return {
    status: 'success',
    data: position,
  };
};

/**
 * Formats the response for error in position retrieval
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'Failed to retrieve position.',
    error: error.message,
  };
};

/**
 * Controller to get a position by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with position or error
 */
const getPositionByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await getPositionByIdService(id);

    if (!position) {
      return res.status(404).json({
        status: 'error',
        message: `Position with ID ${id} not found.`,
      });
    }

    return res.status(200).json(formatSuccessResponse(position));
  } catch (error) {
    logger.error(`Error retrieving position with ID ${req.params.id}:`, error);
    return res.status(500).json(formatErrorResponse(error));
  }
};

module.exports = {
  getPositionByIdController,
  formatSuccessResponse,
  formatErrorResponse,
};
