/**
 * Error Response Handler
 * @module utils/errorResponseHandler
 */

const logger = require('./logger');

/**
 * Handles API error responses
 * @param {Error} error - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} context - Context where the error occurred
 * @returns {Object} - Express response
 */
const handleApiError = (error, req, res, context = 'API') => {
  logger.error(`Error in ${context}:`, error);

  // Log request metadata for easier debugging
  if (req.body) {
    const requestMetadata = {
      ...req.body,
      timestamp: new Date().toISOString(),
    };
    logger.error('Request metadata:', requestMetadata);
  }

  // Handle specific error types
  if (error.message.includes('Invalid generated content')) {
    // This is likely a JSON parsing or validation error
    return res.status(422).json({
      status: 'error',
      message: 'Failed to generate quiz questions.',
      details: 'The AI generated a response that could not be properly parsed as valid questions.',
      error: error.message,
    });
  }

  if (error.message.includes('Failed to generate content from Gemini API')) {
    return res.status(502).json({
      status: 'error',
      message: 'Failed to generate questions from AI.',
      details: 'The AI service encountered an error while processing your request.',
      error: error.message,
    });
  }

  if (error.message.includes('Database') || error.message.includes('MongoDB')) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save questions.',
      details: 'The questions were generated successfully but could not be saved to the database.',
      error: error.message,
    });
  }

  // Generic error response
  return res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred.',
    details: 'The server encountered an unexpected error while processing your request.',
    error: error.message,
  });
};

module.exports = {
  handleApiError,
};
