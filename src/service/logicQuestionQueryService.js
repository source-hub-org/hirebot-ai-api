/**
 * Logic Question Query Service Module
 * @module service/logicQuestionQueryService
 */

const { getLogicQuestions, countLogicQuestions } = require('../repository/logicQuestionRepository');
const {
  buildFilter,
  buildSortOptions,
  buildPaginationOptions,
} = require('../utils/logicQuestionQueryBuilder');
const { getRandomDocuments } = require('../utils/randomSortingUtils');
const logger = require('../utils/logger');

/**
 * Get logic questions with standard sorting
 * @async
 * @param {Object} filter - MongoDB filter
 * @param {Object} sortOptions - MongoDB sort options
 * @param {Object} paginationOptions - Pagination options
 * @returns {Promise<Array<Object>>} Array of question documents
 */
async function getQuestionsWithStandardSort(filter, sortOptions, paginationOptions) {
  const { skip, limit, page_size } = paginationOptions;
  const itemsPerPage = page_size || limit; // Use page_size, fall back to limit
  return await getLogicQuestions(filter, {
    sort: sortOptions,
    skip,
    limit: itemsPerPage,
  });
}

/**
 * Get logic questions with random sorting
 * @async
 * @param {Object} filter - MongoDB filter
 * @param {Object} paginationOptions - Pagination options
 * @returns {Promise<Array<Object>>} Array of randomly sorted question documents
 */
async function getQuestionsWithRandomSort(filter, paginationOptions) {
  try {
    // Get the MongoDB collection directly for more efficient random sorting
    const LogicQuestion = require('../models/logicQuestionModel');
    const collection = LogicQuestion.collection;

    // Get random documents
    const randomDocs = await getRandomDocuments(collection, filter, paginationOptions);

    // Convert raw documents to Mongoose documents and populate tags
    // This is needed because we're bypassing Mongoose's find() method
    const LogicQuestionModel = require('../models/logicQuestionModel');
    const populatedDocs = [];

    for (const doc of randomDocs) {
      const questionDoc = new LogicQuestionModel(doc);
      // We need to manually populate the tags since we're using the raw collection
      await LogicQuestionModel.populate(questionDoc, { path: 'tag_ids', select: 'name slug' });
      populatedDocs.push(questionDoc);
    }

    return populatedDocs;
  } catch (error) {
    logger.error('Error getting questions with random sort:', error);
    return [];
  }
}

/**
 * Calculate pagination information
 * @param {number} total - Total number of documents
 * @param {Object} paginationOptions - Pagination options
 * @returns {Object} Pagination information
 */
function calculatePagination(total, paginationOptions) {
  const { page, limit, page_size } = paginationOptions;
  const itemsPerPage = page_size || limit; // Use page_size, fall back to limit
  const total_pages = Math.ceil(total / itemsPerPage);

  return {
    total,
    page,
    page_size: itemsPerPage,
    total_pages,
    hasNextPage: page < total_pages,
    hasPrevPage: page > 1,
  };
}

module.exports = {
  getQuestionsWithStandardSort,
  getQuestionsWithRandomSort,
  calculatePagination,
};
