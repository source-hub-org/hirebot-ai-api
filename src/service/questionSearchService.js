/**
 * Question Search Service Module
 * @module service/questionSearchService
 */

const { findMany, getCollection } = require('@repository/baseRepository');
const { buildMongoQuery } = require('@utils/questionSearchQueryBuilder');
const logger = require('@utils/logger');

/**
 * Search for questions based on provided criteria
 * @async
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.topic - Topic to search for
 * @param {string} searchParams.language - Language to search for
 * @param {string} searchParams.position - Position level to search for
 * @param {string} searchParams.sort_by - Field to sort by
 * @param {string} searchParams.sort_direction - Direction to sort (asc/desc)
 * @param {number} searchParams.page - Page number
 * @param {number} searchParams.page_size - Number of items per page
 * @returns {Promise<Object>} Search results with pagination metadata
 */
async function searchQuestions(searchParams) {
  try {
    const { topic, language, position, sort_by, sort_direction, page, page_size } = searchParams;

    // Build the MongoDB query
    const { filter, sortOptions, skip, limit } = buildMongoQuery(
      topic,
      language,
      position,
      sort_by,
      sort_direction,
      page,
      page_size
    );

    // Execute the query with pagination
    const questions = await findMany('questions', filter, {
      sort: sortOptions,
      skip,
      limit,
    });

    // Get total count for pagination info
    const collection = getCollection('questions');
    const totalCount = await collection.countDocuments(filter);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    return {
      questions,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        page_size: parseInt(page_size),
        total_pages: totalPages,
      },
    };
  } catch (error) {
    logger.error('Error in searchQuestions service:', error);
    throw error;
  }
}

module.exports = {
  searchQuestions,
};
