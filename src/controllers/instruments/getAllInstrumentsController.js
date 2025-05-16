/**
 * Get All Instruments Controller
 * @module controllers/instruments/getAllInstrumentsController
 */

const { getAllInstrumentItems } = require('../../services/instrumentService');
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
    message: 'Failed to retrieve instruments.',
    errors,
  };
};

/**
 * Controller to get all instruments with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with instruments or error
 */
const getAllInstrumentsController = async (req, res) => {
  try {
    const result = await getAllInstrumentItems(req.query);

    if (!result.success) {
      logger.warn('Failed to retrieve instruments:', result.errors);
      return res.status(500).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data, result.pagination));
  } catch (error) {
    logger.error('Error in get all instruments controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  getAllInstrumentsController,
  formatSuccessResponse,
  formatErrorResponse,
};
