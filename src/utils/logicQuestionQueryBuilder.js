/**
 * Logic Question Query Builder Module
 * @module utils/logicQuestionQueryBuilder
 */

const { isValidObjectId } = require('./validateObjectId');
const logger = require('./logger');
const { Types } = require('mongoose');
const { ObjectId } = Types;

/**
 * Parse a comma-separated string of ObjectIds into an array of valid ObjectIds
 * @param {string} idsString - Comma-separated string of ObjectIds
 * @returns {Array<ObjectId>} Array of valid ObjectIds
 */
function parseObjectIds(idsString) {
  if (!idsString || typeof idsString !== 'string') {
    return [];
  }

  try {
    return idsString
      .split(',')
      .map(id => id.trim())
      .filter(id => id && isValidObjectId(id))
      .map(id => new ObjectId(id));
  } catch (error) {
    logger.warn('Error parsing ObjectIds:', error);
    return [];
  }
}

/**
 * Build MongoDB filter for logic questions based on query parameters
 * @param {Object} queryParams - Query parameters
 * @param {number|string} [queryParams.level] - Difficulty level
 * @param {string} [queryParams.tag_id] - Tag ID
 * @param {string} [queryParams.type] - Question type
 * @param {string} [queryParams.ignore_question_ids] - Comma-separated list of question IDs to exclude
 * @returns {Object} MongoDB query filter
 */
function buildFilter(queryParams) {
  const filter = {};

  // Apply level filter if provided
  if (queryParams.level !== undefined) {
    const levelNum = parseInt(queryParams.level, 10);
    if (!isNaN(levelNum) && levelNum >= 1 && levelNum <= 6) {
      filter.level = levelNum;
    }
  }

  // Apply tag filter if provided
  if (queryParams.tag_id && isValidObjectId(queryParams.tag_id)) {
    // Convert to ObjectId and use $in operator to match documents where tag_ids array contains this ID
    filter.tag_ids = { $in: [new ObjectId(queryParams.tag_id)] };
  }

  // Apply type filter if provided
  if (queryParams.type && ['multiple_choice', 'open_question'].includes(queryParams.type)) {
    filter.type = queryParams.type;
  }

  // Exclude specific question IDs if provided
  if (queryParams.ignore_question_ids) {
    const ignoreIds = parseObjectIds(queryParams.ignore_question_ids);
    if (ignoreIds.length > 0) {
      filter._id = { $nin: ignoreIds };
    }
  }

  return filter;
}

/**
 * Build MongoDB sort options based on query parameters
 * @param {Object} queryParams - Query parameters
 * @param {string} [queryParams.sort_by] - Field to sort by
 * @param {string} [queryParams.sort_direction] - Sort direction (asc/desc)
 * @returns {Object|null} MongoDB sort options or null for random sorting
 */
function buildSortOptions(queryParams) {
  // Handle random sort separately
  if (queryParams.sort_by === 'random') {
    logger.info('Using random sorting');
    return null;
  }

  // Determine sort direction
  const sortDirection = queryParams.sort_direction === 'asc' ? 1 : -1;

  const sortOptions = {};
  if (queryParams.sort_by) {
    // Use the specified sort field
    sortOptions[queryParams.sort_by] = sortDirection;
    logger.info(
      `Sorting by ${queryParams.sort_by} in ${queryParams.sort_direction || 'desc'} order`
    );
  } else {
    // Default sort by creation date
    sortOptions.createdAt = sortDirection;
    logger.info(`Sorting by createdAt in ${queryParams.sort_direction || 'desc'} order`);
  }

  return sortOptions;
}

/**
 * Build pagination options based on query parameters
 * @param {Object} queryParams - Query parameters
 * @param {number|string} [queryParams.page] - Page number
 * @param {number|string} [queryParams.limit] - Items per page
 * @returns {Object} Pagination options with skip and limit
 */
function buildPaginationOptions(queryParams) {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

module.exports = {
  parseObjectIds,
  buildFilter,
  buildSortOptions,
  buildPaginationOptions,
};
