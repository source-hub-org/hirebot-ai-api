/**
 * Get Instrument Tag Controller
 * @module controllers/instrument-tags/getInstrumentTagController
 */

const { getTagById } = require('../../service/instrumentTagService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful tag retrieval
 * @param {Object} tag - Tag object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = tag => {
  return {
    status: 'success',
    data: tag,
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
    message: 'Failed to retrieve instrument tag.',
    errors,
  };
};

/**
 * Controller to get an instrument tag by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with tag or error
 */
const getInstrumentTagController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getTagById(id);

    if (!result.success) {
      logger.warn(`Failed to retrieve instrument tag with ID ${id}:`, result.errors);

      // Determine appropriate status code based on error
      const statusCode = result.errors.includes('Tag not found') ? 404 : 400;
      return res.status(statusCode).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in get instrument tag controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  getInstrumentTagController,
  formatSuccessResponse,
  formatErrorResponse,
};
