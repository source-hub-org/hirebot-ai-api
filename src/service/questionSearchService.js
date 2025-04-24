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
 * @param {string} searchParams.mode - Response mode ('full' or 'compact')
 * @returns {Promise<Object>} Search results with pagination metadata
 */
async function searchQuestions(searchParams) {
  try {
    const {
      topic,
      language,
      position,
      sort_by,
      sort_direction,
      page,
      page_size,
      mode = 'full', // Default to full mode if not specified
    } = searchParams;

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

    // Process questions based on mode
    let processedQuestions = questions;
    if (mode === 'compact') {
      // Remove correctAnswer and explanation fields in compact mode
      processedQuestions = questions.map(question => {
        const { correctAnswer, explanation, ...rest } = question;
        return rest;
      });
    } else if (mode === 'minimalist') {
      // Only include the question field in minimalist mode
      processedQuestions = questions.map(question => {
        return {
          _id: question._id,
          question: question.question,
        };
      });
    }

    return {
      questions: processedQuestions,
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
