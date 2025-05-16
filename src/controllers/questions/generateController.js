/**
 * Generate Questions Controller
 * @module controllers/questions/generateController
 */

const { validateGenerateRequest } = require('../../utils/generateRequestValidator');
const { generateAndStoreQuestions } = require('../../services/questionGenerationService');
const { handleApiError } = require('../../utils/errorResponseHandler');

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
 * @param {Array} questionsWithMetadata - Array of generated questions with pagination
 * @returns {Object} Formatted success response
 */
const formatSuccessResponse = questionsWithMetadata => {
  return {
    status: 'success',
    message: 'Questions generated and saved.',
    data: questionsWithMetadata,
  };
};

/**
 * Controller to generate questions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with generated questions or error
 */
const generateQuestionsController = async (req, res) => {
  try {
    // 1. Validate the request body
    const validation = validateGenerateRequest(req.body);

    if (!validation.isValid) {
      return res.status(400).json(formatValidationErrorResponse(validation.errors));
    }

    // 2. Generate and store questions
    const questionsWithMetadata = await generateAndStoreQuestions(req.body);

    // 3. Respond to the client
    return res.status(200).json(formatSuccessResponse(questionsWithMetadata));
  } catch (error) {
    return handleApiError(error, req, res, 'Question Generation');
  }
};

module.exports = {
  generateQuestionsController,
  formatValidationErrorResponse,
  formatSuccessResponse,
};
