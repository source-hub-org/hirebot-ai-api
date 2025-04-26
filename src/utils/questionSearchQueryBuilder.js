/**
 * Question Search Query Builder Module
 * @module utils/questionSearchQueryBuilder
 */

/**
 * Builds MongoDB query parameters based on search criteria
 * @param {string} topic - Topic to search for
 * @param {string} language - Language to search for
 * @param {string} position - Position level to search for
 * @param {string} sortBy - Field to sort by
 * @param {string} sortDirection - Direction to sort (asc/desc)
 * @param {number} page - Page number
 * @param {number} pageSize - Number of items per page
 * @returns {Object} MongoDB query parameters
 */
function buildMongoQuery(topic, language, position, sortBy, sortDirection, page, pageSize) {
  // 1. Build filter
  const filter = {
    topic: { $regex: new RegExp(topic, 'i') }, // Case-insensitive search
    language: { $regex: new RegExp(language, 'i') }, // Case-insensitive search
  };

  // For position, we need to handle capitalization in the database
  // The first letter might be capitalized in the database
  const positionRegex = new RegExp(`^${position}$`, 'i');
  filter.position = { $regex: positionRegex };

  // 2. Build sort options
  let sortOptions = {};

  // Handle random sort separately
  if (sortBy === 'random') {
    // For random sorting, we use MongoDB's $sample aggregation
    // This will be handled differently in the service layer
    sortOptions = null; // We'll use a different approach for random sorting
  } else {
    // Standard sorting
    sortOptions[sortBy] = sortDirection === 'asc' ? 1 : -1;
  }

  // 3. Calculate pagination parameters
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  return { filter, sortOptions, skip, limit };
}

module.exports = {
  buildMongoQuery,
};
