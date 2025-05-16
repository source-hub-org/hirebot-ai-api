/**
 * Delete Instrument Tag Controller
 * @module controllers/instrument-tags/deleteInstrumentTagController
 */

const { deleteTag } = require('../../services/instrumentTagService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful tag deletion
 * @param {Object} tag - Deleted tag object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = tag => {
  return {
    status: 'success',
    message: 'Instrument tag deleted successfully',
    data: tag,
  };
};

/**
 * Formats the response for error in tag deletion
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to delete instrument tag.',
    errors,
  };
};

/**
 * Controller to delete an instrument tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with deleted tag or error
 */
const deleteInstrumentTagController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteTag(id);

    if (!result.success) {
      logger.warn(`Failed to delete instrument tag with ID ${id}:`, result.errors);

      // Determine appropriate status code based on error
      const statusCode = result.errors.includes('Tag not found') ? 404 : 400;
      return res.status(statusCode).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in delete instrument tag controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  deleteInstrumentTagController,
  formatSuccessResponse,
  formatErrorResponse,
};
