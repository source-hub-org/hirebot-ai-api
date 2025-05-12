/**
 * Update Logic Tag Controller
 * @module controllers/logic-tags/updateLogicTagController
 */

const { updateTag } = require('../../service/logicTagService');
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
    message: 'Failed to update logic tag.',
    errors,
  };
};

/**
 * Controller to update a logic tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated tag or error
 */
const updateLogicTagController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateTag(id, req.body);

    if (!result.success) {
      logger.warn(`Failed to update logic tag with ID ${id}:`, result.errors);

      // If tag not found, return 404
      if (result.errors.includes('Tag not found')) {
        return res.status(404).json(formatErrorResponse(result.errors));
      }

      return res.status(400).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in update logic tag controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  updateLogicTagController,
  formatSuccessResponse,
  formatErrorResponse,
};
