/**
 * Question Request Controller
 * @module controllers/questions/requestController
 */

const { processQuestionRequest } = require('../../services/questionRequestService');
const logger = require('../../utils/logger');

/**
 * Validates request parameters for question requests
 * @param {Object} body - Request body
 * @returns {Object} - Validation result with isValid flag and errors array
 */
const validateRequestParams = body => {
  const { topics, limit, position, language } = body;
  const errors = [];

  // Validate topics if provided
  if (topics !== undefined && !Array.isArray(topics)) {
    errors.push('Topics must be an array');
  }

  // Validate limit if provided
  if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
    errors.push('Limit must be a positive integer');
  }

  // Validate position (required)
  const validPositions = ['intern', 'fresher', 'junior', 'middle', 'senior', 'expert'];
  if (!position) {
    errors.push('Position is required');
  } else if (!validPositions.includes(position.toLowerCase())) {
    errors.push(`Position must be one of: ${validPositions.join(', ')}`);
  }

  // Validate language (required)
  if (!language || typeof language !== 'string') {
    errors.push('Language is required and must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Formats the job data for response
 * @param {Array} jobs - Array of job objects
 * @returns {Object} Formatted job data
 */
const formatJobsResponse = jobs => {
  return {
    jobCount: jobs.length,
    jobs: jobs.map(job => ({
      _id: job._id,
      type: job.type,
      status: job.status,
      createdAt: job.createdAt,
    })),
  };
};

/**
 * Formats the success response
 * @param {Array} jobs - Array of job objects
 * @returns {Object} Formatted success response
 */
const formatSuccessResponse = jobs => {
  return {
    success: true,
    message: `Created ${jobs.length} question request jobs`,
    data: formatJobsResponse(jobs),
  };
};

/**
 * Formats the error response
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response
 */
const formatErrorResponse = error => {
  return {
    success: false,
    message: 'Failed to process question request',
    error: error.message,
  };
};

/**
 * Formats the validation error response
 * @param {string} errorMessage - Error message
 * @returns {Object} Formatted validation error response
 */
const formatValidationErrorResponse = errorMessage => {
  return {
    success: false,
    message: errorMessage,
  };
};

/**
 * Controller to process question request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with jobs or error
 */
const processQuestionRequestController = async (req, res) => {
  try {
    // Validate request parameters
    const validation = validateRequestParams(req.body);

    if (!validation.isValid) {
      return res.status(400).json(formatValidationErrorResponse(validation.errors[0]));
    }

    const { topics, limit, position, language } = req.body;
    const jobs = await processQuestionRequest({ topics, limit, position, language });

    return res.status(200).json(formatSuccessResponse(jobs));
  } catch (error) {
    logger.error('Error in question request controller:', error);
    return res.status(500).json(formatErrorResponse(error));
  }
};

module.exports = {
  processQuestionRequestController,
  validateRequestParams,
  formatJobsResponse,
  formatSuccessResponse,
  formatErrorResponse,
  formatValidationErrorResponse,
};
