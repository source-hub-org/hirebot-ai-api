/**
 * Instrument Query Builder Module
 * @module utils/instrumentQueryBuilder
 */

const { ObjectId } = require('mongoose').Types;
const logger = require('./logger');

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} True if the ID is a valid MongoDB ObjectId
 */
function isValidObjectId(id) {
  try {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
  } catch (error) {
    return false;
  }
}

/**
 * Parses a comma-separated string of IDs into an array of valid MongoDB ObjectIds
 * @param {string} idsString - Comma-separated string of IDs
 * @returns {Array<ObjectId>} Array of valid MongoDB ObjectIds
 */
function parseObjectIds(idsString) {
  if (!idsString) return [];

  return idsString
    .split(',')
    .map(id => id.trim())
    .filter(id => isValidObjectId(id))
    .map(id => new ObjectId(id));
}

/**
 * Builds a MongoDB query filter based on the provided parameters
 * @param {Object} queryParams - Query parameters
 * @param {string} [queryParams.type] - Instrument type
 * @param {string} [queryParams.instrument_tags] - Comma-separated list of tag IDs
 * @param {string} [queryParams.ignore_instrument_ids] - Comma-separated list of instrument IDs to exclude
 * @returns {Object} MongoDB query filter
 */
function buildFilter(queryParams) {
  const filter = {};

  // Filter by type
  if (queryParams.type) {
    filter.type = queryParams.type;
  }

  // Filter by tags
  if (queryParams.instrument_tags) {
    const tagIds = parseObjectIds(queryParams.instrument_tags);
    if (tagIds.length > 0) {
      filter.tags = { $in: tagIds };
    }
  }

  // Exclude specific instrument IDs
  if (queryParams.ignore_instrument_ids) {
    const ignoreIds = parseObjectIds(queryParams.ignore_instrument_ids);
    if (ignoreIds.length > 0) {
      filter._id = { $nin: ignoreIds };
    }
  }

  return filter;
}

/**
 * Builds sort options based on the provided parameters
 * @param {Object} queryParams - Query parameters
 * @param {string} [queryParams.sort_by] - Field to sort by
 * @param {string} [queryParams.sort_direction] - Sort direction (asc/desc)
 * @returns {Object|null} MongoDB sort options or null for random sorting
 */
function buildSortOptions(queryParams) {
  // Handle random sort separately
  if (queryParams.sort_by === 'random') {
    return null;
  }

  // Build standard sort options
  const sortOptions = {};
  if (queryParams.sort_by) {
    sortOptions[queryParams.sort_by] = queryParams.sort_direction === 'asc' ? 1 : -1;
  } else {
    sortOptions.createdAt = -1; // Default sort by creation date, newest first
  }

  return sortOptions;
}

/**
 * Builds pagination options based on the provided parameters
 * @param {Object} queryParams - Query parameters
 * @param {number} [queryParams.page=1] - Page number
 * @param {number} [queryParams.limit=10] - Number of items per page
 * @returns {Object} Pagination options with skip and limit
 */
function buildPaginationOptions(queryParams) {
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Builds MongoDB query parameters based on the provided query parameters
 * @param {Object} queryParams - Query parameters
 * @returns {Object} MongoDB query parameters
 */
function buildMongoQuery(queryParams = {}) {
  const filter = buildFilter(queryParams);
  const sortOptions = buildSortOptions(queryParams);
  const { page, limit, skip } = buildPaginationOptions(queryParams);

  return { filter, sortOptions, page, limit, skip };
}

module.exports = {
  buildMongoQuery,
  parseObjectIds,
  isValidObjectId,
};
