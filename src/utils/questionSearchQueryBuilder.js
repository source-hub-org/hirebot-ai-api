/**
 * Question Search Query Builder Module
 * @module utils/questionSearchQueryBuilder
 */

/**
 * Builds MongoDB query parameters based on search criteria
 * @param {string|undefined} topic - Topic(s) to search for (comma-separated)
 * @param {string|undefined} language - Language(s) to search for (comma-separated)
 * @param {string|undefined} position - Position level(s) to search for (comma-separated)
 * @param {string} sortBy - Field to sort by
 * @param {string} sortDirection - Direction to sort (asc/desc)
 * @param {number} page - Page number
 * @param {number} pageSize - Number of items per page
 * @returns {Object} MongoDB query parameters
 */
function buildMongoQuery(topic, language, position, sortBy, sortDirection, page, pageSize) {
  // 1. Build filter
  const filter = {};

  // Handle topic parameter (optional, can be multiple comma-separated values)
  if (topic) {
    const topics = topic.split(',').map(t => t.trim());
    if (topics.length === 1) {
      filter.topic = { $regex: new RegExp(topics[0], 'i') }; // Case-insensitive search
    } else if (topics.length > 1) {
      filter.topic = {
        $in: topics.map(t => new RegExp(t, 'i')), // Array of case-insensitive regexes
      };
    }
  }

  // Handle language parameter (optional, can be multiple comma-separated values)
  if (language) {
    const languages = language.split(',').map(l => l.trim());
    if (languages.length === 1) {
      filter.language = { $regex: new RegExp(languages[0], 'i') }; // Case-insensitive search
    } else if (languages.length > 1) {
      filter.language = {
        $in: languages.map(l => new RegExp(l, 'i')), // Array of case-insensitive regexes
      };
    }
  }

  // Handle position parameter (optional, can be multiple comma-separated values)
  if (position) {
    const positions = position.split(',').map(p => p.trim());
    if (positions.length === 1) {
      // For position, we need to handle capitalization in the database
      // The first letter might be capitalized in the database
      const positionRegex = new RegExp(`^${positions[0]}$`, 'i');
      filter.position = { $regex: positionRegex };
    } else if (positions.length > 1) {
      filter.position = {
        $in: positions.map(p => new RegExp(`^${p}$`, 'i')), // Array of case-insensitive regexes
      };
    }
  }

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
