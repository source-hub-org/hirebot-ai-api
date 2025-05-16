/**
 * Update Instrument Controller
 * @module controllers/instruments/updateInstrumentController
 */

const { updateInstrumentItem } = require('../../services/instrumentService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful instrument update
 * @param {Object} instrument - Updated instrument object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = instrument => {
  return {
    status: 'success',
    data: instrument,
  };
};

/**
 * Formats the response for error in instrument update
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to update instrument.',
    errors,
  };
};

/**
 * Controller to update an instrument
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated instrument or error
 */
const updateInstrumentController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateInstrumentItem(id, req.body);

    if (!result.success) {
      logger.warn(`Failed to update instrument with ID ${id}:`, result.errors);

      // Determine appropriate status code based on error
      let statusCode = 400; // Default to Bad Request

      if (result.errors.includes('Instrument not found')) {
        statusCode = 404; // Not Found
      } else if (
        result.errors.some(error =>
          error.includes('Instrument with this question ID already exists')
        )
      ) {
        statusCode = 400; // Bad Request for duplicate questionId
      } else if (
        result.errors.some(
          error =>
            error.includes('Type must be one of') || error.includes('Question type must be one of')
        )
      ) {
        statusCode = 400; // Bad Request for invalid type
      }

      return res.status(statusCode).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in update instrument controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  updateInstrumentController,
  formatSuccessResponse,
  formatErrorResponse,
};
