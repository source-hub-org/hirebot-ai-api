/**
 * Search Questions Controller
 * @module controllers/questions/searchController
 */

const { validateSearchParams } = require('../../utils/questionSearchValidator');
const { searchQuestions } = require('../../service/questionSearchService');
const logger = require('../../utils/logger');

/**
 * Formats the validation error response
 * @param {Array} errors - Array of error messages
 * @returns {Object} Formatted validation error response
 */
const formatValidationErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Validation failed',
    errors: errors,
  };
};

/**
 * Formats the success response
 * @param {Array} questions - Array of questions
 * @param {Object} pagination - Pagination information
 * @returns {Object} Formatted success response
 */
const formatSuccessResponse = (questions, pagination) => {
  return {
    status: 'success',
    message: 'Questions retrieved successfully.',
    data: questions,
    pagination: pagination,
  };
};

/**
 * Formats the error response
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'An error occurred while searching for questions.',
    error: error.message,
  };
};

/**
 * Controller to search questions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with questions or error
 */
const searchQuestionsController = async (req, res) => {
  try {
    // 1. Extract and validate query parameters
    const validationResult = validateSearchParams(req.query);

    if (validationResult.errors.length > 0) {
      return res.status(400).json(formatValidationErrorResponse(validationResult.errors));
    }

    // 2. Search for questions using the service
    const result = await searchQuestions(validationResult.params);

    // 3. Return the results
    return res.status(200).json(formatSuccessResponse(result.questions, result.pagination));
  } catch (error) {
    logger.error('Error searching questions:', error);
    return res.status(500).json(formatErrorResponse(error));
  }
};

module.exports = {
  searchQuestionsController,
  formatValidationErrorResponse,
  formatSuccessResponse,
  formatErrorResponse,
};
