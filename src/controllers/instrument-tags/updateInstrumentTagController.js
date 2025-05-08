/**
 * Update Instrument Tag Controller
 * @module controllers/instrument-tags/updateInstrumentTagController
 */

const { updateTag } = require('../../service/instrumentTagService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful tag update
 * @param {Object} tag - Updated tag object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = tag => {
  return {
    status: 'success',
    data: tag,
  };
};

/**
 * Formats the response for error in tag update
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to update instrument tag.',
    errors,
  };
};

/**
 * Controller to update an instrument tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated tag or error
 */
const updateInstrumentTagController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateTag(id, req.body);

    if (!result.success) {
      logger.warn(`Failed to update instrument tag with ID ${id}:`, result.errors);

      // Determine appropriate status code based on error
      let statusCode = 400; // Default to 400 Bad Request

      if (result.errors.includes('Tag not found')) {
        statusCode = 404; // Not Found
      } else if (result.errors.some(error => error.includes('Tag with this name already exists'))) {
        statusCode = 400; // Bad Request for duplicate name
      }

      return res.status(statusCode).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in update instrument tag controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  updateInstrumentTagController,
  formatSuccessResponse,
  formatErrorResponse,
};
