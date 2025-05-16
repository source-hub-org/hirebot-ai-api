/**
 * Get Instruments By Tag Controller
 * @module controllers/instruments/getInstrumentsByTagController
 */

const { getInstrumentItemsByTagId } = require('../../services/instrumentService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful instrument retrieval
 * @param {Array} instruments - Array of instrument objects
 * @param {Object} pagination - Pagination information
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = (instruments, pagination) => {
  return {
    status: 'success',
    data: instruments,
    pagination,
  };
};

/**
 * Formats the response for error in instrument retrieval
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to retrieve instruments by tag.',
    errors,
  };
};

/**
 * Controller to get instruments by tag ID with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with instruments or error
 */
const getInstrumentsByTagController = async (req, res) => {
  try {
    const { tagId } = req.params;
    const result = await getInstrumentItemsByTagId(tagId, req.query);

    if (!result.success) {
      logger.warn(`Failed to retrieve instruments with tag ID ${tagId}:`, result.errors);

      // Determine appropriate status code based on error
      let statusCode = 500; // Default to internal server error

      if (result.errors.some(error => error.includes('Invalid tag ID'))) {
        statusCode = 400; // Bad Request for invalid tag ID format
      } else if (result.errors.some(error => error.includes('Tag not found'))) {
        statusCode = 404; // Not Found for tag not found
      }

      return res.status(statusCode).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data, result.pagination));
  } catch (error) {
    logger.error('Error in get instruments by tag controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  getInstrumentsByTagController,
  formatSuccessResponse,
  formatErrorResponse,
};
