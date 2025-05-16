/**
 * Question Controller Module
 * @module controllers/questions/questionController
 */

const {
  createNewQuestion,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../../services/questionService');
const {
  validateQuestionData,
  formatValidationErrorResponse,
} = require('../../utils/questionValidator');
const logger = require('../../utils/logger');

/**
 * Format success response
 * @param {string} message - Success message
 * @param {Object|Array|null} data - Response data
 * @returns {Object} Formatted success response
 */
function formatSuccessResponse(message, data = null) {
  const response = {
    status: 'success',
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return response;
}

/**
 * Format error response
 * @param {string} message - Error message
 * @param {Error} [error] - Error object
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(message, error = null) {
  const response = {
    status: 'error',
    message,
  };

  if (error && error.message) {
    response.error = error.message;
  }

  return response;
}

/**
 * Controller to create a new question
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with created question or error
 */
async function createQuestionController(req, res) {
  try {
    // Validate request body
    const validationResult = validateQuestionData(req.body);

    if (!validationResult.isValid) {
      return res.status(400).json(formatValidationErrorResponse(validationResult.errors));
    }

    // Create the question
    const createdQuestion = await createNewQuestion(req.body);

    // Return success response
    return res
      .status(201)
      .json(formatSuccessResponse('Question created successfully', createdQuestion));
  } catch (error) {
    logger.error('Error in createQuestionController:', error);
    return res
      .status(500)
      .json(formatErrorResponse('An error occurred while creating the question', error));
  }
}

/**
 * Controller to get a question by ID
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with question or error
 */
async function getQuestionController(req, res) {
  try {
    const { id } = req.params;

    // Get the question
    const question = await getQuestion(id);

    // Check if question exists
    if (!question) {
      return res.status(404).json(formatErrorResponse(`Question with ID ${id} not found`));
    }

    // Return success response
    return res.status(200).json(formatSuccessResponse('Question retrieved successfully', question));
  } catch (error) {
    logger.error(`Error in getQuestionController for ID ${req.params.id}:`, error);
    return res
      .status(500)
      .json(formatErrorResponse('An error occurred while retrieving the question', error));
  }
}

/**
 * Controller to update a question by ID
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated question or error
 */
async function updateQuestionController(req, res) {
  try {
    const { id } = req.params;

    // Validate request body
    const validationResult = validateQuestionData(req.body);

    if (!validationResult.isValid) {
      return res.status(400).json(formatValidationErrorResponse(validationResult.errors));
    }

    // Update the question
    const updatedQuestion = await updateQuestion(id, req.body);

    // Check if question exists
    if (!updatedQuestion) {
      return res.status(404).json(formatErrorResponse(`Question with ID ${id} not found`));
    }

    // Return success response
    return res
      .status(200)
      .json(formatSuccessResponse('Question updated successfully', updatedQuestion));
  } catch (error) {
    logger.error(`Error in updateQuestionController for ID ${req.params.id}:`, error);
    return res
      .status(500)
      .json(formatErrorResponse('An error occurred while updating the question', error));
  }
}

/**
 * Controller to delete a question by ID
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success or error
 */
async function deleteQuestionController(req, res) {
  try {
    const { id } = req.params;

    // Delete the question
    const isDeleted = await deleteQuestion(id);

    // Check if question was found and deleted
    if (!isDeleted) {
      return res.status(404).json(formatErrorResponse(`Question with ID ${id} not found`));
    }

    // Return success response
    return res
      .status(200)
      .json(formatSuccessResponse('Question deleted successfully', { success: true }));
  } catch (error) {
    logger.error(`Error in deleteQuestionController for ID ${req.params.id}:`, error);
    return res
      .status(500)
      .json(formatErrorResponse('An error occurred while deleting the question', error));
  }
}

module.exports = {
  createQuestionController,
  getQuestionController,
  updateQuestionController,
  deleteQuestionController,
};
