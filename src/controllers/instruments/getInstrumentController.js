/**
 * Get Instrument Controller
 * @module controllers/instruments/getInstrumentController
 */

const { getInstrumentItemById } = require('../../service/instrumentService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful instrument retrieval
 * @param {Object} instrument - Instrument object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = instrument => {
  return {
    status: 'success',
    data: instrument,
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
    message: 'Failed to retrieve instrument.',
    errors,
  };
};

/**
 * Controller to get an instrument by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with instrument or error
 */
const getInstrumentController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getInstrumentItemById(id);

    if (!result.success) {
      logger.warn(`Failed to retrieve instrument with ID ${id}:`, result.errors);

      // Determine appropriate status code based on error
      const statusCode = result.errors.includes('Instrument not found') ? 404 : 400;
      return res.status(statusCode).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in get instrument controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  getInstrumentController,
  formatSuccessResponse,
  formatErrorResponse,
};
