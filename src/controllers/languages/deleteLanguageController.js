/**
 * Delete Language Controller
 * @module controllers/languages/deleteLanguageController
 */

const { deleteLanguageService } = require('../../service/languageService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful language deletion
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = () => {
  return {
    status: 'success',
    message: 'Language deleted successfully.',
  };
};

/**
 * Formats the response for error in language deletion
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'Failed to delete language.',
    error: error.message,
  };
};

/**
 * Controller to delete a language by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
const deleteLanguageController = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteLanguageService(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: `Language with ID ${id} not found.`,
      });
    }

    return res.status(200).json(formatSuccessResponse());
  } catch (error) {
    logger.error(`Error deleting language with ID ${req.params.id}:`, error);
    return res.status(500).json(formatErrorResponse(error));
  }
};

module.exports = {
  deleteLanguageController,
  formatSuccessResponse,
  formatErrorResponse,
};
