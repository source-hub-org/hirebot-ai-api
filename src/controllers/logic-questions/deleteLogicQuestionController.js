/**
 * Delete Logic Question Controller
 * @module controllers/logic-questions/deleteLogicQuestionController
 */

const { deleteQuestion } = require('../../services/logicQuestionService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful question deletion
 * @param {Object} question - Deleted question object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = question => {
  return {
    status: 'success',
    data: question,
  };
};

/**
 * Formats the response for error in question deletion
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = errors => {
  return {
    status: 'error',
    message: 'Failed to delete logic question.',
    errors,
  };
};

/**
 * Controller to delete a logic question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with deleted question or error
 */
const deleteLogicQuestionController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteQuestion(id);

    if (!result.success) {
      logger.warn(`Failed to delete logic question with ID ${id}:`, result.errors);

      // If question not found, return 404
      if (result.errors.includes('Question not found')) {
        return res.status(404).json(formatErrorResponse(result.errors));
      }

      return res.status(400).json(formatErrorResponse(result.errors));
    }

    return res.status(200).json(formatSuccessResponse(result.data));
  } catch (error) {
    logger.error('Error in delete logic question controller:', error);
    return res.status(500).json(formatErrorResponse(['Internal server error']));
  }
};

module.exports = {
  deleteLogicQuestionController,
  formatSuccessResponse,
  formatErrorResponse,
};
