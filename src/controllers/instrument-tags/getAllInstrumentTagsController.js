/**
 * Get All Instrument Tags Controller
 * @module controllers/instrument-tags/getAllInstrumentTagsController
 */

const { getAllTags } = require('../../service/instrumentTagService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful tag retrieval
 * @param {Array} tags - Array of tag objects
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = tags => {
  return {
    status: 'success',
    data: tags,
  };
};

/**
 * Formats the response for error in tag retrieval
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to retrieve instrument tags.',
    errors,
  };
};

/**
 * Controller to get all instrument tags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with tags or error
 */
const getAllInstrumentTagsController = async (req, res) => {
  try {
    const result = await getAllTags();

    if (!result.success) {
      logger.warn('Failed to retrieve instrument tags:', result.errors);
      return res.status(500).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in get all instrument tags controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  getAllInstrumentTagsController,
  formatSuccessResponse,
  formatErrorResponse,
};
