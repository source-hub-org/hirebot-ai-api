/**
 * Get Logic Question Controller
 * @module controllers/logic-questions/getLogicQuestionController
 */

const { getQuestionById } = require('../../services/logicQuestionService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful question retrieval
 * @param {Object} question - Question object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = question => {
  return {
    status: 'success',
    data: question,
  };
};

/**
 * Formats the response for error in question retrieval
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to retrieve logic question.',
    errors,
  };
};

/**
 * Controller to get a logic question by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with question or error
 */
const getLogicQuestionController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getQuestionById(id);

    if (!result.success) {
      logger.warn(`Failed to retrieve logic question with ID ${id}:`, result.errors);

      // If question not found, return 404
      if (result.errors.includes('Question not found')) {
        return res.status(404).json(formatErrorResponse(result.errors));
      }

      return res.status(400).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in get logic question controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  getLogicQuestionController,
  formatSuccessResponse,
  formatErrorResponse,
};
