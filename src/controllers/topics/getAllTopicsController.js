/**
 * Get All Topics Controller
 * @module controllers/topics/getAllTopicsController
 */

const { getAllTopics } = require('../../repository/topicRepository');
const logger = require('../../utils/logger');

/**
 * Formats the response for successful topic retrieval
 * @param {Array} topics - Array of topic objects
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = topics => {
  return {
    status: 'success',
    data: topics,
  };
};

/**
 * Formats the response for error in topic retrieval
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response object
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'Failed to retrieve topics.',
    error: error.message,
  };
};

/**
 * Controller to get all topics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with topics or error
 */
const getAllTopicsController = async (req, res) => {
  try {
    const topics = await getAllTopics();
    return res.status(200).json(formatSuccessResponse(topics));
  } catch (error) {
    logger.error('Error retrieving topics:', error);
    return res.status(500).json(formatErrorResponse(error));
  }
};

module.exports = {
  getAllTopicsController,
  formatSuccessResponse,
  formatErrorResponse,
};
