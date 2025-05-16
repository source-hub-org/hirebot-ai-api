/**
 * Create Instrument Controller
 * @module controllers/instruments/createInstrumentController
 */

const { createInstrumentItem } = require('../../services/instrumentService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful instrument creation
 * @param {Object} instrument - Created instrument object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = instrument => {
  return {
    status: 'success',
    data: instrument,
  };
};

/**
 * Formats the response for error in instrument creation
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to create instrument.',
    errors,
  };
};

/**
 * Controller to create a new instrument
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with created instrument or error
 */
const createInstrumentController = async (req, res) => {
  try {
    const result = await createInstrumentItem(req.body);

    if (!result.success) {
      logger.warn('Failed to create instrument:', result.errors);
      return res.status(400).json(formatErrorResponse(result.errors));
    }

    return res.status(201).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in create instrument controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  createInstrumentController,
  formatSuccessResponse,
  formatErrorResponse,
};
