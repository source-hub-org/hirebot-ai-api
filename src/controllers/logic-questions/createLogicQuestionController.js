/**
 * Create Logic Question Controller
 * @module controllers/logic-questions/createLogicQuestionController
 */

const { createQuestion } = require('../../services/logicQuestionService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful question creation
 * @param {Object} question - Created question object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = question => {
  return {
    status: 'success',
    data: question,
  };
};

/**
 * Formats the response for error in question creation
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to create logic question.',
    errors,
  };
};

/**
 * Controller to create a new logic question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with created question or error
 */
const createLogicQuestionController = async (req, res) => {
  try {
    const result = await createQuestion(req.body);

    if (!result.success) {
      logger.warn('Failed to create logic question:', result.errors);
      return res.status(400).json(formatErrorResponse(result.errors));
    }

    return res.status(201).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in create logic question controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  createLogicQuestionController,
  formatSuccessResponse,
  formatErrorResponse,
};
