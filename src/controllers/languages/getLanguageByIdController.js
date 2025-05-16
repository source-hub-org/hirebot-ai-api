/**
 * Get Language By ID Controller
 * @module controllers/languages/getLanguageByIdController
 */

const { getLanguageByIdService } = require('../../services/languageService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful language retrieval
 * @param {Object} language - Language object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = language => {
  return {
    status: 'success',
    data: language,
  };
};

/**
 * Formats the response for error in language retrieval
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'Failed to retrieve language.',
    error: error.message,
  };
};

/**
 * Controller to get a language by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with language or error
 */
const getLanguageByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const language = await getLanguageByIdService(id);

    if (!language) {
      return res.status(404).json({
        status: 'error',
        message: `Language with ID ${id} not found.`,
      });
    }

    return res.status(200).json(formatSuccessResponse(language));
  } catch (error) {
    logger.error(`Error retrieving language with ID ${req.params.id}:`, error);
    return res.status(500).json(formatErrorResponse(error));
  }
};

module.exports = {
  getLanguageByIdController,
  formatSuccessResponse,
  formatErrorResponse,
};
