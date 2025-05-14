/**
 * Random Sorting Utilities Module
 * @module utils/randomSortingUtils
 */

const logger = require('./logger');

/**
 * Shuffle an array using the Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random documents from MongoDB collection with pagination
 * @async
 * @param {Object} collection - MongoDB collection
 * @param {Object} filter - MongoDB filter
 * @param {Object} options - Query options
 * @param {number} options.skip - Number of documents to skip
 * @param {number} options.page_size - Maximum number of documents to return (preferred)
 * @param {number} options.limit - Maximum number of documents to return (legacy)
 * @returns {Promise<Array<Object>>} Array of randomly sorted documents
 */
async function getRandomDocuments(collection, filter, options) {
  try {
    const { skip, limit, page_size } = options;
    const itemsPerPage = page_size || limit; // Use page_size, fall back to limit
    const totalCount = await collection.countDocuments(filter);

    if (totalCount === 0) {
      return [];
    }

    // For smaller collections (up to 1000 documents), get all and shuffle in memory
    if (totalCount <= 1000) {
      const allDocuments = await collection.find(filter).toArray();
      const shuffled = shuffleArray(allDocuments);

      // Apply pagination to the shuffled results
      return shuffled.slice(skip, skip + itemsPerPage);
    }

    // For larger collections, use MongoDB's $sample aggregation
    // Note: This is less efficient for pagination but works for larger datasets
    return await collection
      .aggregate([{ $match: filter }, { $sample: { size: itemsPerPage } }])
      .toArray();
  } catch (error) {
    logger.error('Error getting random documents:', error);
    return [];
  }
}

module.exports = {
  shuffleArray,
  getRandomDocuments,
};
