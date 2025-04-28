/**
 * Delete Position Controller
 * @module controllers/positions/deletePositionController
 */

const { deletePositionService } = require('../../service/positionsService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful position deletion
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = () => {
  return {
    status: 'success',
    message: 'Position deleted successfully.',
  };
};

/**
 * Formats the response for error in position deletion
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'Failed to delete position.',
    error: error.message,
  };
};

/**
 * Controller to delete a position by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
const deletePositionController = async (req, res) => {
  try {
    const { id } = req.params;
    const isDeleted = await deletePositionService(id);
    
    if (!isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: `Position with ID ${id} not found.`,
      });
    }
    
    return res.status(200).json(formatSuccessResponse());
  } catch (error) {
    logger.error(`Error deleting position with ID ${req.params.id}:`, error);
    return res.status(500).json(formatErrorResponse(error));
  }
};

module.exports = {
  deletePositionController,
  formatSuccessResponse,
  formatErrorResponse,
};