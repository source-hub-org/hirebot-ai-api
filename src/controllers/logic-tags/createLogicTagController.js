/**
 * Create Logic Tag Controller
 * @module controllers/logic-tags/createLogicTagController
 */

const { createTag } = require('../../services/logicTagService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful tag creation
 * @param {Object} tag - Created tag object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = tag => {
  return {
    status: 'success',
    data: tag,
  };
};

/**
 * Formats the response for error in tag creation
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to create logic tag.',
    errors,
  };
};

/**
 * Controller to create a new logic tag
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with created tag or error
 */
const createLogicTagController = async (req, res) => {
  try {
    const result = await createTag(req.body);

    if (!result.success) {
      logger.warn('Failed to create logic tag:', result.errors);
      return res.status(400).json(formatErrorResponse(result.errors));
    }

    return res.status(201).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in create logic tag controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  createLogicTagController,
  formatSuccessResponse,
  formatErrorResponse,
};
