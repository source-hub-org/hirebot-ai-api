/**
 * Get All Logic Questions Controller
 * @module controllers/logic-questions/getAllLogicQuestionsController
 */

const { getQuestions } = require('../../services/logicQuestionGetService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful questions retrieval
 * @param {Array<Object>} questions - Array of question objects
 * @param {Object} pagination - Pagination information
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = (questions, pagination) => {
  return {
    status: 'success',
    data: questions,
    pagination,
  };
};

/**
 * Formats the response for error in questions retrieval
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to retrieve logic questions.',
    errors,
  };
};

/**
 * Controller to get all logic questions with filtering, sorting, and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with questions or error
 */
const getAllLogicQuestionsController = async (req, res) => {
  try {
    // Extract query parameters
    const { level, tag_id, type, page, page_size, sort_by, sort_direction, ignore_question_ids } =
      req.query;

    const result = await getQuestions({
      level,
      tag_id,
      type,
      page,
      limit: page_size, // Map page_size to limit for backward compatibility
      page_size, // Also pass the original page_size
      sort_by,
      sort_direction,
      ignore_question_ids,
    });

    if (!result.success) {
      logger.warn('Failed to retrieve logic questions:', result.errors);
      return res.status(400).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data, result.pagination));
  } catch (error) {
    logger.error('Error in get all logic questions controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  getAllLogicQuestionsController,
  formatSuccessResponse,
  formatErrorResponse,
};
