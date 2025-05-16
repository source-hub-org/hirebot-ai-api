/**
 * Create Language Controller
 * @module controllers/languages/createLanguageController
 */

const { createLanguageService } = require('../../services/languageService');
const { validateLanguage } = require('../../utils/languageValidator');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful language creation
 * @param {Object} language - Created language object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = language => {
  return {
    status: 'success',
    message: 'Language created successfully.',
    data: language,
  };
};

/**
 * Formats the response for error in language creation
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'Failed to create language.',
    error: error.message,
  };
};

/**
 * Controller to create a new language
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with created language or error
 */
const createLanguageController = async (req, res) => {
  try {
    // Validate request body
    const validation = validateLanguage(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid language data.',
        errors: validation.errors,
      });
    }

    // Create language
    const language = await createLanguageService(req.body);
    return res.status(201).json(formatSuccessResponse(language));
  } catch (error) {
    logger.error('Error creating language:', error);

    // Handle duplicate key errors
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        status: 'error',
        message: error.message,
      });
    }

    return res.status(500).json(formatErrorResponse(error));
  }
};

module.exports = {
  createLanguageController,
  formatSuccessResponse,
  formatErrorResponse,
};
