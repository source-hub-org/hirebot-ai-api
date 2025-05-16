/**
 * Delete Instrument Controller
 * @module controllers/instruments/deleteInstrumentController
 */

const { deleteInstrumentItem } = require('../../services/instrumentService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful instrument deletion
 * @param {Object} instrument - Deleted instrument object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = instrument => {
  return {
    status: 'success',
    message: 'Instrument deleted successfully',
    data: instrument,
  };
};

/**
 * Formats the response for error in instrument deletion
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to delete instrument.',
    errors,
  };
};

/**
 * Controller to delete an instrument
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with deleted instrument or error
 */
const deleteInstrumentController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteInstrumentItem(id);

    if (!result.success) {
      logger.warn(`Failed to delete instrument with ID ${id}:`, result.errors);

      // Determine appropriate status code based on error
      const statusCode = result.errors.includes('Instrument not found') ? 404 : 400;
      return res.status(statusCode).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in delete instrument controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  deleteInstrumentController,
  formatSuccessResponse,
  formatErrorResponse,
};
