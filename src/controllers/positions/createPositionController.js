/**
 * Create Position Controller
 * @module controllers/positions/createPositionController
 */

const { createPositionService } = require('../../service/positionsService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful position creation
 * @param {Object} position - Created position object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = position => {
  return {
    status: 'success',
    message: 'Position created successfully.',
    data: position,
  };
};

/**
 * Formats the response for error in position creation
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'Failed to create position.',
    error: error.message,
  };
};

/**
 * Controller to create a new position
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with created position or error
 */
const createPositionController = async (req, res) => {
  try {
    // Validate required fields
    const { slug, title, description, instruction, level } = req.body;
    
    if (!slug || !title || !description || !instruction || !level) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields. Please provide slug, title, description, instruction, and level.',
      });
    }
    
    // Create position
    const position = await createPositionService(req.body);
    
    return res.status(201).json(formatSuccessResponse(position));
  } catch (error) {
    logger.error('Error creating position:', error);
    
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
  createPositionController,
  formatSuccessResponse,
  formatErrorResponse,
};