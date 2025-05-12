/**
 * Get All Logic Tags Controller
 * @module controllers/logic-tags/getAllLogicTagsController
 */

const { getAllTags } = require('../../service/logicTagService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful tags retrieval
 * @param {Array<Object>} tags - Array of tag objects
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = tags => {
  return {
    status: 'success',
    data: tags,
  };
};

/**
 * Formats the response for error in tags retrieval
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to retrieve logic tags.',
    errors,
  };
};

/**
 * Controller to get all logic tags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with tags or error
 */
const getAllLogicTagsController = async (req, res) => {
  try {
    const result = await getAllTags();

    if (!result.success) {
      logger.warn('Failed to retrieve logic tags:', result.errors);
      return res.status(400).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in get all logic tags controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  getAllLogicTagsController,
  formatSuccessResponse,
  formatErrorResponse,
};
