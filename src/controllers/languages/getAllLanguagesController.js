/**
 * Get All Languages Controller
 * @module controllers/languages/getAllLanguagesController
 */

const { getAllLanguagesService } = require('../../service/languageService');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful languages retrieval
 * @param {Array} languages - Array of language objects
 * @param {Object} metadata - Metadata about the query results
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = (languages, metadata = {}) => {
  return {
    status: 'success',
    data: languages,
    metadata,
  };
};

/**
 * Formats the response for error in languages retrieval
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'Failed to retrieve languages.',
    error: error.message,
  };
};

/**
 * Controller to get all languages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with languages or error
 */
const getAllLanguagesController = async (req, res) => {
  try {
    const { languages, totalCount } = await getAllLanguagesService(req.query);

    // Calculate metadata for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const metadata = {
      page: page,
      limit: limit,
      total: totalCount,
      total_pages: Math.ceil(totalCount / limit),
    };

    return res.status(200).json(formatSuccessResponse(languages, metadata));
  } catch (error) {
    logger.error('Error retrieving languages:', error);
    return res.status(500).json(formatErrorResponse(error));
  }
};

module.exports = {
  getAllLanguagesController,
  formatSuccessResponse,
  formatErrorResponse,
};
