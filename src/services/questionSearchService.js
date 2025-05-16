/**
 * Question Search Service Module
 * @module service/questionSearchService
 */

const { findMany, getCollection } = require('../repository/baseRepository');
const { buildMongoQuery, convertToObjectIds } = require('../utils/questionSearchQueryBuilder');
const logger = require('../utils/logger');

/**
 * Search for questions based on provided criteria
 * @async
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.topic - Topic to search for
 * @param {string} searchParams.topic_id - Topic ID to search for
 * @param {string} searchParams.language - Language to search for
 * @param {string} searchParams.language_id - Language ID to search for
 * @param {string} searchParams.position - Position level to search for
 * @param {string} searchParams.position_id - Position ID to search for
 * @param {string} searchParams.sort_by - Field to sort by (can be 'random' for random sorting)
 * @param {string} searchParams.sort_direction - Direction to sort (asc/desc)
 * @param {number} searchParams.page - Page number
 * @param {number} searchParams.page_size - Number of items per page
 * @param {string} searchParams.mode - Response mode ('full', 'compact', or 'minimalist')
 * @param {string[]} searchParams.ignore_question_ids - Array of question IDs to exclude from results
 * @returns {Promise<Object>} Search results with pagination information
 */
async function searchQuestions(searchParams) {
  try {
    const {
      topic,
      topic_id,
      language,
      language_id,
      position,
      position_id,
      sort_by = 'random', // Default to random sorting if not specified
      sort_direction,
      page,
      page_size,
      mode = 'full', // Default to full mode if not specified
      ignore_question_ids = [], // Default to empty array if not specified
    } = searchParams;

    // Build the MongoDB query
    const { filter, sortOptions, skip, limit } = buildMongoQuery(
      topic,
      topic_id,
      language,
      language_id,
      position,
      position_id,
      sort_by,
      sort_direction,
      page,
      page_size
    );

    // Add filter to exclude questions with IDs in ignore_question_ids
    if (ignore_question_ids.length > 0) {
      try {
        // Convert string IDs to ObjectId and filter out any invalid IDs
        const validObjectIds = convertToObjectIds(
          Array.isArray(ignore_question_ids) ? ignore_question_ids.join(',') : ignore_question_ids
        );

        if (validObjectIds.length > 0) {
          // If we have $and conditions, add the exclusion as another condition
          if (filter.$and) {
            filter.$and.push({ _id: { $nin: validObjectIds } });
          } else {
            // Otherwise, add it directly to the filter
            filter._id = { $nin: validObjectIds };
          }
        }
      } catch (error) {
        logger.warn('Error processing ignore_question_ids:', error);
        // Continue without this filter if there's an error
      }
    }

    // Get collection for operations
    const collection = getCollection('questions');

    let questions;

    // Handle random sorting differently using aggregation pipeline
    if (sort_by === 'random') {
      // For random sorting with pagination, we need a different approach
      // First, get the total count of matching documents
      const totalMatchingCount = await collection.countDocuments(filter);

      // If we're requesting a page beyond what's available, return empty results
      if (skip >= totalMatchingCount) {
        questions = [];
      } else {
        // For random sorting, we'll get all matching documents and then randomly select a subset
        // This is more efficient for smaller collections
        if (totalMatchingCount <= 1000) {
          // Only use this approach for reasonably sized collections
          // Get all matching documents
          const allMatchingDocs = await collection.find(filter).toArray();

          // Shuffle the array (Fisher-Yates algorithm)
          for (let i = allMatchingDocs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allMatchingDocs[i], allMatchingDocs[j]] = [allMatchingDocs[j], allMatchingDocs[i]];
          }

          // Apply pagination to the shuffled array
          questions = allMatchingDocs.slice(skip, skip + limit);
        } else {
          // For larger collections, use the $sample aggregation but with a larger sample size
          // and then apply pagination in memory
          // This is less ideal but more practical for very large collections
          const sampleSize = Math.min(limit * 10, totalMatchingCount); // Get a larger sample than needed
          const pipeline = [{ $match: filter }, { $sample: { size: sampleSize } }];

          const randomSample = await collection.aggregate(pipeline).toArray();

          // Apply pagination to the random sample
          // Note: This is not perfect pagination for random sorting but a reasonable compromise
          questions = randomSample.slice(0, limit);
        }
      }
    } else {
      // Execute the standard query with pagination
      questions = await findMany('questions', filter, {
        sort: sortOptions,
        skip,
        limit,
      });
    }

    // Get total count for pagination info
    const totalCount = await collection.countDocuments(filter);

    // Calculate pagination information
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
