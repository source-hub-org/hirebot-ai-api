/**
 * Update Language Controller
 * @module controllers/languages/updateLanguageController
 */

const { updateLanguageService } = require('../../service/languageService');
const { validateLanguage } = require('../../utils/languageValidator');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful language update
 * @param {Object} language - Updated language object
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = language => {
  return {
    status: 'success',
    message: 'Language updated successfully.',
    data: language,
  };
};

/**
 * Formats the response for error in language update
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'Failed to update language.',
    error: error.message,
  };
};

/**
 * Controller to update a language by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated language or error
 */
const updateLanguageController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validation = validateLanguage({ ...req.body, _id: id });
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid language data.',
        errors: validation.errors,
      });
    }

    // Update language
    const language = await updateLanguageService(id, req.body);

    if (!language) {
      return res.status(404).json({
        status: 'error',
        message: `Language with ID ${id} not found.`,
      });
    }

    return res.status(200).json(formatSuccessResponse(language));
  } catch (error) {
    logger.error(`Error updating language with ID ${req.params.id}:`, error);

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
  updateLanguageController,
  formatSuccessResponse,
  formatErrorResponse,
};
