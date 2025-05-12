/**
 * Logic Question Get Service Module
 * @module service/logicQuestionGetService
 */

const {
  countLogicQuestions,
  getLogicQuestionById,
} = require('../repository/logicQuestionRepository');
const { isValidObjectId } = require('../utils/validateObjectId');
const {
  buildFilter,
  buildSortOptions,
  buildPaginationOptions,
} = require('../utils/logicQuestionQueryBuilder');
const {
  getQuestionsWithStandardSort,
  getQuestionsWithRandomSort,
  calculatePagination,
} = require('./logicQuestionQueryService');
const logger = require('../utils/logger');

/**
 * Get logic questions with filtering, sorting, and pagination
 * @async
 * @param {Object} queryParams - Query parameters for filtering
 * @returns {Promise<Object>} Result object with success flag, data, pagination, and errors
 */
async function getQuestions(queryParams = {}) {
  try {
    // Build filter, sort, and pagination options
    const filter = buildFilter(queryParams);
    const sortOptions = buildSortOptions(queryParams);
    const paginationOptions = buildPaginationOptions(queryParams);

    // Get total count for pagination
    const total = await countLogicQuestions(filter);

    // Get questions based on sort type
    let questions;
    if (queryParams.sort_by === 'random') {
      questions = await getQuestionsWithRandomSort(filter, paginationOptions);
    } else {
      questions = await getQuestionsWithStandardSort(filter, sortOptions, paginationOptions);
    }

    // Calculate pagination info
    const pagination = calculatePagination(total, paginationOptions);

    logger.info(`Retrieved ${questions.length} logic questions (total: ${total})`);

    return {
      success: true,
      data: questions,
      pagination,
    };
  } catch (error) {
    logger.error('Error retrieving logic questions:', error);
    return {
      success: false,
      errors: [error.message],
    };
  }
}

/**
 * Get logic question by ID
 * @async
 * @param {string} id - Question ID
 * @returns {Promise<Object>} Result object with success flag, data, and errors
 */
async function getQuestionById(id) {
  try {
    // Validate ID format
    if (!isValidObjectId(id)) {
      logger.warn(`Invalid logic question ID format: ${id}`);
      return {
        success: false,
        errors: ['Invalid question ID format'],
      };
    }

    const question = await getLogicQuestionById(id);

    if (!question) {
      logger.warn(`Logic question with ID ${id} not found`);
      return {
        success: false,
        errors: ['Question not found'],
      };
    }

    logger.info(`Retrieved logic question with ID ${id}`);
    return {
      success: true,
      data: question,
    };
  } catch (error) {
    logger.error(`Error retrieving logic question with ID ${id}:`, error);
    return {
      success: false,
      errors: [error.message],
    };
  }
}

module.exports = {
  getQuestions,
  getQuestionById,
};
