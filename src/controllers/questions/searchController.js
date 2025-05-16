/**
 * Search Questions Controller
 * @module controllers/questions/searchController
 */

const { validateSearchParams } = require('../../utils/questionSearchValidator');
const { searchQuestions } = require('../../services/questionSearchService');
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
 * @description
 * - Supports searching by topic, topic_id, language, language_id, position, position_id
 * - Supports multiple values for each parameter (comma-separated)
 * - Supports random sorting with 'sort_by=random' query parameter (default)
 * - Supports excluding specific questions with 'ignore_question_ids' parameter (comma-separated list of IDs)
 */
const searchQuestionsController = async (req, res) => {
  try {
    const filters = req.filters;

    // 1. Extract and validate query parameters
    const validationResult = validateSearchParams(filters);

    if (validationResult.errors.length > 0) {
      return res.status(400).json(formatValidationErrorResponse(validationResult.errors));
    }

    // Log the search parameters for debugging
    logger.debug('Search parameters:', {
      topic: validationResult.params.topic,
      topic_id: validationResult.params.topic_id,
      language: validationResult.params.language,
      language_id: validationResult.params.language_id,
      position: validationResult.params.position,
      position_id: validationResult.params.position_id,
      sort_by: validationResult.params.sort_by,
      sort_direction: validationResult.params.sort_direction,
      page: validationResult.params.page,
      page_size: validationResult.params.page_size,
      mode: validationResult.params.mode,
      ignore_question_ids: validationResult.params.ignore_question_ids,
    });

    // 2. Search for questions using the service
    // Note: sort_by=random is now the default if not specified
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
