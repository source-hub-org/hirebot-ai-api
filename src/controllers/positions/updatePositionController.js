/**
 * Update Position Controller
 * @module controllers/positions/updatePositionController
 */

const { updatePositionService } = require('../../service/positionsService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful position update
 * @param {Object} position - Updated position object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = position => {
  return {
    status: 'success',
    message: 'Position updated successfully.',
    data: position,
  };
};

/**
 * Formats the response for error in position update
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'Failed to update position.',
    error: error.message,
  };
};

/**
 * Controller to update a position by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated position or error
 */
const updatePositionController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if request body is empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Update data is required.',
      });
    }
    
    // Update position
    const updatedPosition = await updatePositionService(id, req.body);
    
    if (!updatedPosition) {
      return res.status(404).json({
        status: 'error',
        message: `Position with ID ${id} not found.`,
      });
    }
    
    return res.status(200).json(formatSuccessResponse(updatedPosition));
  } catch (error) {
    logger.error(`Error updating position with ID ${req.params.id}:`, error);
    
    // Handle duplicate slug error
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        status: 'error',
        message: error.message,
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error.',
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    
    return res.status(500).json(formatErrorResponse(error));
  }
};

module.exports = {
  updatePositionController,
  formatSuccessResponse,
  formatErrorResponse,
};