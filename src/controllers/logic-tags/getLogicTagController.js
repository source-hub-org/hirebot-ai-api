/**
 * Get Logic Tag Controller
 * @module controllers/logic-tags/getLogicTagController
 */

const { getTagById } = require('../../services/logicTagService');
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
    message: 'Failed to retrieve logic tag.',
    errors,
  };
};

/**
 * Controller to get a logic tag by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with tag or error
 */
const getLogicTagController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getTagById(id);

    if (!result.success) {
      logger.warn(`Failed to retrieve logic tag with ID ${id}:`, result.errors);

      // If tag not found, return 404
      if (result.errors.includes('Tag not found')) {
        return res.status(404).json(formatErrorResponse(result.errors));
      }

      return res.status(400).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in get logic tag controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  getLogicTagController,
  formatSuccessResponse,
  formatErrorResponse,
};
